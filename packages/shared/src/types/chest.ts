import { RarityType, ChestType, ItemType } from "../enums";

export interface Chest {
  id: string;
  itemType: "chest";
  chestType: ChestType;
  rarity: RarityType;
  rewards: ChestRewards;
  iconUrl: string | null;
  createdAt: Date | null;
}

export interface ChestInventory {
  chestType: ChestType;
  quantity: number;
}

export interface ChestInfo {
  chestType: ChestType;
  rarity: RarityType;
}

export interface ChestDescription {
  chestType: ChestType;
  guaranteed_items: number;
  rarity: RarityType;
  boostChance: number;
  eggChance: number;
}

export interface ChestPreview {
  itemId: string;
  type: ItemType;
  rarity: RarityType;
  probability: number | string;
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
