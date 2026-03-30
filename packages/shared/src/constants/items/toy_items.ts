import { Item } from "../../types/item";
import { ItemType, RarityType } from "../../enums";

export const SMALL_TOY: Item = {
  itemId: "small_toy",
  name: "Small toy",
  description: "A fun toy that greatly increases happiness.",
  itemType: ItemType.toy,
  rarity: RarityType.common,
  effects: {
    hunger: 0,
    happiness: 15,
    health: 0,
    cleanliness: -5,
    energy: -5,
    buffs: [],
  },
  cooldownMinutes: 15,
  maxPerDay: 10,
  minLevel: 1,
  iconUrl: null,
  isStackable: false,
  maxStack: null,
};

export const RUBBER_BALL: Item = {
  itemId: "rubber_ball",
  name: "Rubber Ball",
  description: "A fun toy that greatly increases happiness.",
  itemType: ItemType.toy,
  rarity: RarityType.uncommon,
  effects: {
    hunger: 0,
    happiness: 25,
    health: 0,
    cleanliness: -5,
    energy: -10,
    buffs: [],
  },
  cooldownMinutes: 15,
  maxPerDay: 10,
  minLevel: 1,
  iconUrl: null,
  isStackable: false,
  maxStack: null,
};

export const TOY_ITEMS: Item[] = [SMALL_TOY, RUBBER_BALL];
