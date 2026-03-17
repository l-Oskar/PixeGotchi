import { apiClient } from "./client";
import { InventoryItem, InventoryWithDetails, Item } from "@shared";

const INVENTORY_URL = "/inventory";
const INVENTORY_KEYS = {
  getInventory: INVENTORY_URL,
  getDetailed: `${INVENTORY_URL}/detailed` as const,
  addItem: `${INVENTORY_URL}/add` as const,
  useItem: `${INVENTORY_URL}/use` as const,
};

export const inventoryApi = {
  getAll: async (): Promise<InventoryItem[]> => {
    const { data } = await apiClient.get(INVENTORY_KEYS.getInventory);
    return data;
  },
  getDetailed: async (): Promise<InventoryWithDetails[]> => {
    const { data } = await apiClient.get(INVENTORY_KEYS.getDetailed);
    return data;
  },
  addItem: async (
    itemId: string,
    quantity?: number,
  ): Promise<InventoryItem> => {
    const { data } = await apiClient.post(INVENTORY_KEYS.addItem, {
      itemId,
      quantity,
    });
    return data;
  },
  useItem: async (itemId: number, quantity?: number): Promise<void> => {
    const { data } = await apiClient.post(INVENTORY_KEYS.useItem, {
      itemId,
      quantity,
    });
    return data;
  },
};
