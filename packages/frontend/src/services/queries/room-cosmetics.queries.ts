import type {
  EquipRoomCosmeticInput,
  PurchaseRoomCosmeticInput,
  RoomLoadout,
  SaveRoomLoadoutInput,
  UnequipRoomCosmeticInput,
  UserRoomLoadoutResponse,
} from "@pixegotchi/shared";
import { useUserStore } from "@/store/user.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { roomCosmeticsApi } from "../api/room-cosmetics.api";

export const ROOM_COSMETICS_KEYS = {
  all: ["room-cosmetics"] as const,
  catalog: ["room-cosmetics", "catalog"] as const,
  ownership: ["room-cosmetics", "ownership"] as const,
  inventory: ["room-cosmetics", "inventory"] as const,
  shop: ["room-cosmetics", "shop"] as const,
  loadout: ["room-cosmetics", "loadout"] as const,
};

export const updateRoomCosmeticsLoadoutCache = (
  queryClient: QueryClient,
  loadout: RoomLoadout,
) => {
  queryClient.setQueryData<UserRoomLoadoutResponse>(
    ROOM_COSMETICS_KEYS.loadout,
    { loadout },
  );
};

export const useRoomCosmeticsCatalog = () =>
  useQuery({
    queryKey: ROOM_COSMETICS_KEYS.catalog,
    queryFn: roomCosmeticsApi.getCatalog,
  });

export const useRoomCosmeticsOwnership = () =>
  useQuery({
    queryKey: ROOM_COSMETICS_KEYS.ownership,
    queryFn: roomCosmeticsApi.getOwnership,
  });

export const useRoomCosmeticsInventory = (enabled = true) =>
  useQuery({
    queryKey: ROOM_COSMETICS_KEYS.inventory,
    queryFn: roomCosmeticsApi.getInventory,
    enabled,
  });

export const useRoomCosmeticsShop = () =>
  useQuery({
    queryKey: ROOM_COSMETICS_KEYS.shop,
    queryFn: roomCosmeticsApi.getShop,
  });

export const useRoomCosmeticsLoadout = (enabled = true) =>
  useQuery({
    queryKey: ROOM_COSMETICS_KEYS.loadout,
    queryFn: roomCosmeticsApi.getLoadout,
    enabled,
  });

export const useSaveRoomCosmeticsLoadout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveRoomLoadoutInput) =>
      roomCosmeticsApi.saveLoadout(input),
    onSuccess: ({ loadout }) => {
      updateRoomCosmeticsLoadoutCache(queryClient, loadout);
    },
  });
};

export const usePurchaseRoomCosmetic = () => {
  const queryClient = useQueryClient();
  const updateBalance = useUserStore((state) => state.updateBallance);

  return useMutation({
    mutationFn: (input: PurchaseRoomCosmeticInput) =>
      roomCosmeticsApi.purchase(input),
    onSuccess: ({ pgcBalance }) => {
      updateBalance(pgcBalance);
      queryClient.invalidateQueries({
        queryKey: ROOM_COSMETICS_KEYS.shop,
      });
      queryClient.invalidateQueries({
        queryKey: ROOM_COSMETICS_KEYS.ownership,
      });
      queryClient.invalidateQueries({
        queryKey: ROOM_COSMETICS_KEYS.inventory,
      });
    },
  });
};

export const useEquipRoomCosmetic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: EquipRoomCosmeticInput) =>
      roomCosmeticsApi.equip(input),
    onSuccess: ({ loadout }) => {
      queryClient.setQueryData<UserRoomLoadoutResponse>(
        ROOM_COSMETICS_KEYS.loadout,
        { loadout },
      );
      queryClient.invalidateQueries({
        queryKey: ROOM_COSMETICS_KEYS.ownership,
      });
    },
  });
};

export const useUnequipRoomCosmetic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UnequipRoomCosmeticInput) =>
      roomCosmeticsApi.unequip(input),
    onSuccess: ({ loadout }) => {
      queryClient.setQueryData<UserRoomLoadoutResponse>(
        ROOM_COSMETICS_KEYS.loadout,
        { loadout },
      );
      queryClient.invalidateQueries({
        queryKey: ROOM_COSMETICS_KEYS.ownership,
      });
    },
  });
};
