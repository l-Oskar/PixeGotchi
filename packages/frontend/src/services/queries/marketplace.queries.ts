import type { CreateCosmeticMarketplaceListingInput } from "@pixegotchi/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/user.store";
import { marketApi } from "../api/marketplace";
import { ROOM_COSMETICS_KEYS } from "./room-cosmetics.queries";

export const MARKETPLACE_KEYS = {
  listings: ["marketplace", "listings"] as const,
};

const invalidateCosmeticMarketplaceState = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.listings });
  queryClient.invalidateQueries({
    queryKey: ROOM_COSMETICS_KEYS.ownership,
  });
  queryClient.invalidateQueries({
    queryKey: ROOM_COSMETICS_KEYS.inventory,
  });
  queryClient.invalidateQueries({ queryKey: ROOM_COSMETICS_KEYS.shop });
};

export const useMarketplaceListings = () =>
  useQuery({
    queryKey: MARKETPLACE_KEYS.listings,
    queryFn: marketApi.getListings,
  });

export const useCreateMarketplaceListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCosmeticMarketplaceListingInput) =>
      marketApi.createListing(input),
    onSuccess: () => invalidateCosmeticMarketplaceState(queryClient),
  });
};

export const useBuyMarketplaceListing = () => {
  const queryClient = useQueryClient();
  const updateBalance = useUserStore((state) => state.updateBallance);

  return useMutation({
    mutationFn: (listingId: number) => marketApi.buyListing(listingId),
    onSuccess: ({ pgcBalance }) => {
      updateBalance(pgcBalance);
      invalidateCosmeticMarketplaceState(queryClient);
    },
  });
};

export const useCancelMarketplaceListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: number) => marketApi.cancelListing(listingId),
    onSuccess: () => invalidateCosmeticMarketplaceState(queryClient),
  });
};
