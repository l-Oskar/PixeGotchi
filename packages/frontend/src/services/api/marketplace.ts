import type {
  BuyMarketplaceListingInput,
  BuyMarketplaceListingResponse,
  CreateMarketplaceListingInput,
  ListingType,
  MarketplaceConfigResponse,
  MarketplaceListingsResponse,
  MarketplaceSellableResponse,
  PlayerMarketplaceListing,
} from "@pixegotchi/shared";
import { apiClient } from "./client";

export const marketApi = {
  getConfig: async (): Promise<MarketplaceConfigResponse> => {
    const { data } =
      await apiClient.get<MarketplaceConfigResponse>("/marketplace/config");
    return data;
  },

  getListings: async (
    listingType?: ListingType,
    mine = false,
  ): Promise<MarketplaceListingsResponse> => {
    const { data } = await apiClient.get<MarketplaceListingsResponse>(
      "/marketplace/listings",
      {
        params: {
          ...(listingType ? { listingType } : {}),
          ...(mine ? { mine: "true" } : {}),
        },
      },
    );
    return data;
  },

  getSellable: async (
    listingType: ListingType,
  ): Promise<MarketplaceSellableResponse> => {
    const { data } = await apiClient.get<MarketplaceSellableResponse>(
      "/marketplace/sellable",
      { params: { listingType } },
    );
    return data;
  },

  createListing: async (
    input: CreateMarketplaceListingInput,
  ): Promise<PlayerMarketplaceListing> => {
    const { data } = await apiClient.post<PlayerMarketplaceListing>(
      "/marketplace/listings",
      input,
    );
    return data;
  },

  buyListing: async (
    listingId: number,
    input: BuyMarketplaceListingInput,
  ): Promise<BuyMarketplaceListingResponse> => {
    const { data } = await apiClient.post<BuyMarketplaceListingResponse>(
      `/marketplace/listings/${listingId}/buy`,
      input,
    );
    return data;
  },

  cancelListing: async (listingId: number): Promise<void> => {
    await apiClient.delete(`/marketplace/listings/${listingId}`);
  },
};
