import type {
  EquipRoomCosmeticInput,
  RoomCosmeticsCatalogResponse,
  RoomCosmeticsInventoryResponse,
  SaveRoomLoadoutInput,
  UnequipRoomCosmeticInput,
  UpdateRoomCosmeticResponse,
  UserRoomCosmeticsResponse,
  UserRoomLoadoutResponse,
} from "@pixegotchi/shared";
import { apiClient } from "./client";

export const roomCosmeticsApi = {
  getCatalog: async (): Promise<RoomCosmeticsCatalogResponse> => {
    const { data } =
      await apiClient.get<RoomCosmeticsCatalogResponse>(
        "/room-cosmetics/catalog",
      );
    return data;
  },

  getOwnership: async (): Promise<UserRoomCosmeticsResponse> => {
    const { data } =
      await apiClient.get<UserRoomCosmeticsResponse>(
        "/room-cosmetics/ownership",
      );
    return data;
  },

  getInventory: async (): Promise<RoomCosmeticsInventoryResponse> => {
    const { data } =
      await apiClient.get<RoomCosmeticsInventoryResponse>(
        "/room-cosmetics/inventory",
      );
    return data;
  },

  getLoadout: async (): Promise<UserRoomLoadoutResponse> => {
    const { data } =
      await apiClient.get<UserRoomLoadoutResponse>(
        "/room-cosmetics/loadout",
      );
    return data;
  },

  saveLoadout: async (
    input: SaveRoomLoadoutInput,
  ): Promise<UpdateRoomCosmeticResponse> => {
    const { data } = await apiClient.put<UpdateRoomCosmeticResponse>(
      "/room-cosmetics/loadout",
      input,
    );
    return data;
  },

  equip: async (
    input: EquipRoomCosmeticInput,
  ): Promise<UpdateRoomCosmeticResponse> => {
    const { data } = await apiClient.post<UpdateRoomCosmeticResponse>(
      "/room-cosmetics/equip",
      input,
    );
    return data;
  },

  unequip: async (
    input: UnequipRoomCosmeticInput,
  ): Promise<UpdateRoomCosmeticResponse> => {
    const { data } = await apiClient.post<UpdateRoomCosmeticResponse>(
      "/room-cosmetics/unequip",
      input,
    );
    return data;
  },
};
