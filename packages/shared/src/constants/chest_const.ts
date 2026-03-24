import { ChestType, RarityType } from "../enums";

export const CHEST_DROP_RATES = {
  COMMON_RARE_CHANCE: 70, // 70% шанс дропу після гри
} as const;

export const CHEST_RARITY_WEIGHTS: Record<ChestType, number> = {
  wooden: 45,
  silver: 25,
  golden: 15,
  crystal: 10,
  mythic: 4,
  legendary: 1,
} as const;

export const CHEST_REWARDS = {
  BOOST_BONUS_CHANCE: {
    wooden: 10,
    silver: 20,
    golden: 30,
    crystal: 40,
    mythic: 60,
    legendary: 80,
  },

  EGG_DROP_CHANCE: {
    crystal: 5,
    mythic: 10,
    legendary: 20,
  },

  // Поки не активно
  SPECIAL_ITEM_CHANCE: {
    crystal: 15,
    mythic: 25,
    legendary: 40,
  },
} as const;

export const CHEST_CONFIG: Record<
  ChestType,
  {
    guaranteed_items: number;
    item_rarity_distribution: Record<RarityType, number>;
  }
> = {
  wooden: {
    guaranteed_items: 2,
    item_rarity_distribution: {
      common: 80,
      uncommon: 20,
      rare: 0,
      epic: 0,
      mythic: 0,
      legendary: 0,
      unique: 0,
    },
  },
  solver: {
    guaranteed_items: 2,
    item_rarity_distribution: {
      common: 80,
      uncommon: 20,
      rare: 0,
      epic: 0,
      mythic: 0,
      legendary: 0,
      unique: 0,
    },
  },
  golden: {
    guaranteed_items: 2,
    item_rarity_distribution: {
      common: 80,
      uncommon: 20,
      rare: 0,
      epic: 0,
      mythic: 0,
      legendary: 0,
      unique: 0,
    },
  },
  crystal: {
    guaranteed_items: 2,
    item_rarity_distribution: {
      common: 80,
      uncommon: 20,
      rare: 0,
      epic: 0,
      mythic: 0,
      legendary: 0,
      unique: 0,
    },
  },
  mythic: {
    guaranteed_items: 2,
    item_rarity_distribution: {
      common: 80,
      uncommon: 20,
      rare: 0,
      epic: 0,
      mythic: 0,
      legendary: 0,
      unique: 0,
    },
  },
  legendary: {
    guaranteed_items: 2,
    item_rarity_distribution: {
      common: 80,
      uncommon: 20,
      rare: 0,
      epic: 0,
      mythic: 0,
      legendary: 0,
      unique: 0,
    },
  },
} as const;

export const MARKETPLACE_CONFIG = {
  SELLABLE_CHESTS: ["mythic", "legendary"] as ChestType[],
} as const;
