import { Item } from "../../types/item";
import { ItemType, RarityType } from "../../enums";

export const SMALL_CHEST: Item = {
  id: 5,
  itemId: "small_chest",
  name: "Small Chest",
  description: "Contains a small random reward.",
  itemType: ItemType.chest,
  rarity: RarityType.rare,
  effects: {
    hunger: 0,
    happiness: 0,
    health: 0,
    cleanliness: 0,
    energy: 0,
    buffs: [],
  },
  cooldownMinutes: null,
  maxPerDay: null,
  minLevel: 1,
  iconUrl: null,
  isStackable: true,
  maxStack: 99,
};

export const CHEST_ITEMS: Item[] = [SMALL_CHEST];
