import type {
  EquipRoomCosmeticInput,
  RoomLoadout,
  SaveRoomLoadoutInput,
  UnequipRoomCosmeticInput,
  UserRoomLoadoutResponse,
} from "@pixegotchi/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { roomCosmeticsApi } from "../api/room-cosmetics.api";

export const ROOM_COSMETICS_KEYS = {
  all: ["room-cosmetics"] as const,
  catalog: ["room-cosmetics", "catalog"] as const,
  ownership: ["room-cosmetics", "ownership"] as const,
  inventory: ["room-cosmetics", "inventory"] as const,
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
