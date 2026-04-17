import { RarityType, ChestType, ItemType } from "../enums";

export interface Chest {
  id: number;
  itemType: "chest";
  chestType: ChestType;
  rarity: RarityType;
  rewards: ChestRewards;
  iconUrl: string | null;
  createdAt: Date | null;
}

export interface ChestInventory {
  chestType: ChestType;
  count: number;
}

export interface ChestInfo {
  chestType: ChestType;
  rarity: RarityType;
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
