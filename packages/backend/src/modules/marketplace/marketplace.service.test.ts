import { ChestType } from "@pixegotchi/shared";
import { describe, expect, it } from "vitest";
import { prisma } from "@/database/prisma";
import type { Prisma } from "@/generated/prisma/client";
import {
  createChest,
  createEgg,
  createItem,
  createPixegotchi,
  createUser,
} from "@/test/helpers/factories";
import { MarketplaceService } from "./marketplace.service";

const createTradableCosmetic = (
  overrides: Partial<Prisma.CosmeticAssetUncheckedCreateInput> = {},
) =>
  prisma.cosmeticAsset.create({
    data: {
      id: "marketplace-test-blue-sofa",
      name: "Marketplace test blue sofa",
      slot: "sofa",
      rarity: "common",
      assetUrl: "assets/room/furniture/blue-sofa.png",
      allowedPositions: [8],
      span: 1,
      allowOverlap: false,
      isDefault: false,
      isLimited: false,
      isTradable: true,
      isPurchasable: false,
      isChestReward: false,
      chestDropWeight: 0,
      isActive: true,
      ...overrides,
    },
  });

describe("MarketplaceService", () => {
  it("creates two purchase and commission records for a 4 + 1 item sale", async () => {
    const seller = await createUser({ pgcBalance: 100 });
    const buyer = await createUser({ pgcBalance: 1_000 });
    const item = await createItem({
      itemId: "market-apple",
      isTradable: true,
    });
    await prisma.inventory.create({
      data: {
        userId: seller.id,
        itemId: item.itemId,
        itemType: item.itemType,
        rarity: item.rarity,
        quantity: 5,
      },
    });
    const service = new MarketplaceService();

    const listing = await service.createListing(seller.id, {
      listingType: "item",
      itemId: item.itemId,
      quantity: 5,
      unitPrice: "100",
      currency: "pgc",
    });
    const firstPurchase = await service.buyListing(buyer.id, listing.id, 4);
    const secondPurchase = await service.buyListing(buyer.id, listing.id, 1);

    expect(firstPurchase).toMatchObject({
      listing: { remainingQuantity: 1, status: "active" },
      purchase: {
        quantity: 4,
        subtotal: "400",
        commissionAmount: "20",
        sellerProceeds: "380",
      },
      pgcBalance: "600",
    });
    expect(secondPurchase).toMatchObject({
      listing: { remainingQuantity: 0, status: "sold" },
      purchase: {
        quantity: 1,
        subtotal: "100",
        commissionAmount: "5",
        sellerProceeds: "95",
      },
      pgcBalance: "500",
    });
    const updatedSeller = await prisma.user.findUniqueOrThrow({
      where: { id: seller.id },
    });
    expect(updatedSeller.pgcBalance.toString()).toBe("575");
    await expect(
      prisma.inventory.findUniqueOrThrow({
        where: {
          userId_itemId: {
            userId: buyer.id,
            itemId: item.itemId,
          },
        },
      }),
    ).resolves.toMatchObject({ quantity: 5 });
    await expect(prisma.marketplacePurchase.count()).resolves.toBe(2);
    const treasury =
      await prisma.marketplaceTreasuryBalance.findUniqueOrThrow({
        where: { currency: "pgc" },
      });
    expect(treasury.balance.toString()).toBe("25");
    await expect(
      prisma.marketplaceTreasuryTransaction.count({
        where: { transactionType: "commission" },
      }),
    ).resolves.toBe(2);
  });

  it("reserves chest rows, transfers part of the stack, and releases the rest", async () => {
    const seller = await createUser();
    const buyer = await createUser();
    await Promise.all(
      Array.from({ length: 5 }, () =>
        createChest(seller.id, { chestType: ChestType.crystal }),
      ),
    );
    const service = new MarketplaceService();

    const listing = await service.createListing(seller.id, {
      listingType: "chest",
      chestType: ChestType.crystal,
      quantity: 5,
      unitPrice: "10",
      currency: "pgc",
    });
    await service.buyListing(buyer.id, listing.id, 4);

    await expect(
      prisma.chest.count({
        where: { userId: buyer.id, chestType: ChestType.crystal },
      }),
    ).resolves.toBe(4);
    await expect(
      prisma.chest.count({
        where: {
          userId: seller.id,
          marketplaceListingId: listing.id,
        },
      }),
    ).resolves.toBe(1);

    await service.cancelListing(seller.id, listing.id);

    await expect(
      prisma.chest.count({
        where: {
          userId: seller.id,
          chestType: ChestType.crystal,
          marketplaceListingId: null,
        },
      }),
    ).resolves.toBe(1);
    await expect(
      prisma.marketplaceListing.findUniqueOrThrow({
        where: { id: listing.id },
      }),
    ).resolves.toMatchObject({
      status: "cancelled",
      remainingQuantity: 0,
    });
  });

  it("rejects a hatching Egg and transfers an eligible Egg", async () => {
    const seller = await createUser();
    const buyer = await createUser();
    const hatchingEgg = await createEgg(seller.id, { isHatching: true });
    const sellableEgg = await createEgg(seller.id);
    const service = new MarketplaceService();

    await expect(
      service.createListing(seller.id, {
        listingType: "egg",
        eggId: hatchingEgg.id,
        unitPrice: "25",
        currency: "pgc",
      }),
    ).rejects.toMatchObject({ statusCode: 409 });

    const listing = await service.createListing(seller.id, {
      listingType: "egg",
      eggId: sellableEgg.id,
      unitPrice: "25",
      currency: "pgc",
    });
    await service.buyListing(buyer.id, listing.id, 1);

    await expect(
      prisma.egg.findUniqueOrThrow({ where: { id: sellableEgg.id } }),
    ).resolves.toMatchObject({ userId: buyer.id, isListed: false });
  });

  it("automatically removes an equipped Room asset before escrow", async () => {
    const seller = await createUser();
    const defaultEnvironment = await createTradableCosmetic({
      id: "violet-brick",
      name: "Default environment",
      slot: "environment",
      isDefault: true,
      isTradable: false,
    });
    const environment = await createTradableCosmetic({
      id: "marketplace-test-environment",
      name: "Marketplace environment",
      slot: "environment",
    });
    await prisma.userCosmetic.create({
      data: { userId: seller.id, cosmeticAssetId: environment.id },
    });
    await prisma.userRoomLoadout.create({
      data: {
        userId: seller.id,
        environmentId: environment.id,
      },
    });
    const service = new MarketplaceService();

    const listing = await service.createListing(seller.id, {
      listingType: "cosmetic",
      cosmeticAssetId: environment.id,
      unitPrice: "275",
      currency: "pgc",
    });

    await expect(
      prisma.userRoomLoadout.findUniqueOrThrow({
        where: { userId: seller.id },
      }),
    ).resolves.toMatchObject({
      environmentId: defaultEnvironment.id,
    });
    await expect(
      prisma.userCosmetic.findUniqueOrThrow({
        where: {
          userId_cosmeticAssetId: {
            userId: seller.id,
            cosmeticAssetId: environment.id,
          },
        },
      }),
    ).resolves.toMatchObject({ quantity: 0 });

    await service.cancelListing(seller.id, listing.id);
    await expect(
      prisma.userCosmetic.findUniqueOrThrow({
        where: {
          userId_cosmeticAssetId: {
            userId: seller.id,
            cosmeticAssetId: environment.id,
          },
        },
      }),
    ).resolves.toMatchObject({ quantity: 1 });
  });

  it("transfers a level-100 vaulted Pixegotchi with its Egg and Vault row", async () => {
    const seller = await createUser();
    const buyer = await createUser();
    const pixegotchi = await createPixegotchi(seller.id, {
      level: 100,
      status: "vault",
    });
    await prisma.vault.create({
      data: {
        userId: seller.id,
        pixegotchiId: pixegotchi.id,
        finalLevel: 100,
      },
    });
    const service = new MarketplaceService();

    const listing = await service.createListing(seller.id, {
      listingType: "pixegotchi",
      pixegotchiId: pixegotchi.id,
      unitPrice: "500",
      currency: "pgc",
    });
    await service.buyListing(buyer.id, listing.id, 1);

    await expect(
      prisma.pixegotchi.findUniqueOrThrow({
        where: { id: pixegotchi.id },
      }),
    ).resolves.toMatchObject({
      userId: buyer.id,
      status: "vault",
      isListed: false,
    });
    await expect(
      prisma.egg.findUniqueOrThrow({ where: { id: pixegotchi.eggId } }),
    ).resolves.toMatchObject({ userId: buyer.id });
    await expect(
      prisma.vault.findFirstOrThrow({
        where: { pixegotchiId: pixegotchi.id },
      }),
    ).resolves.toMatchObject({ userId: buyer.id });
  });

  it("returns remaining escrow exactly once when a listing expires", async () => {
    const seller = await createUser();
    const item = await createItem({
      itemId: "expiring-market-item",
      isTradable: true,
    });
    await prisma.inventory.create({
      data: {
        userId: seller.id,
        itemId: item.itemId,
        itemType: item.itemType,
        rarity: item.rarity,
        quantity: 3,
      },
    });
    const service = new MarketplaceService();
    const listing = await service.createListing(seller.id, {
      listingType: "item",
      itemId: item.itemId,
      quantity: 3,
      unitPrice: "10",
      currency: "pgc",
    });
    await prisma.marketplaceListing.update({
      where: { id: listing.id },
      data: { expiresAt: new Date(Date.now() - 1_000) },
    });

    await expect(service.cleanupExpiredListings()).resolves.toBe(1);
    await expect(service.cleanupExpiredListings()).resolves.toBe(0);
    await expect(
      prisma.inventory.findUniqueOrThrow({
        where: {
          userId_itemId: {
            userId: seller.id,
            itemId: item.itemId,
          },
        },
      }),
    ).resolves.toMatchObject({ quantity: 3 });
    await expect(
      prisma.marketplaceListing.findUniqueOrThrow({
        where: { id: listing.id },
      }),
    ).resolves.toMatchObject({
      status: "expired",
      remainingQuantity: 0,
    });
  });

  it("rejects self-buy and keeps an unaffordable listing active", async () => {
    const seller = await createUser();
    const poorBuyer = await createUser({ pgcBalance: 9 });
    const egg = await createEgg(seller.id);
    const service = new MarketplaceService();
    const listing = await service.createListing(seller.id, {
      listingType: "egg",
      eggId: egg.id,
      unitPrice: "10",
      currency: "pgc",
    });

    await expect(
      service.buyListing(seller.id, listing.id, 1),
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.buyListing(poorBuyer.id, listing.id, 1),
    ).rejects.toMatchObject({ statusCode: 402 });
    await expect(
      prisma.marketplaceListing.findUniqueOrThrow({
        where: { id: listing.id },
      }),
    ).resolves.toMatchObject({
      status: "active",
      remainingQuantity: 1,
    });
  });

  it("rejects a non-tradable Item and a Chest outside the allowlist", async () => {
    const seller = await createUser();
    const item = await createItem({ itemId: "locked-market-item" });
    await prisma.inventory.create({
      data: {
        userId: seller.id,
        itemId: item.itemId,
        itemType: item.itemType,
        rarity: item.rarity,
        quantity: 1,
      },
    });
    await createChest(seller.id, { chestType: ChestType.wooden });
    const service = new MarketplaceService();

    await expect(
      service.createListing(seller.id, {
        listingType: "item",
        itemId: item.itemId,
        quantity: 1,
        unitPrice: "10",
        currency: "pgc",
      }),
    ).rejects.toMatchObject({ statusCode: 404 });
    await expect(
      service.createListing(seller.id, {
        listingType: "chest",
        chestType: ChestType.wooden,
        quantity: 1,
        unitPrice: "10",
        currency: "pgc",
      }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("enforces the maximum of ten active listings per seller", async () => {
    const seller = await createUser();
    const eggs = await Promise.all(
      Array.from({ length: 11 }, () => createEgg(seller.id)),
    );
    const service = new MarketplaceService();

    for (const egg of eggs.slice(0, 10)) {
      await service.createListing(seller.id, {
        listingType: "egg",
        eggId: egg.id,
        unitPrice: "10",
        currency: "pgc",
      });
    }

    await expect(
      service.createListing(seller.id, {
        listingType: "egg",
        eggId: eggs[10]!.id,
        unitPrice: "10",
        currency: "pgc",
      }),
    ).rejects.toMatchObject({ statusCode: 409 });
    await expect(
      prisma.marketplaceListing.count({
        where: { sellerId: seller.id, status: "active" },
      }),
    ).resolves.toBe(10);
  });

  it("allows only one buyer to purchase the last item", async () => {
    const seller = await createUser();
    const firstBuyer = await createUser();
    const secondBuyer = await createUser();
    const item = await createItem({
      itemId: "last-market-item",
      isTradable: true,
    });
    await prisma.inventory.create({
      data: {
        userId: seller.id,
        itemId: item.itemId,
        itemType: item.itemType,
        rarity: item.rarity,
        quantity: 1,
      },
    });
    const service = new MarketplaceService();
    const listing = await service.createListing(seller.id, {
      listingType: "item",
      itemId: item.itemId,
      quantity: 1,
      unitPrice: "10",
      currency: "pgc",
    });

    const results = await Promise.allSettled([
      service.buyListing(firstBuyer.id, listing.id, 1),
      service.buyListing(secondBuyer.id, listing.id, 1),
    ]);

    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    await expect(
      prisma.marketplacePurchase.count({
        where: { listingId: listing.id },
      }),
    ).resolves.toBe(1);
    await expect(
      prisma.inventory.count({
        where: {
          itemId: item.itemId,
          userId: { in: [firstBuyer.id, secondBuyer.id] },
        },
      }),
    ).resolves.toBe(1);
  });

  it("rounds commission half up to eight decimal places", async () => {
    const seller = await createUser();
    const buyer = await createUser();
    const egg = await createEgg(seller.id);
    const service = new MarketplaceService();
    const listing = await service.createListing(seller.id, {
      listingType: "egg",
      eggId: egg.id,
      unitPrice: "1.0000001",
      currency: "pgc",
    });

    const result = await service.buyListing(buyer.id, listing.id, 1);

    expect(result.purchase).toMatchObject({
      subtotal: "1.0000001",
      commissionAmount: "0.05000001",
      sellerProceeds: "0.95000009",
    });
  });
});
