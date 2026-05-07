import { Item } from "../../types/item";
import { ItemType, RarityType } from "../../enums";
import { ITEMS_IMG } from "./items_img";

export const THERMOMETER: Item = {
  itemId: "thermometer",
  name: "Thermometer",
  description:
    "Checks your Pixegotchi's temperature. Slightly improves health by early detection.",
  itemType: ItemType.medicine,
  rarity: RarityType.common,
  effects: {
    hunger: 0,
    happiness: 0,
    health: 10,
    cleanliness: 0,
    energy: 0,
    buffs: [],
  },
  cooldownMinutes: 30,
  maxPerDay: 5,
  minLevel: 1,
  iconUrl: ITEMS_IMG.medicine.thermometer,
  isStackable: true,
  maxStack: 99,
};

export const BANDAGE: Item = {
  itemId: "bandage",
  name: "Bandage",
  description:
    "A simple bandage that patches up minor wounds and stops health from dropping further.",
  itemType: ItemType.medicine,
  rarity: RarityType.uncommon,
  effects: {
    hunger: 0,
    happiness: 3,
    health: 22,
    cleanliness: 0,
    energy: 0,
    buffs: [],
  },
  cooldownMinutes: 60,
  maxPerDay: 3,
  minLevel: 5,
  iconUrl: ITEMS_IMG.medicine.bandage,
  isStackable: true,
  maxStack: 50,
};

export const PILL: Item = {
  itemId: "pill",
  name: "Pill",
  description:
    "A medicinal pill that treats mild illness and restores a solid chunk of health.",
  itemType: ItemType.medicine,
  rarity: RarityType.rare,
  effects: {
    hunger: 0,
    happiness: 5,
    health: 38,
    cleanliness: 0,
    energy: 5,
    buffs: [],
  },
  cooldownMinutes: 60,
  maxPerDay: 3,
  minLevel: 15,
  iconUrl: ITEMS_IMG.medicine.pill,
  isStackable: true,
  maxStack: 30,
};

export const SMALL_MEDICINE: Item = {
  itemId: "small_medicine",
  name: "Medicine Shot",
  description:
    "A quick injection of concentrated medicine. Rapidly restores health and grants a regeneration buff.",
  itemType: ItemType.medicine,
  rarity: RarityType.epic,
  effects: {
    hunger: 0,
    happiness: -5,
    health: 55,
    cleanliness: 0,
    energy: 10,
    buffs: [],
  },
  cooldownMinutes: 120,
  maxPerDay: 2,
  minLevel: 30,
  iconUrl: ITEMS_IMG.medicine.small_medicine,
  isStackable: true,
  maxStack: 10,
};

export const CURE: Item = {
  itemId: "cure",
  name: "Cure",
  description:
    "A mythical elixir brewed from rare herbs. Cures all ailments and massively restores health.",
  itemType: ItemType.medicine,
  rarity: RarityType.mythic,
  effects: {
    hunger: 0,
    happiness: 10,
    health: 75,
    cleanliness: 5,
    energy: 10,
    buffs: [],
  },
  cooldownMinutes: 180,
  maxPerDay: 1,
  minLevel: 50,
  iconUrl: ITEMS_IMG.medicine.cure,
  isStackable: true,
  maxStack: 5,
};

export const ANTIDOTE: Item = {
  itemId: "antidote",
  name: "Antidote",
  description:
    "A legendary alchemical antidote. Fully restores health, removes all debuffs and grants powerful regeneration.",
  itemType: ItemType.medicine,
  rarity: RarityType.legendary,
  effects: {
    hunger: 0,
    happiness: 15,
    health: 100,
    cleanliness: 10,
    energy: 15,
    buffs: [],
  },
  cooldownMinutes: 360,
  maxPerDay: 1,
  minLevel: 70,
  iconUrl: ITEMS_IMG.medicine.antidote,
  isStackable: false,
  maxStack: 1,
};

export const MEDICINE_ITEMS: Item[] = [
  THERMOMETER,
  BANDAGE,
  PILL,
  SMALL_MEDICINE,
  CURE,
  ANTIDOTE,
];
