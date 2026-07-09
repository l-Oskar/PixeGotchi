import type { ItemType, RarityType } from "../enums";
import type { Item } from "./item";

export interface InventoryItem {
  id: number;
  userId: number;
  itemId: string;
  itemType: ItemType;
  rarity: RarityType;
  quantity: number;
  createdAt: string | Date;
}
export interface InventoryWithDetails {
  id: number;
  userId: number;
  itemId: string;
  itemType: ItemType;
  rarity: RarityType;
  quantity: number;
  createdAt: string | Date;
  details: Item | null;
  cooldownRemainingMinutes?: number;
}

export interface Inventory {
  inventory: InventoryItem[];
}
