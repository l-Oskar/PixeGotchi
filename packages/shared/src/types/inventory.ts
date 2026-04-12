import type { ItemType } from "../enums";
import { ChestInfo } from "./chest";
import type { Item } from "./item";

export interface InventoryItem {
  id: number;
  userId: number;
  itemId: string;
  itemType: ItemType;
  quantity: number;
  createdAt: string | Date;
}
export interface InventoryWithDetails {
  id: number;
  userId: number;
  itemId: string;
  itemType: ItemType;
  quantity: number;
  createdAt: string | Date;
  details: Item | null;
}

export interface Inventory {
  inventory: InventoryItem[];
}
