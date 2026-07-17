import {
  CHEST_TYPE_TO_RARITY,
  MARKETPLACE_CONFIG,
  MARKETPLACE_MONEY_SCALE,
  type BuyMarketplaceListingResponse,
  type ChestType,
  type CreateMarketplaceListingInput,
  type ListingType,
  type MarketplaceConfigResponse,
  type MarketplaceListingsResponse,
  type MarketplaceSellableResponse,
  type SellableMarketplaceAsset,
} from "@pixegotchi/shared";
import { prisma } from "@/database/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  DEFAULT_ENVIRONMENT_ID,
  DEFAULT_FLOOR_ID,
  mapCosmeticAsset,
} from "../room-cosmetics/room-cosmetics.service";
import {
  mapMarketplaceListing,
  mapMarketplacePurchase,
  marketplaceListingInclude,
  type MarketplaceListingWithRelations,
} from "./marketplace.mapper";

const BPS_DIVISOR = 10_000;
const EXPIRY_BATCH_SIZE = 100;

const marketplaceError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

const getExpiresAt = () =>
  new Date(
    Date.now() +
      MARKETPLACE_CONFIG.listingDurationDays * 24 * 60 * 60 * 1000,
  );

const getUnitPrice = (rawPrice: string) => {
  let unitPrice: Prisma.Decimal;
  try {
    unitPrice = new Prisma.Decimal(rawPrice);
  } catch {
    throw marketplaceError(400, "Invalid marketplace unit price");
  }

  const min = new Prisma.Decimal(MARKETPLACE_CONFIG.minUnitPrice);
  const max = new Prisma.Decimal(MARKETPLACE_CONFIG.maxUnitPrice);
  if (
    !unitPrice.isFinite() ||
    unitPrice.decimalPlaces() > MARKETPLACE_MONEY_SCALE ||
    unitPrice.lessThan(min) ||
    unitPrice.greaterThan(max)
  ) {
    throw marketplaceError(400, "Invalid marketplace unit price");
  }

  return unitPrice;
};

const lockUser = async (
  transaction: Prisma.TransactionClient,
  userId: number,
) => {
  const rows = await transaction.$queryRaw<Array<{ id: number }>>`
    SELECT "id"
    FROM "users"
    WHERE "id" = ${userId}
    FOR UPDATE
  `;
  if (rows.length !== 1) throw marketplaceError(404, "User not found");
};

const lockListing = async (
  transaction: Prisma.TransactionClient,
  listingId: number,
) => {
  const rows = await transaction.$queryRaw<Array<{ id: number }>>`
    SELECT "id"
    FROM "marketplace_listings"
    WHERE "id" = ${listingId}
    FOR UPDATE
  `;
  if (rows.length !== 1) {
    throw marketplaceError(404, "Marketplace listing not found");
  }
};

const addInventoryItem = async (
  transaction: Prisma.TransactionClient,
  userId: number,
  listing: MarketplaceListingWithRelations,
  quantity: number,
) => {
  if (!listing.itemId || !listing.item) {
    throw marketplaceError(409, "Marketplace item escrow is invalid");
  }
  await transaction.inventory.upsert({
    where: {
      userId_itemId: {
        userId,
        itemId: listing.itemId,
      },
    },
    create: {
      userId,
      itemId: listing.itemId,
      itemType: listing.item.itemType,
      rarity: listing.item.rarity,
      quantity,
    },
    update: { quantity: { increment: quantity } },
  });
};

const releaseEscrow = async (
  transaction: Prisma.TransactionClient,
  listing: MarketplaceListingWithRelations,
  quantity: number,
) => {
  if (quantity <= 0) return;

  switch (listing.listingType) {
    case "egg": {
      if (!listing.eggId) {
        throw marketplaceError(409, "Marketplace egg escrow is invalid");
      }
      const released = await transaction.egg.updateMany({
        where: {
          id: listing.eggId,
          userId: listing.sellerId,
          isListed: true,
        },
        data: { isListed: false },
      });
      if (released.count !== 1) {
        throw marketplaceError(409, "Marketplace egg escrow is invalid");
      }
      return;
    }
    case "item":
      await addInventoryItem(
        transaction,
        listing.sellerId,
        listing,
        quantity,
      );
      return;
    case "chest": {
      const released = await transaction.chest.updateMany({
        where: {
          marketplaceListingId: listing.id,
          userId: listing.sellerId,
          isOpened: false,
        },
        data: { marketplaceListingId: null },
      });
      if (released.count !== quantity) {
        throw marketplaceError(409, "Marketplace chest escrow is invalid");
      }
      return;
    }
    case "cosmetic": {
      if (!listing.cosmeticAssetId) {
        throw marketplaceError(409, "Marketplace room escrow is invalid");
      }
      await transaction.userCosmetic.upsert({
        where: {
          userId_cosmeticAssetId: {
            userId: listing.sellerId,
            cosmeticAssetId: listing.cosmeticAssetId,
          },
        },
        create: {
          userId: listing.sellerId,
          cosmeticAssetId: listing.cosmeticAssetId,
          quantity,
        },
        update: { quantity: { increment: quantity } },
      });
      return;
    }
    case "pixegotchi": {
      if (!listing.pixegotchiId) {
        throw marketplaceError(
          409,
          "Marketplace Pixegotchi escrow is invalid",
        );
      }
      const released = await transaction.pixegotchi.updateMany({
        where: {
          id: listing.pixegotchiId,
          userId: listing.sellerId,
          status: "vault",
          isListed: true,
        },
        data: { isListed: false },
      });
      if (released.count !== 1) {
        throw marketplaceError(
          409,
          "Marketplace Pixegotchi escrow is invalid",
        );
      }
    }
  }
};

const closeListingAndReleaseEscrow = async (
  transaction: Prisma.TransactionClient,
  listing: MarketplaceListingWithRelations,
  status: "cancelled" | "expired",
) => {
  const quantity = listing.remainingQuantity;
  await releaseEscrow(transaction, listing, quantity);
  await transaction.marketplaceListing.update({
    where: { id: listing.id },
    data: {
      status,
      remainingQuantity: 0,
      closedAt: new Date(),
    },
  });
};

export class MarketplaceService {
  getConfig(): MarketplaceConfigResponse {
    return {
      commissionBps: MARKETPLACE_CONFIG.commissionBps,
      listingDurationDays: MARKETPLACE_CONFIG.listingDurationDays,
      maxActiveListings: MARKETPLACE_CONFIG.maxActiveListings,
      minUnitPrice: MARKETPLACE_CONFIG.minUnitPrice,
      maxUnitPrice: MARKETPLACE_CONFIG.maxUnitPrice,
      enabledCurrencies: [...MARKETPLACE_CONFIG.enabledCurrencies],
    };
  }

  async getListings(
    userId: number,
    listingType?: ListingType,
    mine = false,
  ): Promise<MarketplaceListingsResponse> {
    await this.cleanupExpiredListings();
    const listings = await prisma.marketplaceListing.findMany({
      where: {
        status: "active",
        expiresAt: { gt: new Date() },
        ...(listingType ? { listingType } : {}),
        ...(mine ? { sellerId: userId } : {}),
      },
      include: marketplaceListingInclude,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    return { listings: listings.map(mapMarketplaceListing) };
  }

  async getSellableAssets(
    userId: number,
    listingType: ListingType,
  ): Promise<MarketplaceSellableResponse> {
    await this.cleanupExpiredListings();
    const activeListingCount = await prisma.marketplaceListing.count({
      where: { sellerId: userId, status: "active" },
    });
    let assets: SellableMarketplaceAsset[] = [];

    switch (listingType) {
      case "egg": {
        const eggs = await prisma.egg.findMany({
          where: {
            userId,
            isHatching: false,
            isHatched: false,
            isListed: false,
          },
          select: { id: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        });
        assets = eggs.map((egg) => ({
          listingType: "egg",
          maxQuantity: 1,
          asset: {
            id: egg.id,
            createdAt: egg.createdAt.toISOString(),
          },
        }));
        break;
      }
      case "item": {
        const inventory = await prisma.inventory.findMany({
          where: { userId, quantity: { gt: 0 } },
        });
        const quantities = new Map(
          inventory.map((entry) => [entry.itemId, entry.quantity]),
        );
        const items = await prisma.item.findMany({
          where: {
            itemId: { in: [...quantities.keys()] },
            isTradable: true,
          },
          orderBy: [{ itemType: "asc" }, { rarity: "asc" }, { name: "asc" }],
        });
        assets = items.map((item) => ({
          listingType: "item",
          maxQuantity: quantities.get(item.itemId) ?? 0,
          asset: {
            itemId: item.itemId,
            name: item.name,
            itemType: item.itemType,
            rarity: item.rarity,
            iconUrl: item.iconUrl,
          },
        }));
        break;
      }
      case "chest": {
        const chests = await prisma.chest.groupBy({
          by: ["chestType"],
          where: {
            userId,
            isOpened: false,
            marketplaceListingId: null,
            chestType: {
              in: [...MARKETPLACE_CONFIG.sellableChestTypes],
            },
          },
          _count: { _all: true },
        });
        assets = chests.map((chest) => ({
          listingType: "chest",
          maxQuantity: chest._count._all,
          asset: {
            chestType: chest.chestType,
            rarity: CHEST_TYPE_TO_RARITY[chest.chestType],
          },
        }));
        break;
      }
      case "cosmetic": {
        const [ownerships, loadout] = await Promise.all([
          prisma.userCosmetic.findMany({
            where: {
              userId,
              quantity: { gt: 0 },
              asset: {
                isActive: true,
                isDefault: false,
                isTradable: true,
              },
            },
            include: { asset: true },
            orderBy: { acquiredAt: "asc" },
          }),
          prisma.userRoomLoadout.findUnique({
            where: { userId },
            include: { placements: true },
          }),
        ]);
        const equippedIds = new Set([
          ...(loadout
            ? [loadout.environmentId, ...(loadout.floorId ? [loadout.floorId] : [])]
            : []),
          ...(loadout?.placements.map(
            (placement) => placement.cosmeticAssetId,
          ) ?? []),
        ]);
        assets = ownerships.map((ownership) => ({
          listingType: "cosmetic",
          maxQuantity: 1,
          isEquipped: equippedIds.has(ownership.cosmeticAssetId),
          asset: mapCosmeticAsset(ownership.asset),
        }));
        break;
      }
      case "pixegotchi": {
        const pixegotchis = await prisma.pixegotchi.findMany({
          where: {
            userId,
            level: 100,
            status: "vault",
            isListed: false,
            vault: { some: { userId } },
          },
          select: {
            id: true,
            name: true,
            level: true,
            element: true,
            rarity: true,
          },
          orderBy: [{ rarity: "desc" }, { id: "asc" }],
        });
        assets = pixegotchis.map((pixegotchi) => ({
          listingType: "pixegotchi",
          maxQuantity: 1,
          asset: pixegotchi,
        }));
      }
    }

    return {
      assets,
      activeListingCount,
      maxActiveListings: MARKETPLACE_CONFIG.maxActiveListings,
    };
  }

  async createListing(
    sellerId: number,
    input: CreateMarketplaceListingInput,
  ) {
    await this.cleanupExpiredListings();
    const unitPrice = getUnitPrice(input.unitPrice);

    return prisma.$transaction(
      async (transaction) => {
        await lockUser(transaction, sellerId);
        const activeListingCount = await transaction.marketplaceListing.count({
          where: { sellerId, status: "active" },
        });
        if (
          activeListingCount >= MARKETPLACE_CONFIG.maxActiveListings
        ) {
          throw marketplaceError(
            409,
            `You can only have ${MARKETPLACE_CONFIG.maxActiveListings} active listings`,
          );
        }

        const commonData = {
          sellerId,
          unitPrice,
          currency: "pgc" as const,
          status: "active" as const,
          expiresAt: getExpiresAt(),
        };

        switch (input.listingType) {
          case "egg": {
            const reserved = await transaction.egg.updateMany({
              where: {
                id: input.eggId,
                userId: sellerId,
                isHatching: false,
                isHatched: false,
                isListed: false,
              },
              data: { isListed: true },
            });
            if (reserved.count !== 1) {
              throw marketplaceError(409, "Egg cannot be listed");
            }
            return mapMarketplaceListing(
              await transaction.marketplaceListing.create({
                data: {
                  ...commonData,
                  listingType: "egg",
                  eggId: input.eggId,
                  initialQuantity: 1,
                  remainingQuantity: 1,
                },
                include: marketplaceListingInclude,
              }),
            );
          }
          case "item": {
            const item = await transaction.item.findFirst({
              where: { itemId: input.itemId, isTradable: true },
            });
            if (!item) {
              throw marketplaceError(404, "Tradable item not found");
            }
            const reserved = await transaction.inventory.updateMany({
              where: {
                userId: sellerId,
                itemId: input.itemId,
                quantity: { gte: input.quantity },
              },
              data: { quantity: { decrement: input.quantity } },
            });
            if (reserved.count !== 1) {
              throw marketplaceError(409, "Not enough item quantity");
            }
            await transaction.inventory.deleteMany({
              where: {
                userId: sellerId,
                itemId: input.itemId,
                quantity: 0,
              },
            });
            return mapMarketplaceListing(
              await transaction.marketplaceListing.create({
                data: {
                  ...commonData,
                  listingType: "item",
                  itemId: input.itemId,
                  initialQuantity: input.quantity,
                  remainingQuantity: input.quantity,
                },
                include: marketplaceListingInclude,
              }),
            );
          }
          case "chest": {
            if (
              !MARKETPLACE_CONFIG.sellableChestTypes.some(
                (chestType: ChestType) => chestType === input.chestType,
              )
            ) {
              throw marketplaceError(409, "Chest type is not tradable");
            }
            const chestRows = await transaction.$queryRaw<
              Array<{ id: number }>
            >`
              SELECT "id"
              FROM "chests"
              WHERE "user_id" = ${sellerId}
                AND "chest_type" = ${input.chestType}::"ChestType"
                AND "is_opened" = false
                AND "marketplace_listing_id" IS NULL
              ORDER BY "id"
              LIMIT ${input.quantity}
              FOR UPDATE
            `;
            if (chestRows.length !== input.quantity) {
              throw marketplaceError(409, "Not enough chest quantity");
            }
            const listing = await transaction.marketplaceListing.create({
              data: {
                ...commonData,
                listingType: "chest",
                chestType: input.chestType,
                initialQuantity: input.quantity,
                remainingQuantity: input.quantity,
              },
              include: marketplaceListingInclude,
            });
            const reserved = await transaction.chest.updateMany({
              where: {
                id: { in: chestRows.map(({ id }) => id) },
                userId: sellerId,
                isOpened: false,
                marketplaceListingId: null,
              },
              data: { marketplaceListingId: listing.id },
            });
            if (reserved.count !== input.quantity) {
              throw marketplaceError(409, "Chest reservation conflict");
            }
            return mapMarketplaceListing(listing);
          }
          case "cosmetic": {
            const asset = await transaction.cosmeticAsset.findFirst({
              where: {
                id: input.cosmeticAssetId,
                isActive: true,
                isDefault: false,
                isTradable: true,
              },
            });
            if (!asset) {
              throw marketplaceError(404, "Tradable room asset not found");
            }
            const ownership = await transaction.userCosmetic.updateMany({
              where: {
                userId: sellerId,
                cosmeticAssetId: asset.id,
                quantity: { gte: 1 },
              },
              data: { quantity: { decrement: 1 } },
            });
            if (ownership.count !== 1) {
              throw marketplaceError(409, "Room asset is not owned");
            }
            const loadout = await transaction.userRoomLoadout.findUnique({
              where: { userId: sellerId },
              include: { placements: true },
            });
            if (loadout?.environmentId === asset.id) {
              await transaction.userRoomLoadout.update({
                where: { id: loadout.id },
                data: { environmentId: DEFAULT_ENVIRONMENT_ID },
              });
            } else if (loadout?.floorId === asset.id) {
              await transaction.userRoomLoadout.update({
                where: { id: loadout.id },
                data: { floorId: DEFAULT_FLOOR_ID },
              });
            } else if (loadout) {
              await transaction.roomCosmeticPlacement.deleteMany({
                where: {
                  loadoutId: loadout.id,
                  cosmeticAssetId: asset.id,
                },
              });
            }
            return mapMarketplaceListing(
              await transaction.marketplaceListing.create({
                data: {
                  ...commonData,
                  listingType: "cosmetic",
                  cosmeticAssetId: asset.id,
                  initialQuantity: 1,
                  remainingQuantity: 1,
                },
                include: marketplaceListingInclude,
              }),
            );
          }
          case "pixegotchi": {
            const seller = await transaction.user.findUniqueOrThrow({
              where: { id: sellerId },
              select: { currentPixegotchiId: true },
            });
            if (seller.currentPixegotchiId === input.pixegotchiId) {
              throw marketplaceError(
                409,
                "Current Pixegotchi cannot be listed",
              );
            }
            const reserved = await transaction.pixegotchi.updateMany({
              where: {
                id: input.pixegotchiId,
                userId: sellerId,
                level: 100,
                status: "vault",
                isListed: false,
                vault: { some: { userId: sellerId } },
              },
              data: { isListed: true },
            });
            if (reserved.count !== 1) {
              throw marketplaceError(409, "Pixegotchi cannot be listed");
            }
            return mapMarketplaceListing(
              await transaction.marketplaceListing.create({
                data: {
                  ...commonData,
                  listingType: "pixegotchi",
                  pixegotchiId: input.pixegotchiId,
                  initialQuantity: 1,
                  remainingQuantity: 1,
                },
                include: marketplaceListingInclude,
              }),
            );
          }
        }
      },
      { isolationLevel: "Serializable" },
    );
  }

  async buyListing(
    buyerId: number,
    listingId: number,
    quantity: number,
  ): Promise<BuyMarketplaceListingResponse> {
    await this.cleanupExpiredListings();

    return prisma.$transaction(
      async (transaction) => {
        await lockListing(transaction, listingId);
        const listing = await transaction.marketplaceListing.findUnique({
          where: { id: listingId },
          include: marketplaceListingInclude,
        });
        if (
          !listing ||
          listing.status !== "active" ||
          listing.expiresAt <= new Date()
        ) {
          throw marketplaceError(404, "Marketplace listing not found");
        }
        if (listing.sellerId === buyerId) {
          throw marketplaceError(400, "Cannot buy your own listing");
        }
        for (const userId of [buyerId, listing.sellerId].sort(
          (left, right) => left - right,
        )) {
          await lockUser(transaction, userId);
        }
        if (
          quantity < 1 ||
          quantity > listing.remainingQuantity ||
          (listing.listingType !== "item" &&
            listing.listingType !== "chest" &&
            quantity !== 1)
        ) {
          throw marketplaceError(400, "Invalid purchase quantity");
        }
        if (listing.currency !== "pgc") {
          throw marketplaceError(409, "Marketplace currency is not enabled");
        }

        const subtotal = listing.unitPrice.mul(quantity);
        const commissionAmount = subtotal
          .mul(MARKETPLACE_CONFIG.commissionBps)
          .div(BPS_DIVISOR)
          .toDecimalPlaces(
            MARKETPLACE_MONEY_SCALE,
            Prisma.Decimal.ROUND_HALF_UP,
          );
        const sellerProceeds = subtotal.minus(commissionAmount);
        const charged = await transaction.user.updateMany({
          where: { id: buyerId, pgcBalance: { gte: subtotal } },
          data: { pgcBalance: { decrement: subtotal } },
        });
        if (charged.count !== 1) {
          throw marketplaceError(402, "Not enough PGC");
        }
        await transaction.user.update({
          where: { id: listing.sellerId },
          data: { pgcBalance: { increment: sellerProceeds } },
        });

        switch (listing.listingType) {
          case "egg": {
            if (!listing.eggId) {
              throw marketplaceError(409, "Marketplace egg escrow is invalid");
            }
            const transferred = await transaction.egg.updateMany({
              where: {
                id: listing.eggId,
                userId: listing.sellerId,
                isListed: true,
                isHatching: false,
                isHatched: false,
              },
              data: { userId: buyerId, isListed: false },
            });
            if (transferred.count !== 1) {
              throw marketplaceError(409, "Marketplace egg escrow is invalid");
            }
            break;
          }
          case "item":
            await addInventoryItem(transaction, buyerId, listing, quantity);
            break;
          case "chest": {
            const chestRows = await transaction.$queryRaw<
              Array<{ id: number }>
            >`
              SELECT "id"
              FROM "chests"
              WHERE "marketplace_listing_id" = ${listing.id}
                AND "user_id" = ${listing.sellerId}
                AND "is_opened" = false
              ORDER BY "id"
              LIMIT ${quantity}
              FOR UPDATE
            `;
            if (chestRows.length !== quantity) {
              throw marketplaceError(
                409,
                "Marketplace chest escrow is invalid",
              );
            }
            const transferred = await transaction.chest.updateMany({
              where: { id: { in: chestRows.map(({ id }) => id) } },
              data: {
                userId: buyerId,
                marketplaceListingId: null,
              },
            });
            if (transferred.count !== quantity) {
              throw marketplaceError(
                409,
                "Marketplace chest escrow is invalid",
              );
            }
            break;
          }
          case "cosmetic": {
            if (!listing.cosmeticAssetId) {
              throw marketplaceError(
                409,
                "Marketplace room escrow is invalid",
              );
            }
            await transaction.userCosmetic.upsert({
              where: {
                userId_cosmeticAssetId: {
                  userId: buyerId,
                  cosmeticAssetId: listing.cosmeticAssetId,
                },
              },
              create: {
                userId: buyerId,
                cosmeticAssetId: listing.cosmeticAssetId,
                quantity: 1,
              },
              update: { quantity: { increment: 1 } },
            });
            break;
          }
          case "pixegotchi": {
            if (!listing.pixegotchiId || !listing.pixegotchi) {
              throw marketplaceError(
                409,
                "Marketplace Pixegotchi escrow is invalid",
              );
            }
            const transferred = await transaction.pixegotchi.updateMany({
              where: {
                id: listing.pixegotchiId,
                userId: listing.sellerId,
                level: 100,
                status: "vault",
                isListed: true,
              },
              data: { userId: buyerId, isListed: false },
            });
            if (transferred.count !== 1) {
              throw marketplaceError(
                409,
                "Marketplace Pixegotchi escrow is invalid",
              );
            }
            await transaction.egg.update({
              where: { id: listing.pixegotchi.eggId },
              data: { userId: buyerId },
            });
            const vault = await transaction.vault.updateMany({
              where: {
                pixegotchiId: listing.pixegotchiId,
                userId: listing.sellerId,
              },
              data: { userId: buyerId },
            });
            if (vault.count !== 1) {
              throw marketplaceError(
                409,
                "Marketplace Pixegotchi Vault entry is invalid",
              );
            }
            break;
          }
        }

        const purchase = await transaction.marketplacePurchase.create({
          data: {
            listingId: listing.id,
            buyerId,
            sellerId: listing.sellerId,
            quantity,
            unitPrice: listing.unitPrice,
            subtotal,
            commissionBps: MARKETPLACE_CONFIG.commissionBps,
            commissionAmount,
            sellerProceeds,
            currency: "pgc",
          },
        });
        const treasury = await transaction.marketplaceTreasuryBalance.upsert({
          where: { currency: "pgc" },
          create: { currency: "pgc", balance: commissionAmount },
          update: { balance: { increment: commissionAmount } },
        });
        await transaction.marketplaceTreasuryTransaction.create({
          data: {
            transactionType: "commission",
            currency: "pgc",
            amount: commissionAmount,
            balanceAfter: treasury.balance,
            purchaseId: purchase.id,
          },
        });

        const remainingQuantity = listing.remainingQuantity - quantity;
        const updatedListing = await transaction.marketplaceListing.update({
          where: { id: listing.id },
          data: {
            remainingQuantity,
            ...(remainingQuantity === 0
              ? { status: "sold", closedAt: new Date() }
              : {}),
          },
          include: marketplaceListingInclude,
        });
        const buyer = await transaction.user.findUniqueOrThrow({
          where: { id: buyerId },
          select: { pgcBalance: true },
        });

        return {
          listing: mapMarketplaceListing(updatedListing),
          purchase: mapMarketplacePurchase(purchase),
          pgcBalance: buyer.pgcBalance.toString(),
        };
      },
      { isolationLevel: "Serializable" },
    );
  }

  async cancelListing(sellerId: number, listingId: number) {
    await this.cleanupExpiredListings();
    await prisma.$transaction(
      async (transaction) => {
        await lockListing(transaction, listingId);
        await lockUser(transaction, sellerId);
        const listing = await transaction.marketplaceListing.findFirst({
          where: { id: listingId, sellerId, status: "active" },
          include: marketplaceListingInclude,
        });
        if (!listing) {
          throw marketplaceError(404, "Marketplace listing not found");
        }
        await closeListingAndReleaseEscrow(
          transaction,
          listing,
          "cancelled",
        );
      },
      { isolationLevel: "Serializable" },
    );
  }

  async cleanupExpiredListings(limit = EXPIRY_BATCH_SIZE) {
    const expiredIds = await prisma.marketplaceListing.findMany({
      where: { status: "active", expiresAt: { lte: new Date() } },
      select: { id: true },
      orderBy: { expiresAt: "asc" },
      take: limit,
    });
    let expiredCount = 0;

    for (const { id } of expiredIds) {
      const expired = await prisma.$transaction(
        async (transaction) => {
          await lockListing(transaction, id);
          const listing = await transaction.marketplaceListing.findFirst({
            where: {
              id,
              status: "active",
              expiresAt: { lte: new Date() },
            },
            include: marketplaceListingInclude,
          });
          if (!listing) return false;
          await closeListingAndReleaseEscrow(
            transaction,
            listing,
            "expired",
          );
          return true;
        },
        { isolationLevel: "Serializable" },
      );
      if (expired) expiredCount += 1;
    }

    return expiredCount;
  }
}
