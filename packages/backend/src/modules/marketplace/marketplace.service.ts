import type {
  BuyCosmeticMarketplaceListingResponse,
  CosmeticMarketplaceListing,
  CosmeticMarketplaceListingsResponse,
  CreateCosmeticMarketplaceListingInput,
} from "@pixegotchi/shared";
import type {
  CosmeticAsset,
  MarketplaceListing,
  User,
} from "@/generated/prisma/client";
import { prisma } from "@/database/prisma";
import { mapCosmeticAsset } from "../room-cosmetics/room-cosmetics.service";

const marketplaceError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

type CosmeticListingWithRelations = MarketplaceListing & {
  seller: Pick<User, "id" | "username">;
  cosmeticAsset: CosmeticAsset;
};

const mapCosmeticListing = (
  listing: CosmeticListingWithRelations,
): CosmeticMarketplaceListing => ({
  id: listing.id,
  listingType: "cosmetic",
  cosmeticAssetId: listing.cosmeticAsset.id,
  quantity: 1,
  price: listing.price.toString(),
  currency: "pgc",
  seller: listing.seller,
  asset: mapCosmeticAsset(listing.cosmeticAsset),
  createdAt: listing.createdAt.toISOString(),
});

const cosmeticListingInclude = {
  seller: { select: { id: true, username: true } },
  cosmeticAsset: true,
} as const;

export class MarketplaceService {
  async getActiveListings(): Promise<CosmeticMarketplaceListingsResponse> {
    const listings = await prisma.marketplaceListing.findMany({
      where: {
        isActive: true,
        listingType: "cosmetic",
        cosmeticAssetId: { not: null },
      },
      include: cosmeticListingInclude,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    return {
      listings: listings.map((listing) =>
        mapCosmeticListing(listing as CosmeticListingWithRelations),
      ),
    };
  }

  async createCosmeticListing(
    sellerId: number,
    input: CreateCosmeticMarketplaceListingInput,
  ): Promise<CosmeticMarketplaceListing> {
    return prisma.$transaction(
      async (transaction) => {
        const asset = await transaction.cosmeticAsset.findFirst({
          where: {
            id: input.cosmeticAssetId,
            isActive: true,
            isDefault: false,
            isTradable: true,
          },
        });
        if (!asset) {
          throw marketplaceError(404, "Tradable room cosmetic not found");
        }

        const equippedLoadout = await transaction.userRoomLoadout.findFirst({
          where: {
            userId: sellerId,
            OR: [
              { environmentId: asset.id },
              { floorId: asset.id },
              { placements: { some: { cosmeticAssetId: asset.id } } },
            ],
          },
          select: { id: true },
        });
        if (equippedLoadout) {
          throw marketplaceError(
            409,
            "Unequip the room cosmetic before listing",
          );
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
          throw marketplaceError(403, "Room cosmetic is not owned");
        }

        const listing = await transaction.marketplaceListing.create({
          data: {
            sellerId,
            listingType: "cosmetic",
            cosmeticAssetId: asset.id,
            quantity: 1,
            price: input.price,
            currency: "pgc",
          },
          include: cosmeticListingInclude,
        });

        return mapCosmeticListing(listing as CosmeticListingWithRelations);
      },
      { isolationLevel: "Serializable" },
    );
  }

  async buyCosmeticListing(
    buyerId: number,
    listingId: number,
  ): Promise<BuyCosmeticMarketplaceListingResponse> {
    return prisma.$transaction(
      async (transaction) => {
        const listing = await transaction.marketplaceListing.findFirst({
          where: {
            id: listingId,
            isActive: true,
            listingType: "cosmetic",
            cosmeticAssetId: { not: null },
          },
        });
        if (!listing?.cosmeticAssetId) {
          throw marketplaceError(404, "Marketplace listing not found");
        }
        if (listing.sellerId === buyerId) {
          throw marketplaceError(400, "Cannot buy your own listing");
        }

        const existingOwnership = await transaction.userCosmetic.findUnique({
          where: {
            userId_cosmeticAssetId: {
              userId: buyerId,
              cosmeticAssetId: listing.cosmeticAssetId,
            },
          },
        });
        if (existingOwnership && existingOwnership.quantity > 0) {
          throw marketplaceError(409, "Room cosmetic is already owned");
        }

        const claimedListing = await transaction.marketplaceListing.updateMany({
          where: { id: listing.id, isActive: true, buyerId: null },
          data: { isActive: false },
        });
        if (claimedListing.count !== 1) {
          throw marketplaceError(409, "Marketplace listing is no longer active");
        }

        const chargedBuyer = await transaction.user.updateMany({
          where: { id: buyerId, pgcBalance: { gte: listing.price } },
          data: { pgcBalance: { decrement: listing.price } },
        });
        if (chargedBuyer.count !== 1) {
          throw marketplaceError(402, "Not enough PGC");
        }
        await transaction.user.update({
          where: { id: listing.sellerId },
          data: { pgcBalance: { increment: listing.price } },
        });

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
        await transaction.marketplaceListing.update({
          where: { id: listing.id },
          data: { buyerId, soldAt: new Date() },
        });
        const buyer = await transaction.user.findUniqueOrThrow({
          where: { id: buyerId },
          select: { pgcBalance: true },
        });

        return {
          listingId: listing.id,
          cosmeticAssetId: listing.cosmeticAssetId,
          pgcBalance: buyer.pgcBalance.toString(),
        };
      },
      { isolationLevel: "Serializable" },
    );
  }

  async cancelCosmeticListing(sellerId: number, listingId: number) {
    await prisma.$transaction(
      async (transaction) => {
        const listing = await transaction.marketplaceListing.findFirst({
          where: {
            id: listingId,
            sellerId,
            isActive: true,
            listingType: "cosmetic",
            cosmeticAssetId: { not: null },
          },
        });
        if (!listing?.cosmeticAssetId) {
          throw marketplaceError(404, "Marketplace listing not found");
        }

        const cancelled = await transaction.marketplaceListing.updateMany({
          where: { id: listing.id, sellerId, isActive: true, buyerId: null },
          data: { isActive: false },
        });
        if (cancelled.count !== 1) {
          throw marketplaceError(409, "Marketplace listing is no longer active");
        }

        await transaction.userCosmetic.upsert({
          where: {
            userId_cosmeticAssetId: {
              userId: sellerId,
              cosmeticAssetId: listing.cosmeticAssetId,
            },
          },
          create: {
            userId: sellerId,
            cosmeticAssetId: listing.cosmeticAssetId,
            quantity: 1,
          },
          update: { quantity: { increment: 1 } },
        });
      },
      { isolationLevel: "Serializable" },
    );
  }
}
