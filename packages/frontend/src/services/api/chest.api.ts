import { Chest, ChestInventory, ChestType } from "@pixegotchi/shared";
import { apiClient } from "./client";

export const chestApi = {
  getAllChests: async (): Promise<Chest[]> => {
    const { data } = await apiClient.get("/chest/");
    return data;
  },

  getSortedChests: async (): Promise<ChestInventory[]> => {
    const { data } = await apiClient.get("/chest/sorted");
    return data;
  },

  getRandomChest: async (): Promise<Chest> => {
    const { data } = await apiClient.post("/chest/random_chest");
    return data;
  },

  getSpecificChest: async (chestType: ChestType): Promise<Chest> => {
    const { data } = await apiClient.post("/chest/specific_chest", {
      chestType,
    });
    return data;
  },
};
