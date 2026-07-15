import { describe, expect, it } from "vitest";
import { prisma } from "@/database/prisma";
import { createUser } from "@/test/helpers/factories";
import { MarketplaceService } from "./marketplace.service";

const createTradableCosmetic = () =>
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
      isPurchasable: true,
      pgcPrice: 400,
      isChestReward: true,
      chestDropWeight: 100,
      isActive: true,
    },
  });

describe("MarketplaceService cosmetics", () => {
  it("escrows an owned unequipped cosmetic when creating a listing", async () => {
    const seller = await createUser();
    const asset = await createTradableCosmetic();
    await prisma.userCosmetic.create({
      data: { userId: seller.id, cosmeticAssetId: asset.id },
    });
    const service = new MarketplaceService();

    const listing = await service.createCosmeticListing(seller.id, {
      listingType: "cosmetic",
      cosmeticAssetId: asset.id,
      price: 275,
      currency: "pgc",
    });

    expect(listing).toMatchObject({
      listingType: "cosmetic",
      cosmeticAssetId: asset.id,
      price: "275",
      seller: { id: seller.id },
    });
    await expect(
      prisma.userCosmetic.findUniqueOrThrow({
        where: {
          userId_cosmeticAssetId: {
            userId: seller.id,
            cosmeticAssetId: asset.id,
          },
        },
      }),
    ).resolves.toMatchObject({ quantity: 0 });
  });

  it("atomically transfers PGC and cosmetic ownership to the buyer", async () => {
    const seller = await createUser({ pgcBalance: 100 });
    const buyer = await createUser({ pgcBalance: 500 });
    const asset = await createTradableCosmetic();
    await prisma.userCosmetic.create({
      data: { userId: seller.id, cosmeticAssetId: asset.id },
    });
    const service = new MarketplaceService();
    const listing = await service.createCosmeticListing(seller.id, {
      listingType: "cosmetic",
      cosmeticAssetId: asset.id,
      price: 275,
      currency: "pgc",
    });

    const purchase = await service.buyCosmeticListing(buyer.id, listing.id);

    expect(purchase).toEqual({
      listingId: listing.id,
      cosmeticAssetId: asset.id,
      pgcBalance: "225",
    });
    const updatedSeller = await prisma.user.findUniqueOrThrow({
      where: { id: seller.id },
    });
    expect(updatedSeller.pgcBalance.toString()).toBe("375");
    await expect(
      prisma.userCosmetic.findUniqueOrThrow({
        where: {
          userId_cosmeticAssetId: {
            userId: buyer.id,
            cosmeticAssetId: asset.id,
          },
        },
      }),
    ).resolves.toMatchObject({ quantity: 1 });
  });

  it("returns the cosmetic to the seller when a listing is cancelled", async () => {
    const seller = await createUser();
    const asset = await createTradableCosmetic();
    await prisma.userCosmetic.create({
      data: { userId: seller.id, cosmeticAssetId: asset.id },
    });
    const service = new MarketplaceService();
    const listing = await service.createCosmeticListing(seller.id, {
      listingType: "cosmetic",
      cosmeticAssetId: asset.id,
      price: 275,
      currency: "pgc",
    });

    await service.cancelCosmeticListing(seller.id, listing.id);

    await expect(
      prisma.userCosmetic.findUniqueOrThrow({
        where: {
          userId_cosmeticAssetId: {
            userId: seller.id,
            cosmeticAssetId: asset.id,
          },
        },
      }),
    ).resolves.toMatchObject({ quantity: 1 });
    await expect(
      prisma.marketplaceListing.findUniqueOrThrow({
        where: { id: listing.id },
      }),
    ).resolves.toMatchObject({ isActive: false, buyerId: null });
  });

  it("keeps the listing active when the buyer cannot afford it", async () => {
    const seller = await createUser({ pgcBalance: 100 });
    const buyer = await createUser({ pgcBalance: 274 });
    const asset = await createTradableCosmetic();
    await prisma.userCosmetic.create({
      data: { userId: seller.id, cosmeticAssetId: asset.id },
    });
    const service = new MarketplaceService();
    const listing = await service.createCosmeticListing(seller.id, {
      listingType: "cosmetic",
      cosmeticAssetId: asset.id,
      price: 275,
      currency: "pgc",
    });

    await expect(
      service.buyCosmeticListing(buyer.id, listing.id),
    ).rejects.toMatchObject({ statusCode: 402 });
    await expect(
      prisma.marketplaceListing.findUniqueOrThrow({
        where: { id: listing.id },
      }),
    ).resolves.toMatchObject({ isActive: true, buyerId: null });
    await expect(
      prisma.userCosmetic.findUnique({
        where: {
          userId_cosmeticAssetId: {
            userId: buyer.id,
            cosmeticAssetId: asset.id,
          },
        },
      }),
    ).resolves.toBeNull();
  });

  it("requires an equipped cosmetic to be removed before listing", async () => {
    const seller = await createUser();
    const asset = await createTradableCosmetic();
    const environment = await prisma.cosmeticAsset.create({
      data: {
        id: "marketplace-test-environment",
        name: "Marketplace test environment",
        slot: "environment",
        rarity: "common",
        isDefault: true,
        isTradable: false,
        isActive: true,
      },
    });
    const loadout = await prisma.userRoomLoadout.create({
      data: {
        userId: seller.id,
        environmentId: environment.id,
      },
    });
    await prisma.roomCosmeticPlacement.create({
      data: {
        loadoutId: loadout.id,
        cosmeticAssetId: asset.id,
        position: 8,
      },
    });
    await prisma.userCosmetic.create({
      data: { userId: seller.id, cosmeticAssetId: asset.id },
    });
    const service = new MarketplaceService();

    await expect(
      service.createCosmeticListing(seller.id, {
        listingType: "cosmetic",
        cosmeticAssetId: asset.id,
        price: 275,
        currency: "pgc",
      }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});
