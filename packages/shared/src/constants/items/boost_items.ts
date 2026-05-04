import { Item } from "../../types/item";
import { ItemType, RarityType } from "../../enums";
import { ItemBuffsType } from "../../types/item_buffs";
import { ITEMS_IMG } from "./items_img";

export const EXP_BOOSTER: Item = {
  itemId: "exp_booster",
  name: "EXP Booster",
  description: "Temporarily boosts experience gain.",
  itemType: ItemType.boost,
  rarity: RarityType.epic,
  effects: {
    hunger: 0,
    happiness: 0,
    health: 0,
    cleanliness: 0,
    energy: 0,
    buffs: [
      {
        [ItemBuffsType.BOOST_EXPERIENCE]: 50,
        [ItemBuffsType.TEMPORARY_BUFF]: 30,
      },
    ],
  },
  cooldownMinutes: 120,
  maxPerDay: 2,
  minLevel: 5,
  iconUrl: ITEMS_IMG.boost.exp_booster,
  isStackable: true,
  maxStack: 10,
};

export const ENERGY_DRINK: Item = {
  itemId: "energy_drink",
  name: "Energy Drink",
  description: "Temporarily energy gain.",
  itemType: ItemType.boost,
  rarity: RarityType.common,
  effects: {
    hunger: 0,
    happiness: 0,
    health: 0,
    cleanliness: 0,
    energy: 10,
    buffs: [],
  },
  cooldownMinutes: 120,
  maxPerDay: 2,
  minLevel: 1,
  iconUrl: ITEMS_IMG.boost.energy_drink,
  isStackable: false,
  maxStack: 10,
};

export const ENERGY_BOOSTER: Item = {
  itemId: "energy_booster",
  name: "Energy Booster",
  description: "Temporarily energy gain.",
  itemType: ItemType.boost,
  rarity: RarityType.uncommon,
  effects: {
    hunger: 0,
    happiness: 0,
    health: 0,
    cleanliness: 0,
    energy: 20,
    buffs: [],
  },
  cooldownMinutes: 120,
  maxPerDay: 2,
  minLevel: 1,
  iconUrl: ITEMS_IMG.boost.energy_booster,
  isStackable: false,
  maxStack: 10,
};

export const BOOST_ITEMS: Item[] = [ENERGY_DRINK, EXP_BOOSTER, ENERGY_BOOSTER];
