import { Item } from "../../types/item";
import { ItemType, RarityType } from "../../enums";
import { ITEMS_IMG } from "./items_img";

export const WATER: Item = {
  itemId: "water",
  name: "Water",
  description:
    "Cleans your Pixegotchi with a splash of water. Simple but effective.",
  itemType: ItemType.cleaning,
  rarity: RarityType.common,
  effects: {
    hunger: 0,
    happiness: 5,
    health: 0,
    cleanliness: 15,
    energy: 0,
    buffs: [],
  },
  cooldownMinutes: 30,
  maxPerDay: 5,
  minLevel: 1,
  iconUrl: ITEMS_IMG.cleaning.water,
  isStackable: true,
  isTradable: false,
  maxStack: 50,
};

export const TOOTH_BRUSH: Item = {
  itemId: "tooth_brush",
  name: "Tooth Brush",
  description:
    "Keeps teeth sparkling clean and improves overall hygiene noticeably.",
  itemType: ItemType.cleaning,
  rarity: RarityType.uncommon,
  effects: {
    hunger: 0,
    happiness: 8,
    health: 5,
    cleanliness: 25,
    energy: -5,
    buffs: [],
  },
  cooldownMinutes: 60,
  maxPerDay: 3,
  minLevel: 1,
  iconUrl: ITEMS_IMG.cleaning.tooth_brush,
  isStackable: true,
  isTradable: false,
  maxStack: 30,
};

export const SPONCHE: Item = {
  itemId: "sponche",
  name: "Sponge",
  description:
    "A sturdy sponge that scrubs away dirt thoroughly. Leaves your Pixegotchi feeling fresh.",
  itemType: ItemType.cleaning,
  rarity: RarityType.rare,
  effects: {
    hunger: 0,
    happiness: 12,
    health: 8,
    cleanliness: 40,
    energy: -8,
    buffs: [],
  },
  cooldownMinutes: 60,
  maxPerDay: 3,
  minLevel: 1,
  iconUrl: ITEMS_IMG.cleaning.sponche,
  isStackable: true,
  isTradable: false,
  maxStack: 20,
};

export const SOAP: Item = {
  itemId: "soap",
  name: "Soap",
  description:
    "A luxurious soap bar that deeply cleanses and grants a cleanliness buff.",
  itemType: ItemType.cleaning,
  rarity: RarityType.epic,
  effects: {
    hunger: 0,
    happiness: 18,
    health: 15,
    cleanliness: 58,
    energy: -8,
    buffs: [],
  },
  cooldownMinutes: 120,
  maxPerDay: 2,
  minLevel: 1,
  iconUrl: ITEMS_IMG.cleaning.soap,
  isStackable: true,
  isTradable: false,
  maxStack: 10,
};

export const SHOWER: Item = {
  itemId: "shower",
  name: "Shower",
  description:
    "A full shower session. Mythically refreshing — restores cleanliness and energy at once.",
  itemType: ItemType.cleaning,
  rarity: RarityType.mythic,
  effects: {
    hunger: 0,
    happiness: 28,
    health: 25,
    cleanliness: 75,
    energy: 5,
    buffs: [],
  },
  cooldownMinutes: 180,
  maxPerDay: 1,
  minLevel: 1,
  iconUrl: ITEMS_IMG.cleaning.shower,
  isStackable: false,
  isTradable: false,
  maxStack: 1,
};

export const BATH: Item = {
  itemId: "bath",
  name: "Bath",
  description:
    "A legendary full bath ritual. Completely restores cleanliness and deeply rejuvenates body and spirit.",
  itemType: ItemType.cleaning,
  rarity: RarityType.legendary,
  effects: {
    hunger: 0,
    happiness: 45,
    health: 40,
    cleanliness: 100,
    energy: 20,
    buffs: [],
  },
  cooldownMinutes: 360,
  maxPerDay: 1,
  minLevel: 1,
  iconUrl: ITEMS_IMG.cleaning.bath,
  isStackable: false,
  isTradable: false,
  maxStack: 1,
};

export const CLEANING_ITEMS: Item[] = [
  WATER,
  TOOTH_BRUSH,
  SPONCHE,
  SOAP,
  SHOWER,
  BATH,
];
