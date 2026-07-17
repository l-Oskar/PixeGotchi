import type {
  ChestType,
  CurrencyType,
  ElementType,
  ItemType,
  MarketplaceListingStatus,
  RarityType,
} from "../enums";
import type { RoomCosmeticAsset } from "./room_cosmetics";

export interface MarketplaceSeller {
  id: number;
  username: string | null;
}

export interface MarketplaceConfigResponse {
  commissionBps: number;
  listingDurationDays: number;
  maxActiveListings: number;
  minUnitPrice: string;
  maxUnitPrice: string;
  enabledCurrencies: CurrencyType[];
}

interface MarketplaceListingBase {
  id: number;
  source: "player";
  seller: MarketplaceSeller;
  initialQuantity: number;
  remainingQuantity: number;
  unitPrice: string;
  currency: CurrencyType;
  status: MarketplaceListingStatus;
  createdAt: string;
  expiresAt: string;
  closedAt: string | null;
}

export interface MarketplaceEggPreview {
  id: number;
  createdAt: string;
}

export interface MarketplaceItemPreview {
  itemId: string;
  name: string;
  itemType: ItemType;
  rarity: RarityType;
  iconUrl: string | null;
}

export interface MarketplaceChestPreview {
  chestType: ChestType;
  rarity: RarityType;
}

export interface MarketplacePixegotchiPreview {
  id: number;
  name: string;
  level: number;
  element: ElementType;
  rarity: RarityType;
}

export type SellableMarketplaceAsset =
  | {
      listingType: "egg";
      maxQuantity: 1;
      asset: MarketplaceEggPreview;
    }
  | {
      listingType: "item";
      maxQuantity: number;
      asset: MarketplaceItemPreview;
    }
  | {
      listingType: "chest";
      maxQuantity: number;
      asset: MarketplaceChestPreview;
    }
  | {
      listingType: "cosmetic";
      maxQuantity: 1;
      isEquipped: boolean;
      asset: RoomCosmeticAsset;
    }
  | {
      listingType: "pixegotchi";
      maxQuantity: 1;
      asset: MarketplacePixegotchiPreview;
    };

export interface MarketplaceSellableResponse {
  assets: SellableMarketplaceAsset[];
  activeListingCount: number;
  maxActiveListings: number;
}

export type PlayerMarketplaceListing =
  | (MarketplaceListingBase & {
      listingType: "egg";
      asset: MarketplaceEggPreview;
    })
  | (MarketplaceListingBase & {
      listingType: "item";
      asset: MarketplaceItemPreview;
    })
  | (MarketplaceListingBase & {
      listingType: "chest";
      asset: MarketplaceChestPreview;
    })
  | (MarketplaceListingBase & {
      listingType: "cosmetic";
      asset: RoomCosmeticAsset;
    })
  | (MarketplaceListingBase & {
      listingType: "pixegotchi";
      asset: MarketplacePixegotchiPreview;
    });

export interface MarketplaceListingsResponse {
  listings: PlayerMarketplaceListing[];
}

interface CreateMarketplaceListingBase {
  unitPrice: string;
  currency: "pgc";
}

export type CreateMarketplaceListingInput =
  | (CreateMarketplaceListingBase & {
      listingType: "egg";
      eggId: number;
    })
  | (CreateMarketplaceListingBase & {
      listingType: "item";
      itemId: string;
      quantity: number;
    })
  | (CreateMarketplaceListingBase & {
      listingType: "chest";
      chestType: ChestType;
      quantity: number;
    })
  | (CreateMarketplaceListingBase & {
      listingType: "cosmetic";
      cosmeticAssetId: string;
    })
  | (CreateMarketplaceListingBase & {
      listingType: "pixegotchi";
      pixegotchiId: number;
    });

export interface BuyMarketplaceListingInput {
  quantity: number;
}

export interface MarketplacePurchase {
  id: number;
  listingId: number;
  buyerId: number;
  sellerId: number;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  commissionBps: number;
  commissionAmount: string;
  sellerProceeds: string;
  currency: CurrencyType;
  createdAt: string;
}

export interface BuyMarketplaceListingResponse {
  listing: PlayerMarketplaceListing;
  purchase: MarketplacePurchase;
  pgcBalance: string;
}

export interface MarketplaceTreasuryBalance {
  currency: CurrencyType;
  balance: string;
  updatedAt: string;
}

export interface MarketplaceTreasuryTransaction {
  id: number;
  transactionType: "commission" | "distribution";
  currency: CurrencyType;
  amount: string;
  balanceAfter: string;
  purchaseId: number | null;
  adminUserId: number | null;
  recipientUserId: number | null;
  reason: string | null;
  createdAt: string;
}

export interface MarketplaceTreasuryBalancesResponse {
  balances: MarketplaceTreasuryBalance[];
}

export interface MarketplaceTreasuryTransactionsResponse {
  transactions: MarketplaceTreasuryTransaction[];
  nextCursor: number | null;
}

export interface DistributeMarketplaceTreasuryInput {
  userId: number;
  amount: string;
  reason: string;
}

export interface DistributeMarketplaceTreasuryResponse {
  treasury: MarketplaceTreasuryBalance;
  recipientPgcBalance: string;
  transaction: MarketplaceTreasuryTransaction;
}

/**
 * Temporary shape used only by the existing Test marketplace cards.
 */
export interface TestMarketplaceListing {
  id: number;
  itemId: string;
  item: string;
  price: number;
  currency: CurrencyType;
  seller: string;
  icon: string;
}

/**
 * @deprecated Use TestMarketplaceListing for the temporary Test tab.
 */
export type MarketplaceListing = TestMarketplaceListing;

/**
 * @deprecated Compatibility contract for the currently shipped cosmetic-only
 * marketplace. Remove after the generic marketplace service is connected.
 */
export interface CosmeticMarketplaceListing {
  id: number;
  listingType: "cosmetic";
  cosmeticAssetId: string;
  quantity: 1;
  price: string;
  currency: "pgc";
  seller: MarketplaceSeller;
  asset: RoomCosmeticAsset;
  createdAt: string;
}

/** @deprecated Use MarketplaceListingsResponse. */
export interface CosmeticMarketplaceListingsResponse {
  listings: CosmeticMarketplaceListing[];
}

/** @deprecated Use CreateMarketplaceListingInput. */
export interface CreateCosmeticMarketplaceListingInput {
  listingType: "cosmetic";
  cosmeticAssetId: string;
  price: number;
  currency: "pgc";
}

/** @deprecated Use BuyMarketplaceListingResponse. */
export interface BuyCosmeticMarketplaceListingResponse {
  listingId: number;
  cosmeticAssetId: string;
  pgcBalance: string;
}
