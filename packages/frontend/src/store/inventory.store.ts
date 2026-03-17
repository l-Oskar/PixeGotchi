import { InventoryItem, InventoryWithDetails } from "@shared";
import { create } from "zustand";

interface InventoryStore {
  inventory: InventoryItem[] | null;
  detailedInventory: InventoryWithDetails[] | [];
  updateInventory: (inventory: InventoryWithDetails[]) => void;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  inventory: null,
  detailedInventory: [],
  updateInventory: (inventory: InventoryWithDetails[] | []) =>
    set({ detailedInventory: inventory }),
}));
