import { Item } from "../../types/item";
import { ItemType, RarityType } from "../../enums";
import {MEDICINE_IMG} from './items_img'

export const PILL: Item = {
  itemId: "pill",
  name: "Pill",
  description: "Cures light sickness and restores some health.",
  itemType: ItemType.medicine,
  rarity: RarityType.common,
  effects: {
    hunger: 0,
    happiness: 5,
    health: 10,
    cleanliness: 0,
    energy: 0,
    buffs: [],
  },
  cooldownMinutes: 60,
  maxPerDay: 3,
  minLevel: 1,
  iconUrl: MEDICINE_IMG.pill,
  isStackable: true,
  maxStack: 20,
};

export const SMALL_MEDICINE: Item = {
  itemId: "small_medicine",
  name: "Small Medicine",
  description: "Cures light sickness and restores some health.",
  itemType: ItemType.medicine,
  rarity: RarityType.uncommon,
  effects: {
    hunger: 0,
    happiness: 5,
    health: 25,
    cleanliness: 0,
    energy: 0,
    buffs: [],
  },
  cooldownMinutes: 60,
  maxPerDay: 3,
  minLevel: 1,
  iconUrl: MEDICINE_IMG.small_medicine,
  isStackable: true,
  maxStack: 20,
};

export const MEDICINE_ITEMS: Item[] = [SMALL_MEDICINE, PILL];
