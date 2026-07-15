import type {
  BuyCosmeticMarketplaceListingResponse,
  CosmeticMarketplaceListing,
  CosmeticMarketplaceListingsResponse,
  CreateCosmeticMarketplaceListingInput,
} from "@pixegotchi/shared";
import { apiClient } from "./client";

export const marketApi = {
  getListings: async (): Promise<CosmeticMarketplaceListingsResponse> => {
    const { data } =
      await apiClient.get<CosmeticMarketplaceListingsResponse>(
        "/marketplace/listings",
      );
    return data;
  },

  createListing: async (
    input: CreateCosmeticMarketplaceListingInput,
  ): Promise<CosmeticMarketplaceListing> => {
    const { data } = await apiClient.post<CosmeticMarketplaceListing>(
      "/marketplace/listings",
      input,
    );
    return data;
  },

  buyListing: async (
    listingId: number,
  ): Promise<BuyCosmeticMarketplaceListingResponse> => {
    const { data } =
      await apiClient.post<BuyCosmeticMarketplaceListingResponse>(
        `/marketplace/listings/${listingId}/buy`,
      );
    return data;
  },

  cancelListing: async (listingId: number): Promise<void> => {
    await apiClient.delete(`/marketplace/listings/${listingId}`);
  },
};
