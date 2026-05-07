import { Item } from "../../types/item";
import { ItemType, RarityType } from "../../enums";
import { ITEMS_IMG } from "./items_img";

export const SMALL_TOY: Item = {
  itemId: "small_toy",
  name: "Small Toy",
  description: "A simple toy that slightly increases happiness.",
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
  iconUrl: ITEMS_IMG.toy.small_toy,
  isStackable: false,
  maxStack: null,
};

export const RUBBER_BALL: Item = {
  itemId: "rubber_ball",
  name: "Rubber Ball",
  description: "A bouncy ball that boosts happiness and energy.",
  itemType: ItemType.toy,
  rarity: RarityType.uncommon,
  effects: {
    hunger: -2,
    happiness: 25,
    health: 0,
    cleanliness: -6,
    energy: 5,
    buffs: [],
  },
  cooldownMinutes: 25,
  maxPerDay: 8,
  minLevel: 3,
  iconUrl: ITEMS_IMG.toy.rubber_ball,
  isStackable: false,
  maxStack: null,
};

export const PUZZLE: Item = {
  itemId: "puzzle",
  name: "Puzzle",
  description: "An entertaining puzzle that improves focus and happiness.",
  itemType: ItemType.toy,
  rarity: RarityType.rare,
  effects: {
    hunger: -3,
    happiness: 35,
    health: 5,
    cleanliness: -4,
    energy: -2,
    buffs: [],
  },
  cooldownMinutes: 40,
  maxPerDay: 6,
  minLevel: 5,
  iconUrl: ITEMS_IMG.toy.puzzle,
  isStackable: false,
  maxStack: null,
};

export const PLUSH: Item = {
  itemId: "plush",
  name: "Plush",
  description: "A soft plush companion that provides comfort and joy.",
  itemType: ItemType.toy,
  rarity: RarityType.epic,
  effects: {
    hunger: 0,
    happiness: 50,
    health: 10,
    cleanliness: -2,
    energy: 10,
    buffs: [],
  },
  cooldownMinutes: 60,
  maxPerDay: 4,
  minLevel: 8,
  iconUrl: ITEMS_IMG.toy.plush,
  isStackable: false,
  maxStack: null,
};

export const MAGIC_WAND: Item = {
  itemId: "magic_wand",
  name: "Magic Wand",
  description: "A mysterious wand filled with playful magical energy.",
  itemType: ItemType.toy,
  rarity: RarityType.mythic,
  effects: {
    hunger: -5,
    happiness: 70,
    health: 15,
    cleanliness: -8,
    energy: 15,
    buffs: [],
  },
  cooldownMinutes: 90,
  maxPerDay: 3,
  minLevel: 12,
  iconUrl: ITEMS_IMG.toy.magic_wand,
  isStackable: false,
  maxStack: null,
};

export const GAMEPAD: Item = {
  itemId: "gamepad",
  name: "Gamepad",
  description: "A legendary gaming device that delivers maximum fun.",
  itemType: ItemType.toy,
  rarity: RarityType.legendary,
  effects: {
    hunger: -8,
    happiness: 100,
    health: 20,
    cleanliness: -10,
    energy: -15,
    buffs: [],
  },
  cooldownMinutes: 120,
  maxPerDay: 2,
  minLevel: 15,
  iconUrl: ITEMS_IMG.toy.gamepad,
  isStackable: false,
  maxStack: null,
};

export const TOY_ITEMS: Item[] = [
  SMALL_TOY,
  RUBBER_BALL,
  PUZZLE,
  PLUSH,
  MAGIC_WAND,
  GAMEPAD,
];
