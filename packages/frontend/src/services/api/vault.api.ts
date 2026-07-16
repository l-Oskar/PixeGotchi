import { apiClient } from "./client";
import { ElementStats, Pixegotchi } from "@pixegotchi/shared";

export const vaultApi = {
  getAllVault: async (): Promise<Pixegotchi[]> => {
    const { data } = await apiClient.get("/vault");
    return data;
  },

  getStatsVault: async (): Promise<ElementStats[]> => {
    const { data } = await apiClient.get("/vault/stats");
    return data;
  },

  activateFromVault: async (pixegotchiId: number): Promise<Pixegotchi> => {
    const { data } = await apiClient.post(
      `/vault/${pixegotchiId}/activate`,
    );
    return data;
  },
};
