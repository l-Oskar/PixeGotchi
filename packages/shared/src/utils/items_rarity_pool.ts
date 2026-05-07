import { RarityType } from "../enums";
import { Item } from "../types/item";

export const createRarityPool = (
  items: Item[],
): Record<RarityType, string[]> => {
  return items.reduce(
    (acc, item) => {
      acc[item.rarity].push(item.itemId);

      return acc;
    },
    {
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
      mythic: [],
      legendary: [],
    } as Record<RarityType, string[]>,
  );
};
