// item-pools.ts

import { ItemType, RarityType } from "../../index";

export const ITEM_POOLS: Record<ItemType, Record<RarityType, string[]>> = {
  food: {
    common: ["apple"],
    uncommon: ["apple"],
    rare: ["apple"],
    epic: ["apple"],
    mythic: ["apple"],
    legendary: ["apple"],
  },

  medicine: {
    common: ["pill"],
    uncommon: ["pill"],
    rare: ["pill"],
    epic: ["pill"],
    mythic: ["pill"],
    legendary: ["pill"],
  },

  cleaning: {
    common: ["water"],
    uncommon: ["water"],
    rare: ["water"],
    epic: ["water"],
    mythic: ["water"],
    legendary: ["water"],
  },

  toy: {
    common: ["small_toy"],
    uncommon: ["small_toy"],
    rare: ["small_toy"],
    epic: ["small_toy"],
    mythic: ["small_toy"],
    legendary: ["small_toy"],
  },

  boost: {
    common: ["energy_drink"],
    uncommon: ["energy_drink"],
    rare: ["energy_drink"],
    epic: ["energy_drink"],
    mythic: ["energy_drink"],
    legendary: ["energy_drink"],
  },

  // Special items (поки не активно, але готово)
  special: {
    common: ["rename_tag"],
    uncommon: ["rename_tag"],
    rare: ["rename_tag"],
    epic: ["rename_tag"],
    mythic: ["rename_tag"],
    legendary: ["rename_tag"],
  },

  chest: {
    common: [],
    uncommon: [],
    rare: [],
    epic: [],
    mythic: [],
    legendary: [],
  },
};
