import { Item } from "../../types/inventory";
import { ItemType, RarityType } from "../../enums";

export const SOAP: Item = {
  id: 4,
  itemId: "soap",
  name: "Soap",
  description: "Cleans your Pixegotchi and slightly improves happiness.",
  itemType: ItemType.cleaning,
  rarity: RarityType.common,
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
  iconUrl: null,
  isStackable: true,
  maxStack: 50,
};

export const CLEANING_ITEMS: Item[] = [SOAP];
