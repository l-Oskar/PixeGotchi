import { apiClient } from "./client";

export const vaultApi = {
  getAllVault: async () => {
    const { data } = await apiClient.get("/");
    return data;
  },

  getStatsVault: async () => {
    const { data } = await apiClient.get("/stats");
    return data;
  },
};
