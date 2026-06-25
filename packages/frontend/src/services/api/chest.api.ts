import { ChestType } from "@pixegotchi/shared";
import { apiClient } from "./client";

export const chestApi = {
  getAllChests: async () => {
    const { data } = await apiClient.get("/chest/");
    return data;
  },

  getSortedChests: async () => {
    const { data } = await apiClient.get("/chest/sorted");
    return data;
  },

  getRandomChest: async () => {
    const { data } = await apiClient.post("/chest/random_chest");
    return data;
  },

  getSpecificChest: async (chestType: ChestType) => {
    const { data } = await apiClient.post("/chest/specific_chest", {
      chestType,
    });
    return data;
  },
};
