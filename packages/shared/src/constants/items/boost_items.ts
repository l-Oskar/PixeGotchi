import { Item } from "../../types/item";
import { ItemType, RarityType } from "../../enums";
import { ITEMS_IMG } from "./items_img";

export const COFFEE: Item = {
  itemId: "coffee",
  name: "Coffee",
  description: "A hot coffee that restores a small amount of energy.",
  itemType: ItemType.boost,
  rarity: RarityType.common,
  effects: {
    hunger: -1,
    happiness: 5,
    health: 0,
    cleanliness: 0,
    energy: 10,
    buffs: [],
  },
  cooldownMinutes: 60,
  maxPerDay: 4,
  minLevel: 1,
  iconUrl: ITEMS_IMG.boost.coffee,
  isStackable: true,
  maxStack: 10,
};

export const ENERGY_DRINK: Item = {
  itemId: "energy_drink",
  name: "Energy Drink",
  description: "A fizzy drink that quickly restores energy.",
  itemType: ItemType.boost,
  rarity: RarityType.uncommon,
  effects: {
    hunger: 0,
    happiness: 0,
    health: -2,
    cleanliness: 0,
    energy: 20,
    buffs: [],
  },
  cooldownMinutes: 120,
  maxPerDay: 3,
  minLevel: 2,
  iconUrl: ITEMS_IMG.boost.energy_drink,
  isStackable: true,
  maxStack: 10,
};

export const POWER_BAR: Item = {
  itemId: "power_bar",
  name: "Power Bar",
  description: "A nutritious bar that boosts stamina and mood.",
  itemType: ItemType.boost,
  rarity: RarityType.rare,
  effects: {
    hunger: 10,
    happiness: 5,
    health: 5,
    cleanliness: 0,
    energy: 30,
    buffs: [],
  },
  cooldownMinutes: 180,
  maxPerDay: 2,
  minLevel: 5,
  iconUrl: ITEMS_IMG.boost.power_bar,
  isStackable: true,
  maxStack: 5,
};

export const LIGHTNING_FLASK: Item = {
  itemId: "lightning_flask",
  name: "Lightning Flask",
  description: "A charged flask filled with powerful energy.",
  itemType: ItemType.boost,
  rarity: RarityType.epic,
  effects: {
    hunger: 0,
    happiness: 10,
    health: 5,
    cleanliness: 0,
    energy: 50,
    buffs: [],
  },
  cooldownMinutes: 240,
  maxPerDay: 2,
  minLevel: 8,
  iconUrl: ITEMS_IMG.boost.lightning_flask,
  isStackable: false,
  maxStack: 3,
};

export const DIVINE_SPARK: Item = {
  itemId: "divine_spark",
  name: "Divine Spark",
  description: "A mythical spark overflowing with divine power.",
  itemType: ItemType.boost,
  rarity: RarityType.mythic,
  effects: {
    hunger: 0,
    happiness: 15,
    health: 10,
    cleanliness: 0,
    energy: 75,
    buffs: [],
  },
  cooldownMinutes: 360,
  maxPerDay: 1,
  minLevel: 12,
  iconUrl: ITEMS_IMG.boost.divine_spark,
  isStackable: false,
  maxStack: 1,
};

export const MEGA_BOOST: Item = {
  itemId: "mega_boost",
  name: "Mega Boost",
  description: "An experimental boost that grants massive energy.",
  itemType: ItemType.boost,
  rarity: RarityType.legendary,
  effects: {
    hunger: -5,
    happiness: 20,
    health: 10,
    cleanliness: 0,
    energy: 100,
    buffs: [],
  },
  cooldownMinutes: 720,
  maxPerDay: 1,
  minLevel: 15,
  iconUrl: ITEMS_IMG.boost.mega_boost,
  isStackable: false,
  maxStack: 1,
};

export const BOOST_ITEMS: Item[] = [
  COFFEE,
  ENERGY_DRINK,
  POWER_BAR,
  LIGHTNING_FLASK,
  DIVINE_SPARK,
  MEGA_BOOST,
];
