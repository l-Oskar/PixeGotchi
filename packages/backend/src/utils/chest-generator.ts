// chest-generator.ts

import {
  type ChestType,
  ChestInfo,
  ChestDescription,
  ChestRewards,
  ChestRewardItem,
  type ItemType,
  type RarityType,
} from "@shared";
import {
  CHEST_RARITY_WEIGHTS,
  CHEST_TYPE_TO_RARITY,
  CHEST_CONFIG,
  CHEST_REWARDS,
  GUARANTEED_ITEM_TYPES,
} from "@shared";
import { ITEM_POOLS } from "@shared";

export class ChestGenerator {
  /**
   * Генерація випадкового chest (для дропу з гри)
   */
  static generateRandomChest(): ChestInfo {
    const chestType = this.weightedRandom(CHEST_RARITY_WEIGHTS);
    const rarity = CHEST_TYPE_TO_RARITY[chestType]!;

    return {
      chestType,
      rarity,
    };
  }

  /**
   * Генерація конкретного chest (для квестів)
   */
  static generateSpecificChest(chestType: ChestType): ChestInfo {
    const rarity = CHEST_TYPE_TO_RARITY[chestType]!;

    return {
      chestType,
      rarity,
    };
  }

  /**
   * Відкриття chest - генерація rewards
   */
  static openChest(chestType: ChestType): ChestRewards {
    const config = CHEST_CONFIG[chestType]!;
    const items: ChestRewardItem[] = [];

    // 1. Генеруємо 2 гарантовані items (різні типи)
    const guaranteedItems = this.generateGuaranteedItems(chestType, config);
    items.push(...guaranteedItems);

    // 2. Bonus: Boost (з шансом)
    const boostChance = CHEST_REWARDS.BOOST_BONUS_CHANCE[chestType];
    if (Math.random() * 100 < boostChance!) {
      const boostItem = this.generateBoostItem(chestType, config);
      items.push(boostItem);
    }

    // 3. Bonus: Egg (тільки Crystal+)
    let eggDropped = false;
    const eggChance =
      CHEST_REWARDS.EGG_DROP_CHANCE[
        chestType as "crystal" | "mythic" | "legendary"
      ];
    if (eggChance && Math.random() * 100 < eggChance) {
      eggDropped = true;
    }

    // 4. TODO: Bonus: Special item (поки не активно)
    // const specialChance = CHEST_REWARDS.SPECIAL_ITEM_CHANCE[chestType];
    // if (specialChance && Math.random() * 100 < specialChance) {
    //   const specialItem = this.generateSpecialItem(chestType, config);
    //   items.push(specialItem);
    // }

    // 5. Розрахувати загальну вартість
    const totalValue = this.calculateTotalValue(items);

    return {
      items,
      egg: eggDropped,
      totalValue,
    };
  }

  /**
   * Генерація 2 гарантованих items (різні типи)
   */
  private static generateGuaranteedItems(
    chestType: ChestType,
    config: (typeof CHEST_CONFIG)[ChestType],
  ): ChestRewardItem[] {
    const items: ChestRewardItem[] = [];
    const usedTypes: ItemType[] = [];

    for (let i = 0; i < config.guaranteed_items; i++) {
      // Вибрати тип що ще не використовувався
      const availableTypes = GUARANTEED_ITEM_TYPES.filter(
        (type) => !usedTypes.includes(type),
      );

      if (availableTypes.length === 0) {
        // Якщо всі типи використані, можна повторювати
        break;
      }

      // Випадковий тип з доступних
      const itemType =
        availableTypes[Math.floor(Math.random() * availableTypes.length)];
      usedTypes.push(itemType!);

      // Генерувати item
      const item = this.generateItem(itemType!, config);
      items.push(item);
    }

    return items;
  }

  /**
   * Генерація boost item
   */
  private static generateBoostItem(
    chestType: ChestType,
    config: (typeof CHEST_CONFIG)[ChestType],
  ): ChestRewardItem {
    return this.generateItem("boost", config);
  }

  /**
   * Генерація special item (поки не активно)
   */
  private static generateSpecialItem(
    chestType: ChestType,
    config: (typeof CHEST_CONFIG)[ChestType],
  ): ChestRewardItem {
    return this.generateItem("special", config);
  }

  /**
   * Генерація одного item
   */
  private static generateItem(
    itemType: ItemType,
    config: (typeof CHEST_CONFIG)[ChestType],
  ): ChestRewardItem {
    // 1. Визначити rarity item на основі distribution
    const itemRarity = this.weightedRandom(config.item_rarity_distribution);

    // 2. Вибрати випадковий item з pool
    const pool = ITEM_POOLS[itemType][itemRarity];

    if (!pool || pool.length === 0) {
      // Fallback: якщо pool порожній, спуститись на рівень нижче
      const fallbackRarity = this.getFallbackRarity(itemRarity);
      const fallbackPool = ITEM_POOLS[itemType][fallbackRarity];

      if (!fallbackPool || fallbackPool.length === 0) {
        throw new Error(`No items available for ${itemType} ${itemRarity}`);
      }

      const itemId =
        fallbackPool[Math.floor(Math.random() * fallbackPool.length)]!;
      const quantity = this.determineQuantity(fallbackRarity);

      return {
        itemId,
        type: itemType,
        quantity,
        rarity: fallbackRarity,
      };
    }

    const itemId = pool[Math.floor(Math.random() * pool.length)]!;

    // 3. Визначити quantity (залежить від rarity)
    const quantity = this.determineQuantity(itemRarity);

    return {
      itemId,
      type: itemType,
      quantity,
      rarity: itemRarity,
    };
  }

  /**
   * Визначити кількість item на основі rarity
   */
  private static determineQuantity(rarity: RarityType): number {
    const quantityRanges: Record<RarityType, { min: number; max: number }> = {
      common: { min: 1, max: 1 },
      uncommon: { min: 1, max: 1 },
      rare: { min: 1, max: 1 },
      epic: { min: 1, max: 1 },
      mythic: { min: 1, max: 1 },
      legendary: { min: 1, max: 1 },
    };

    const range = quantityRanges[rarity];
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }

  /**
   * Fallback rarity якщо pool порожній
   */
  private static getFallbackRarity(rarity: RarityType): RarityType {
    const rarityOrder: RarityType[] = [
      "legendary",
      "mythic",
      "epic",
      "rare",
      "uncommon",
      "common",
    ];
    const currentIndex = rarityOrder.indexOf(rarity);

    // Повернути наступну нижчу rarity
    if (currentIndex < rarityOrder.length - 1) {
      return rarityOrder[currentIndex + 1]!;
    }

    return "common"; // fallback на common
  }

  /**
   * Розрахувати загальну вартість rewards
   */
  private static calculateTotalValue(items: ChestRewardItem[]): number {
    const itemValues: Record<RarityType, number> = {
      common: 10,
      uncommon: 25,
      rare: 50,
      epic: 100,
      mythic: 250,
      legendary: 500,
    };

    return items.reduce((sum, item) => {
      return sum + (itemValues[item.rarity] || 0) * item.quantity;
    }, 0);
  }

  /**
   * Weighted random вибір
   */
  private static weightedRandom<T extends string>(
    weights: Record<T, number>,
  ): T {
    const entries = Object.entries(weights) as [T, number][];
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);

    let random = Math.random() * total;

    for (const [key, weight] of entries) {
      random -= weight;
      if (random <= 0) {
        return key;
      }
    }

    return entries[0]![0]; // fallback
  }

  /**
   * Перевірка чи можна продати chest на marketplace
   */
  static canSellChest(chestType: ChestType): boolean {
    const SELLABLE_CHESTS: ChestType[] = ["mythic", "legendary"];
    return SELLABLE_CHESTS.includes(chestType);
  }

  /**
   * Отримати опис chest
   */
  static getChestDescription(chestType: ChestType): ChestDescription {
    const config = CHEST_CONFIG[chestType]!;
    const rarity = CHEST_TYPE_TO_RARITY[chestType];
    const boostChance = CHEST_REWARDS.BOOST_BONUS_CHANCE[chestType];
    const eggChance =
      CHEST_REWARDS.EGG_DROP_CHANCE[
        chestType as "crystal" | "mythic" | "legendary"
      ] || 0;

    return {
      chestType,
      guaranteed_items: config.guaranteed_items,
      rarity,
      boostChance,
      eggChance,
    };
    // `${chestType.toUpperCase()} Chest (${rarity})\n` +
    // `Guaranteed: ${config.guaranteed_items} items\n` +
    // `Boost chance: ${boostChance}%\n` +
    // (eggChance > 0 ? `Egg chance: ${eggChance}%\n` : "")
  }
}

const statistic = () => {
  const chests = {
    wooden: 0,
    silver: 0,
    golden: 0,
    crystal: 0,
    mythic: 0,
    legendary: 0,
  };
  for (let i = 0; i < 10000; i++) {
    const chest = ChestGenerator.generateRandomChest();
    chests[chest.chestType] += 1;
  }
  return chests;
};
