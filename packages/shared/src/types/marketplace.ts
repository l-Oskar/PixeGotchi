import { CurrencyType } from "../enums";
import type { RoomCosmeticAsset } from "./room_cosmetics";

export interface MarketplaceListing {
  id: number;
  itemId: string;
  item: string;
  price: number;
  currency: CurrencyType;
  seller: string;
  icon: string;
}

export interface MarketplaceSeller {
  id: number;
  username: string | null;
}

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

export interface CosmeticMarketplaceListingsResponse {
  listings: CosmeticMarketplaceListing[];
}

export interface CreateCosmeticMarketplaceListingInput {
  listingType: "cosmetic";
  cosmeticAssetId: string;
  price: number;
  currency: "pgc";
}

export interface BuyCosmeticMarketplaceListingResponse {
  listingId: number;
  cosmeticAssetId: string;
  pgcBalance: string;
}
