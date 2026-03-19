import { Item } from "../../types/item";
import { ItemType, RarityType } from "../../enums";

export const APPLE: Item = {
  id: 1,
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
  iconUrl: null,
  isStackable: true,
  maxStack: 99,
};

export const FOOD_ITEMS: Item[] = [APPLE];
