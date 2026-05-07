import { Item } from "../../types/item";
import { ItemType, RarityType } from "../../enums";
import { ITEMS_IMG } from "./items_img";

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
  iconUrl: ITEMS_IMG.food.apple,
  isStackable: true,
  maxStack: 99,
};

export const PEACH: Item = {
  itemId: "peach",
  name: "Peach",
  description:
    "A soft and sweet peach. Restores a bit more hunger and lifts the mood.",
  itemType: ItemType.food,
  rarity: RarityType.uncommon,
  effects: {
    hunger: 25,
    happiness: 8,
    health: 2,
    cleanliness: 0,
    energy: 0,
    buffs: [],
  },
  cooldownMinutes: 0,
  maxPerDay: null,
  minLevel: 5,
  iconUrl: ITEMS_IMG.food.peach,
  isStackable: true,
  maxStack: 99,
};

export const CHICKEN: Item = {
  itemId: "chicken",
  name: "Chicken Leg",
  description:
    "A well-roasted chicken leg. Substantially fills hunger and gives a nice energy kick.",
  itemType: ItemType.food,
  rarity: RarityType.rare,
  effects: {
    hunger: 45,
    happiness: 10,
    health: 8,
    cleanliness: -3,
    energy: 0,
    buffs: [],
  },
  cooldownMinutes: 30,
  maxPerDay: 3,
  minLevel: 15,
  iconUrl: ITEMS_IMG.food.chicken,
  isStackable: true,
  maxStack: 50,
};

export const BAKON: Item = {
  itemId: "bakon",
  name: "Bakon",
  description:
    "Cured bacon sizzling with otherworldly flavour. Surges energy and happiness to new heights.",
  itemType: ItemType.food,
  rarity: RarityType.epic,
  effects: {
    hunger: 65,
    happiness: 20,
    health: 10,
    cleanliness: -5,
    energy: 0,
    buffs: [],
  },
  cooldownMinutes: 60,
  maxPerDay: 2,
  minLevel: 30,
  iconUrl: ITEMS_IMG.food.bakon,
  isStackable: true,
  maxStack: 20,
};

export const BURGER: Item = {
  itemId: "burger",
  name: "Burger",
  description:
    "A massive, juicy burger stacked high. Greatly restores hunger and grants an energy buff.",
  itemType: ItemType.food,
  rarity: RarityType.mythic,
  effects: {
    hunger: 75,
    happiness: 30,
    health: 15,
    cleanliness: -10,
    energy: 10,
    buffs: [],
  },
  cooldownMinutes: 120,
  maxPerDay: 1,
  minLevel: 50,
  iconUrl: ITEMS_IMG.food.burger,
  isStackable: true,
  maxStack: 10,
};

export const LOBSTER: Item = {
  itemId: "lobster",
  name: "Lobster",
  description:
    "A legendary delicacy beyond compare. One taste fully restores your creature and grants powerful buffs.",
  itemType: ItemType.food,
  rarity: RarityType.legendary,
  effects: {
    hunger: 100,
    happiness: 45,
    health: 40,
    cleanliness: 10,
    energy: 15,
    buffs: [],
  },
  cooldownMinutes: 240,
  maxPerDay: 1,
  minLevel: 70,
  iconUrl: ITEMS_IMG.food.lobster,
  isStackable: false,
  maxStack: 1,
};

export const FOOD_ITEMS: Item[] = [
  APPLE,
  PEACH,
  CHICKEN,
  BAKON,
  BURGER,
  LOBSTER,
];
