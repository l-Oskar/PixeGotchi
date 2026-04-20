import { Item } from "../../types/item";
import { ItemType, RarityType } from "../../enums";

export const APPLE: Item = {
  itemId: "apple",
  name: "Apple",
  description: "A juicy apple that slightly restores hunger.",
  itemType: ItemType.food,
  rarity: RarityType.common,
  effects: {
    hunger: 15,
    happiness: 2,
    health: 0,
    cleanliness: 0,
    energy: 0,
    buffs: [],
  },
  cooldownMinutes: 0,
  maxPerDay: null,
  minLevel: 1,
  iconUrl: FOOD_IMG.apple,
  isStackable: true,
  maxStack: 99,
};

export const CHERRY: Item = {
  itemId: "cherry",
  name: "Cherry",
  description: "A juicy cherry that restores hunger.",
  itemType: ItemType.food,
  rarity: RarityType.uncommon,
  effects: {
    hunger: 20,
    happiness: 5,
    health: 0,
    cleanliness: 0,
    energy: 0,
    buffs: [],
  },
  cooldownMinutes: 6,
  maxPerDay: null,
  minLevel: 1,
  iconUrl: FOOD_IMG.cherry,
  isStackable: true,
  maxStack: 99,
};

export const FOOD_ITEMS: Item[] = [APPLE, CHERRY];
