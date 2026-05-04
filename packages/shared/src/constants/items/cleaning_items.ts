import { Item } from "../../types/item";
import { ItemType, RarityType } from "../../enums";
import { ITEMS_IMG } from "./items_img";

export const WATER: Item = {
  itemId: "water",
  name: "Water",
  description: "Cleans your Pixegotchi",
  itemType: ItemType.cleaning,
  rarity: RarityType.common,
  effects: {
    hunger: 0,
    happiness: 5,
    health: 0,
    cleanliness: 15,
    energy: -5,
    buffs: [],
  },
  cooldownMinutes: 30,
  maxPerDay: 5,
  minLevel: 1,
  iconUrl: ITEMS_IMG.cleaning.water,
  isStackable: true,
  maxStack: 50,
};

export const SOAP: Item = {
  itemId: "soap",
  name: "Soap",
  description: "Cleans your Pixegotchi and slightly improves happiness.",
  itemType: ItemType.cleaning,
  rarity: RarityType.uncommon,
  effects: {
    hunger: 0,
    happiness: 5,
    health: 0,
    cleanliness: 30,
    energy: -5,
    buffs: [],
  },
  cooldownMinutes: 30,
  maxPerDay: 5,
  minLevel: 1,
  iconUrl: ITEMS_IMG.cleaning.soap,
  isStackable: true,
  maxStack: 50,
};

export const CLEANING_ITEMS: Item[] = [WATER, SOAP];
