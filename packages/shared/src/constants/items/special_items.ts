import { Item } from "../../types/item";
import { ItemType, RarityType } from "../../enums";
import { ItemBuffsType } from "../../types/item_buffs";
import { ITEMS_IMG } from "./items_img";

export const RENAME_TAG: Item = {
  itemId: "rename_tag",
  name: "Rename Tag",
  description: "Allows you to rename your Pixegotchi.",
  itemType: ItemType.special,
  rarity: RarityType.rare,
  effects: {
    hunger: 0,
    happiness: 10,
    health: 0,
    cleanliness: 0,
    energy: 0,
    buffs: [],
  },
  cooldownMinutes: null,
  maxPerDay: 1,
  minLevel: 1,
  iconUrl: ITEMS_IMG.special.rename_tag,
  isStackable: false,
  maxStack: null,
};

export const REVIVE_STONE: Item = {
  itemId: "revive_stone",
  name: "Revive Stone",
  description: "Revives a dead Pixegotchi.",
  itemType: ItemType.special,
  rarity: RarityType.legendary,
  effects: {
    hunger: 0,
    happiness: 0,
    health: 0,
    cleanliness: 0,
    energy: 0,
    buffs: [
      {
        [ItemBuffsType.REVIVE]: 1,
        [ItemBuffsType.PERMANENT_BUFF]: 0,
      },
    ],
  },
  cooldownMinutes: null,
  maxPerDay: 1,
  minLevel: 1,
  iconUrl: ITEMS_IMG.special.revive_stone,
  isStackable: false,
  maxStack: null,
};

export const LUCKY_CHARM: Item = {
  itemId: "lucky_charm",
  name: "Lucky Charm",
  description: "Slightly increases all stats and gold gain for a while.",
  itemType: ItemType.special,
  rarity: RarityType.mythic,
  effects: {
    hunger: 5,
    happiness: 10,
    health: 5,
    cleanliness: 5,
    energy: 5,
    buffs: [
      {
        [ItemBuffsType.BOOST_ALL_STATS]: 10, // +10% to all stats gained
        [ItemBuffsType.TEMPORARY_BUFF]: 60,
      },
    ],
  },
  cooldownMinutes: 180,
  maxPerDay: 1,
  minLevel: 1,
  iconUrl: ITEMS_IMG.special.lucky_charm,
  isStackable: false,
  maxStack: null,
};

export const RARE_CANDY: Item = {
  itemId: "rare_candy",
  name: "Rare Candy",
  description: "Gives 1000 EXP (1 LVL)",
  itemType: ItemType.special,
  rarity: RarityType.legendary,
  effects: {
    hunger: 0,
    happiness: 0,
    health: 0,
    cleanliness: 0,
    energy: 0,
    buffs: [],
  },
  cooldownMinutes: null,
  maxPerDay: 100,
  minLevel: 1,
  iconUrl: ITEMS_IMG.special.rare_candy,
  isStackable: true,
  maxStack: null,
};

export const SPECIAL_ITEMS: Item[] = [
  RENAME_TAG,
  REVIVE_STONE,
  LUCKY_CHARM,
  RARE_CANDY,
];
