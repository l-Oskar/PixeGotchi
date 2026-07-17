import {
  CHEST_TYPE_TO_RARITY,
  type MarketplacePurchase,
  type PlayerMarketplaceListing,
} from "@pixegotchi/shared";
import type { Prisma } from "@/generated/prisma/client";
import { mapCosmeticAsset } from "../room-cosmetics/room-cosmetics.service";

export const marketplaceListingInclude = {
  seller: { select: { id: true, username: true } },
  egg: { select: { id: true, createdAt: true } },
  item: true,
  pixegotchi: {
    select: {
      id: true,
      eggId: true,
      name: true,
      level: true,
      element: true,
      rarity: true,
    },
  },
  cosmeticAsset: true,
} satisfies Prisma.MarketplaceListingInclude;

export type MarketplaceListingWithRelations =
  Prisma.MarketplaceListingGetPayload<{
    include: typeof marketplaceListingInclude;
  }>;

const mapBaseListing = (listing: MarketplaceListingWithRelations) => ({
  id: listing.id,
  source: "player" as const,
  seller: listing.seller,
  initialQuantity: listing.initialQuantity,
  remainingQuantity: listing.remainingQuantity,
  unitPrice: listing.unitPrice.toString(),
  currency: listing.currency,
  status: listing.status,
  createdAt: listing.createdAt.toISOString(),
  expiresAt: listing.expiresAt.toISOString(),
  closedAt: listing.closedAt?.toISOString() ?? null,
});

export const mapMarketplaceListing = (
  listing: MarketplaceListingWithRelations,
): PlayerMarketplaceListing => {
  const base = mapBaseListing(listing);

  switch (listing.listingType) {
    case "egg":
      if (!listing.egg) throw new Error("Egg listing is missing its asset");
      return {
        ...base,
        listingType: "egg",
        asset: {
          id: listing.egg.id,
          createdAt: listing.egg.createdAt.toISOString(),
        },
      };
    case "item":
      if (!listing.item) throw new Error("Item listing is missing its asset");
      return {
        ...base,
        listingType: "item",
        asset: {
          itemId: listing.item.itemId,
          name: listing.item.name,
          itemType: listing.item.itemType,
          rarity: listing.item.rarity,
          iconUrl: listing.item.iconUrl,
        },
      };
    case "chest":
      if (!listing.chestType) {
        throw new Error("Chest listing is missing its chest type");
      }
      return {
        ...base,
        listingType: "chest",
        asset: {
          chestType: listing.chestType,
          rarity: CHEST_TYPE_TO_RARITY[listing.chestType],
        },
      };
    case "cosmetic":
      if (!listing.cosmeticAsset) {
        throw new Error("Room listing is missing its asset");
      }
      return {
        ...base,
        listingType: "cosmetic",
        asset: mapCosmeticAsset(listing.cosmeticAsset),
      };
    case "pixegotchi":
      if (!listing.pixegotchi) {
        throw new Error("Pixegotchi listing is missing its asset");
      }
      return {
        ...base,
        listingType: "pixegotchi",
        asset: {
          id: listing.pixegotchi.id,
          name: listing.pixegotchi.name,
          level: listing.pixegotchi.level,
          element: listing.pixegotchi.element,
          rarity: listing.pixegotchi.rarity,
        },
      };
  }
};

export const mapMarketplacePurchase = (
  purchase: Prisma.MarketplacePurchaseGetPayload<object>,
): MarketplacePurchase => ({
  id: purchase.id,
  listingId: purchase.listingId,
  buyerId: purchase.buyerId,
  sellerId: purchase.sellerId,
  quantity: purchase.quantity,
  unitPrice: purchase.unitPrice.toString(),
  subtotal: purchase.subtotal.toString(),
  commissionBps: purchase.commissionBps,
  commissionAmount: purchase.commissionAmount.toString(),
  sellerProceeds: purchase.sellerProceeds.toString(),
  currency: purchase.currency,
  createdAt: purchase.createdAt.toISOString(),
});
