import { RarityType, ChestType, ItemType } from "../enums";

export interface ChestInfo {
  chestType: ChestType;
  rarity: Exclude<RarityType, "unique">;
}

export interface ChestRewardItem {
  itemId: string;
  type: ItemType;
  quantity: number;
  rarity: RarityType;
}

export interface ChestRewards {
  items: ChestRewardItem[];
  egg: boolean;
  totalValue: number;
}

export interface ChestConfig {
  guaranteed_items: number;
  item_rarity_distribution: Record<RarityType, number>;
}
