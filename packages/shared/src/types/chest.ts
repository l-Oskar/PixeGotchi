import { RarityType, ChestType } from "../enums";

export interface ChestInfo {
  chest_type: ChestType;
  guaranteed_items: number;
  bonus_chance: number;
}

export interface ChestItem {
  item_id: string;
  quantity: number;
  rarity: RarityType;
}

export interface ChestReward {
  items: ChestItem[];
  total_value: number;
}
