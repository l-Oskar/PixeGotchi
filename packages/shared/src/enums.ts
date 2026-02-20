// ============================================
// ENUMS — mirrored from prisma/schema.prisma
// Keep in sync when schema changes!
// ============================================

export enum PixegotchiStatus {
  active = "active",
  critical = "critical",
  vault = "vault",
  dead = "dead",
}

export enum PixegotchiGender {
  male = "male",
  female = "female",
}

export enum ElementType {
  fire = "fire",
  water = "water",
  earth = "earth",
  air = "air",
  electric = "electric",
  ice = "ice",
  grass = "grass",
  metal = "metal",
  ghost = "ghost",
  poison = "poison",
  psychic = "psychic",
  light = "light",
  dark = "dark",
  rainbow = "rainbow",
}

export enum RarityType {
  common = "common",
  uncommon = "uncommon",
  rare = "rare",
  epic = "epic",
  mythic = "mythic",
  legendary = "legendary",
  unique = "unique",
}

export enum ItemType {
  food = "food",
  medicine = "medicine",
  toy = "toy",
  cleaning = "cleaning",
  chest = "chest",
  rename = "rename",
  special = "special",
  boost = "boost",
  resurrection = "resurrection",
}

export enum ListingType {
  egg = "egg",
  pixegotchi = "pixegotchi",
  item = "item",
}

export enum CurrencyType {
  pgc = "pgc",
  ton = "ton",
}

export enum PageType {
  home = "home",
  egg = "egg",
  inventory = "inventory",
  games = "games",
  marketplace = "marketplace",
  vault = "vault",
}
