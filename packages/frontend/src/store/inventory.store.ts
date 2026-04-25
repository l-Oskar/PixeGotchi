import {
  InventoryItem,
  InventoryWithDetails,
  Chest,
  ChestInventory,
} from "@shared";
import { create } from "zustand";

interface InventoryStore {
  inventory: InventoryItem[] | null;
  sortedChests: ChestInventory[] | null;
  chests: Chest[] | null;
  detailedInventory: InventoryWithDetails[] | [];
  updateInventory: (inventory: InventoryWithDetails[]) => void;
  updateChests: (chests: Chest[]) => void;
  updateSortedChests: (sortedChests: ChestInventory[]) => void;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  inventory: null,
  chests: null,
  sortedChests: null,
  detailedInventory: [],
  updateInventory: (inventory: InventoryWithDetails[] | []) =>
    set({ detailedInventory: inventory }),
  updateChests: (chests: Chest[] | []) =>
    set({
      chests: chests,
    }),
  updateSortedChests: (sortedChests: ChestInventory[]) =>
    set({
      sortedChests: sortedChests,
    }),
}));
