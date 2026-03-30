// item-pools.ts

import { ItemType, RarityType } from "../../index";

export const ITEM_POOLS: Record<
  ItemType,
  Record<Exclude<RarityType, "unique">, string[]>
> = {
  food: {
    common: ["apple", "cherry", "water"],
    uncommon: ["pizza", "burger", "sandwich"],
    rare: ["sushi", "steak", "pasta"],
    epic: ["gourmet_meal", "truffle_dish"],
    mythic: ["ambrosia", "divine_feast"],
    legendary: ["nectar_of_gods", "eternal_fruit"],
  },

  medicine: {
    common: ["bandage", "aspirin", "vitamins"],
    uncommon: ["healing_potion", "antibiotics"],
    rare: ["antidote", "vaccine", "strong_medicine"],
    epic: ["elixir", "regeneration_serum"],
    mythic: ["panacea", "miracle_cure"],
    legendary: ["resurrection_stone", "immortality_pill"],
  },

  cleaning: {
    common: ["soap", "water_bottle", "towel"],
    uncommon: ["shampoo", "bath_set", "detergent"],
    rare: ["luxury_bath", "spa_treatment", "premium_soap"],
    epic: ["auto_cleaner", "magic_sponge"],
    mythic: ["purification_ritual", "divine_cleanse"],
    legendary: ["eternal_cleanliness", "pristine_aura"],
  },

  toy: {
    common: ["ball", "stick", "rope"],
    uncommon: ["stuffed_toy", "puzzle", "chew_toy"],
    rare: ["interactive_toy", "premium_game", "smart_ball"],
    epic: ["smart_toy", "ai_companion"],
    mythic: ["legendary_artifact", "cosmic_toy"],
    legendary: ["cosmic_plaything", "divine_entertainment"],
  },

  boost: {
    common: ["energy_drink"],
    uncommon: ["super_energy", "stamina_boost"],
    rare: ["mega_boost", "power_up"],
    epic: ["ultra_boost", "extreme_energy"],
    mythic: ["cosmic_energy", "stellar_power"],
    legendary: ["divine_power", "infinite_energy"],
  },

  // Special items (поки не активно, але готово)
  special: {
    common: [],
    uncommon: ["rename_token"],
    rare: ["xp_boost_1h"],
    epic: ["xp_boost_24h", "premium_food_pack"],
    mythic: ["resurrection_stone", "rarity_boost"],
    legendary: ["legendary_gift_box", "divine_blessing"],
  },
};
