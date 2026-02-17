import { apiClient } from "./client";

export interface InventoryItem {
  id: number;
  itemId: string;
  itemType: string;
  quantity: number;
}

export const inventoryApi = {
  getAll: async (): Promise<InventoryItem> => {
    const { data } = await apiClient.get("/invetrory");
    return data;
  },
  useItem: async (itemId: number, pixegotchiId: number): Promise<void> => {
    const { data } = await apiClient.post("/inventory/use", {
      itemId,
      pixegotchiId,
    });
    return data;
  },
};
