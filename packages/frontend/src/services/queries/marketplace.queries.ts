import type {
  CreateMarketplaceListingInput,
  ListingType,
  UserProfile,
} from "@pixegotchi/shared";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useUserStore } from "@/store/user.store";
import { marketApi } from "../api/marketplace";
import { CHEST_KEYS } from "./chest.queries";
import { EGG_KEYS } from "./egg.queries";
import { INVENTORY_KEYS } from "./inventory.queries";
import { PIXEGOTCHI_KEYS } from "./pixegotchi.queries";
import { ROOM_COSMETICS_KEYS } from "./room-cosmetics.queries";
import { USER_KEYS } from "./users.queries";
import { VAULT_KEYS } from "./vault.queries";

export const MARKETPLACE_KEYS = {
  all: ["marketplace"] as const,
  config: ["marketplace", "config"] as const,
  listings: (listingType?: ListingType, mine = false) =>
    ["marketplace", "listings", listingType ?? "all", mine] as const,
  sellable: (listingType: ListingType) =>
    ["marketplace", "sellable", listingType] as const,
};

const invalidateMarketplaceAssetState = (
  queryClient: QueryClient,
  listingType: ListingType,
) => {
  queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.all });

  switch (listingType) {
    case "egg":
      queryClient.invalidateQueries({ queryKey: EGG_KEYS.all });
      queryClient.invalidateQueries({ queryKey: EGG_KEYS.hatching });
      break;
    case "item":
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.detailed });
      break;
    case "chest":
      queryClient.invalidateQueries({ queryKey: CHEST_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CHEST_KEYS.sorted });
      break;
    case "cosmetic":
      queryClient.invalidateQueries({
        queryKey: ROOM_COSMETICS_KEYS.ownership,
      });
      queryClient.invalidateQueries({
        queryKey: ROOM_COSMETICS_KEYS.inventory,
      });
      queryClient.invalidateQueries({
        queryKey: ROOM_COSMETICS_KEYS.loadout,
      });
      queryClient.invalidateQueries({ queryKey: ROOM_COSMETICS_KEYS.shop });
      break;
    case "pixegotchi":
      queryClient.invalidateQueries({ queryKey: PIXEGOTCHI_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PIXEGOTCHI_KEYS.current });
      queryClient.invalidateQueries({ queryKey: VAULT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: VAULT_KEYS.stats });
      break;
  }
};

const updatePgcBalance = (
  queryClient: QueryClient,
  pgcBalance: string,
) => {
  useUserStore.getState().updateBallance(pgcBalance);
  queryClient.setQueryData<UserProfile | undefined>(
    USER_KEYS.profile,
    (current) => (current ? { ...current, pgcBalance } : current),
  );
};

export const useMarketplaceConfig = () =>
  useQuery({
    queryKey: MARKETPLACE_KEYS.config,
    queryFn: marketApi.getConfig,
    staleTime: 5 * 60 * 1000,
  });

export const useMarketplaceListings = (
  listingType?: ListingType,
  mine = false,
  enabled = true,
) =>
  useQuery({
    queryKey: MARKETPLACE_KEYS.listings(listingType, mine),
    queryFn: () => marketApi.getListings(listingType, mine),
    enabled,
  });

export const useMarketplaceSellable = (
  listingType: ListingType,
  enabled = true,
) =>
  useQuery({
    queryKey: MARKETPLACE_KEYS.sellable(listingType),
    queryFn: () => marketApi.getSellable(listingType),
    enabled,
  });

export const useCreateMarketplaceListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMarketplaceListingInput) =>
      marketApi.createListing(input),
    onSuccess: (listing) =>
      invalidateMarketplaceAssetState(queryClient, listing.listingType),
  });
};

export const useBuyMarketplaceListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      listingId,
      quantity,
    }: {
      listingId: number;
      quantity: number;
      listingType: ListingType;
    }) => marketApi.buyListing(listingId, { quantity }),
    onSuccess: ({ pgcBalance }, variables) => {
      updatePgcBalance(queryClient, pgcBalance);
      invalidateMarketplaceAssetState(
        queryClient,
        variables.listingType,
      );
    },
  });
};

export const useCancelMarketplaceListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      listingId,
    }: {
      listingId: number;
      listingType: ListingType;
    }) => marketApi.cancelListing(listingId),
    onSuccess: (_data, variables) =>
      invalidateMarketplaceAssetState(
        queryClient,
        variables.listingType,
      ),
  });
};
