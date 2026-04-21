import { InventoryItem, InventoryWithDetails, Chest } from "@shared";
import { create } from "zustand";

interface InventoryStore {
  inventory: InventoryItem[] | null;
  chests: Chest[] | null;
  detailedInventory: InventoryWithDetails[] | [];
  updateInventory: (inventory: InventoryWithDetails[]) => void;
  updateChests: (chests: Chest[]) => void;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  inventory: null,
  chests: null,
  detailedInventory: [],
  updateInventory: (inventory: InventoryWithDetails[] | []) =>
    set({ detailedInventory: inventory }),
  updateChests: (chests: Chest[] | []) =>
    set({
      chests,
    }),
}));
