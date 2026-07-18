import { Item } from "../types/item";
import { ItemType, RarityType } from "../enums";

import { FOOD_ITEMS } from "./items/food_items";
import { MEDICINE_ITEMS } from "./items/medicine_items";
import { TOY_ITEMS } from "./items/toy_items";
import { CLEANING_ITEMS } from "./items/cleaning_items";
import { BOOST_ITEMS } from "./items/boost_items";
import { SPECIAL_ITEMS } from "./items/special_items";

export const ITEM_EXP: Record<RarityType, number> = {
  common: 50,
  uncommon: 80,
  rare: 100,
  epic: 140,
  mythic: 180,
  legendary: 200,
};

export const RARE_CANDY_EXP: number = 1000;

export const ALL_ITEMS: Item[] = [
  ...FOOD_ITEMS,
  ...MEDICINE_ITEMS,
  ...TOY_ITEMS,
  ...CLEANING_ITEMS,
  ...BOOST_ITEMS,
  ...SPECIAL_ITEMS,
];

export const ITEMS_BY_ID: Record<string, Item> = ALL_ITEMS.reduce(
  (acc, item) => {
    acc[item.itemId] = item;
    return acc;
  },
  {} as Record<string, Item>,
);

export const ITEMS_BY_TYPE: Partial<Record<ItemType, Item[]>> =
  ALL_ITEMS.reduce(
    (acc, item) => {
      if (!acc[item.itemType]) acc[item.itemType] = [];
      acc[item.itemType]!.push(item);
      return acc;
    },
    {} as Partial<Record<ItemType, Item[]>>,
  );
