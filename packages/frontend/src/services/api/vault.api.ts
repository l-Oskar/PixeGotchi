import { apiClient } from "./client";

export const vaultApi = {
  getAllVault: async () => {
    const { data } = await apiClient.get("/vault");
    return data;
  },
};
