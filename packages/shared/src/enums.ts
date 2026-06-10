// ============================================
// ENUMS — mirrored from prisma/schema.prisma
// Keep in sync when schema changes!
// ============================================

export const PixegotchiStatus = {
  active: "active",
  critical: "critical",
  vault: "vault",
  dead: "dead",
} as const;

export type PixegotchiStatus =
  (typeof PixegotchiStatus)[keyof typeof PixegotchiStatus];

export const PixegotchiStatsType = {
  health: "health",
  hunger: "hunger",
  energy: "energy",
  happiness: "happiness",
  cleanliness: "cleanliness",
};

export type PixegotchiStatsType =
  (typeof PixegotchiStatsType)[keyof typeof PixegotchiStatsType];

export const PixegotchiGender = {
  male: "male",
  female: "female",
} as const;

export type PixegotchiGender =
  (typeof PixegotchiGender)[keyof typeof PixegotchiGender];

export const ElementType = {
  fire: "fire",
  water: "water",
  earth: "earth",
  air: "air",
  electric: "electric",
  ice: "ice",
  grass: "grass",
  metal: "metal",
  ghost: "ghost",
  poison: "poison",
  psychic: "psychic",
  light: "light",
  dark: "dark",
  rainbow: "rainbow",
} as const;

export type ElementType = (typeof ElementType)[keyof typeof ElementType];

export const RarityType = {
  common: "common",
  uncommon: "uncommon",
  rare: "rare",
  epic: "epic",
  mythic: "mythic",
  legendary: "legendary",
} as const;

export type RarityType = (typeof RarityType)[keyof typeof RarityType];

export const RarityOrder: Record<RarityType, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  mythic: 5,
  legendary: 6,
};

export type RarityOrder = (typeof RarityOrder)[keyof typeof RarityOrder];

export const ItemType = {
  food: "food",
  medicine: "medicine",
  toy: "toy",
  cleaning: "cleaning",
  special: "special",
  boost: "boost",
  chest: "chest",
} as const;

export type ItemType = (typeof ItemType)[keyof typeof ItemType];

export const ItemTypeOrder: Record<ItemType, number> = {
  food: 1,
  medicine: 2,
  toy: 3,
  cleaning: 4,
  special: 5,
  boost: 6,
  chest: 7,
};

export type ItemTypeOrder = (typeof ItemTypeOrder)[keyof typeof ItemTypeOrder];

export const ChestType = {
  wooden: "wooden", // common items
  silver: "silver", // uncommon items
  golden: "golden", // rare items
  crystal: "crystal", // epic items
  mythic: "mythic", // mythic items
  legendary: "legendary", // legendary items
} as const;

export type ChestType = (typeof ChestType)[keyof typeof ChestType];

export const ListingType = {
  egg: "egg",
  pixegotchi: "pixegotchi",
  item: "item",
  chest: "chest",
} as const;

export type ListingType = (typeof ListingType)[keyof typeof ListingType];

export const CurrencyType = {
  pgc: "pgc",
  ton: "ton",
} as const;

export type CurrencyType = (typeof CurrencyType)[keyof typeof CurrencyType];

export const PageType = {
  home: "home",
  egg: "egg",
  inventory: "inventory",
  games: "games",
  marketplace: "marketplace",
  vault: "vault",
  start: "start",
  loader: "loader",
  data: "data",
} as const;

export type PageType = (typeof PageType)[keyof typeof PageType];

export enum EggEvolutionStage {
  BASE = 0,
  STAGE_1 = 1,
  STAGE_2 = 2,
  STAGE_3 = 3,
  STAGE_4 = 4,
  HATCHED = 5,
}

export enum PixegotchiEvolutionStage {
  BABY = 1,
  TEEN = 2,
  ADULT = 3,
}
