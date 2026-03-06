import type { ItemType, RarityType } from "../enums";
import type { ItemBuffs } from "./item_buffs";

export interface InventoryItem {
  id: number;
  userId: number;
  itemId: string;
  itemType: ItemType;
  quantity: number;
  createdAt: string;
}

export interface ItemEffects {
  hunger: number;
  happiness: number;
  health: number;
  cleanliness: number;
  energy: number;
  buffs: ItemBuffs[] | [];
}

export interface Item {
  id: number;
  itemId: string;
  name: string;
  description: string | null;
  itemType: ItemType;
  rarity: RarityType;
  effects: ItemEffects;
  cooldownMinutes: number | null;
  maxPerDay: number | null;
  minLevel: number | null;
  iconUrl: string | null;
  isStackable: boolean;
  maxStack: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface Inventory {
  inventory: InventoryItem[];
}
