// item-pools.ts

import { ItemType, RarityType } from "../../index";
import { createRarityPool } from "../../utils/items_rarity_pool";
import { BOOST_ITEMS } from "./boost_items";
import { CLEANING_ITEMS } from "./cleaning_items";
import { FOOD_ITEMS } from "./food_items";
import { MEDICINE_ITEMS } from "./medicine_items";
import { SPECIAL_ITEMS } from "./special_items";
import { TOY_ITEMS } from "./toy_items";

export const ITEM_POOLS: Record<ItemType, Record<RarityType, string[]>> = {
  food: createRarityPool(FOOD_ITEMS),
  medicine: createRarityPool(MEDICINE_ITEMS),
  cleaning: createRarityPool(CLEANING_ITEMS),
  toy: createRarityPool(TOY_ITEMS),
  boost: createRarityPool(BOOST_ITEMS),

  // Special items (поки не активно, але готово)
  special: createRarityPool(SPECIAL_ITEMS),

  chest: {
    common: [],
    uncommon: [],
    rare: [],
    epic: [],
    mythic: [],
    legendary: [],
  },
};
