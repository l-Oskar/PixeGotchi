import { ChestType, RarityType, ItemType } from "../enums";

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
  } as Record<ChestType, number>,

  EGG_DROP_CHANCE: {
    golden: 1,
    crystal: 5,
    mythic: 10,
    legendary: 20,
  } as Record<Partial<ChestType>, number>,

  // Поки не активно
  SPECIAL_ITEM_CHANCE: {
    crystal: 15,
    mythic: 25,
    legendary: 40,
  } as Record<Partial<ChestType>, number>,
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
    },
  },
  silver: {
    guaranteed_items: 2,
    item_rarity_distribution: {
      common: 50,
      uncommon: 40,
      rare: 10,
      epic: 0,
      mythic: 0,
      legendary: 0,
    },
  },
  golden: {
    guaranteed_items: 2,
    item_rarity_distribution: {
      common: 30,
      uncommon: 40,
      rare: 25,
      epic: 5,
      mythic: 0,
      legendary: 0,
    },
  },
  crystal: {
    guaranteed_items: 2,
    item_rarity_distribution: {
      common: 0,
      uncommon: 15,
      rare: 35,
      epic: 25,
      mythic: 20,
      legendary: 5,
    },
  },
  mythic: {
    guaranteed_items: 2,
    item_rarity_distribution: {
      common: 0,
      uncommon: 0,
      rare: 20,
      epic: 35,
      mythic: 35,
      legendary: 10,
    },
  },
  legendary: {
    guaranteed_items: 2,
    item_rarity_distribution: {
      common: 0,
      uncommon: 0,
      rare: 15,
      epic: 25,
      mythic: 25,
      legendary: 35,
    },
  },
} as const;

export const CHEST_TYPE_TO_RARITY: Record<ChestType, RarityType> = {
  wooden: "common",
  silver: "uncommon",
  golden: "rare",
  crystal: "epic",
  mythic: "mythic",
  legendary: "legendary",
} as const;

export const GUARANTEED_ITEM_TYPES: ItemType[] = [
  "food",
  "medicine",
  "cleaning",
  "toy",
];
