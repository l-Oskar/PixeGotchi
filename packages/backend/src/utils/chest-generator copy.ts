// chest-generator.ts

import {
  type ChestType,
  ChestInfo,
  ChestDescription,
  ChestPreview,
  ChestRewards,
  ChestRewardItem,
  type ItemType,
  type RarityType,
} from "../../../shared/src/index";
import {
  CHEST_RARITY_WEIGHTS,
  CHEST_TYPE_TO_RARITY,
  CHEST_CONFIG,
  CHEST_REWARDS,
  GUARANTEED_ITEM_TYPES,
} from "../../../shared/src/index";
import { ITEM_POOLS } from "../../../shared/src/index";

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
    // const guaranteedItems = this.generateGuaranteedItems(chestType, config);
    const guaranteedItems = this.generateGuaranteedItems(config);
    items.push(...guaranteedItems);

    // 2. Bonus: Boost (з шансом)
    const boostChance = CHEST_REWARDS.BOOST_BONUS_CHANCE[chestType];
    if (Math.random() * 100 < boostChance!) {
      // const boostItem = this.generateBoostItem(chestType, config);
      const boostItem = this.generateBoostItem(config);
      items.push(boostItem);
    }

    // 3. Bonus: Egg (тільки Crystal+)
    let eggDropped = false;
    const eggChance =
      CHEST_REWARDS.EGG_DROP_CHANCE[
        chestType as "golden" | "crystal" | "mythic" | "legendary"
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
    // chestType: ChestType,
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
    // chestType: ChestType,
    config: (typeof CHEST_CONFIG)[ChestType],
  ): ChestRewardItem {
    return this.generateItem("boost", config);
  }

  /**
   * Генерація special item (поки не активно)
   */
  // private static generateSpecialItem(
  //   chestType: ChestType,
  //   config: (typeof CHEST_CONFIG)[ChestType],
  // ): ChestRewardItem {
  //   return this.generateItem("special", config);
  // }

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

  static getItemsWithProbabilities(chestType: ChestType): ChestPreview[] {
    const config = CHEST_CONFIG[chestType];
    const items: Array<{
      itemId: string;
      type: ItemType;
      rarity: RarityType;
      probability: number;
    }> = [];

    // Розрахувати total weight
    const totalWeight = Object.values(config.item_rarity_distribution).reduce(
      (sum, weight) => sum + weight,
      0,
    );

    // Для кожного типу items
    const allTypes: ItemType[] = [...GUARANTEED_ITEM_TYPES, "boost", "special"];

    allTypes.forEach((itemType) => {
      Object.entries(config.item_rarity_distribution).forEach(
        ([rarity, weight]) => {
          if (weight > 0) {
            const pool = ITEM_POOLS[itemType][rarity as RarityType];

            if (pool && pool.length > 0) {
              // Ймовірність цієї rarity
              const rarityProbability = (weight / totalWeight) * 100;

              // Ймовірність конкретного item в pool
              const itemProbability = rarityProbability / pool.length;

              pool.forEach((itemId) => {
                items.push({
                  itemId,
                  type: itemType,
                  rarity: rarity as RarityType,
                  probability: itemProbability,
                });
              });
            }
          }
        },
      );
    });

    // Сортувати за ймовірністю (від найбільш ймовірних)
    return items.sort((a, b) => b.probability - a.probability);
  }

  static getChestPreview(
    chestType: ChestType,
    topCount: number = 10,
  ): {
    itemId: string;
    type: ItemType;
    rarity: RarityType;
    probability: string; // formatted "15.5%"
  }[] {
    const itemsWithProb = this.getItemsWithProbabilities(chestType);

    return itemsWithProb.slice(0, topCount).map((item) => ({
      itemId: item.itemId,
      type: item.type,
      rarity: item.rarity,
      probability: `${Number(item.probability).toFixed(2)}%`,
    }));
  }
  static statistic = () => {
    // Генеруємо 10000 випадкових скринь
    const generatedChests = {
      wooden: 0,
      silver: 0,
      golden: 0,
      crystal: 0,
      mythic: 0,
      legendary: 0,
    };

    for (let i = 0; i < 10000; i++) {
      const chest = ChestGenerator.generateRandomChest();
      generatedChests[chest.chestType] += 1;
    }

    // Відкриваємо 1000 скринь кожної рідкісності
    const chestTypes: ChestType[] = [
      "wooden",
      "silver",
      "golden",
      "crystal",
      "mythic",
      "legendary",
    ];
    const openedResults: Record<
      ChestType,
      {
        totalValue: number;
        averageValue: number;
        eggDrops: number;
        eggChance: number;
        itemsByType: Record<
          ItemType,
          {
            totalQuantity: number;
            items: Record<
              string,
              {
                itemId: string;
                quantity: number;
                rarity: RarityType;
                occurrences: number;
              }
            >;
            rarityDistribution: Record<RarityType, number>;
          }
        >;
        totalItems: number;
        allItemsList: Record<
          string,
          {
            itemId: string;
            type: ItemType;
            quantity: number;
            rarity: RarityType;
            occurrences: number;
          }
        >;
        errors: string[];
      }
    > = {} as any;

    // Ініціалізація результатів
    chestTypes.forEach((type) => {
      openedResults[type] = {
        totalValue: 0,
        averageValue: 0,
        eggDrops: 0,
        eggChance: 0,
        itemsByType: {
          food: {
            totalQuantity: 0,
            items: {},
            rarityDistribution: {
              common: 0,
              uncommon: 0,
              rare: 0,
              epic: 0,
              mythic: 0,
              legendary: 0,
            },
          },
          medicine: {
            totalQuantity: 0,
            items: {},
            rarityDistribution: {
              common: 0,
              uncommon: 0,
              rare: 0,
              epic: 0,
              mythic: 0,
              legendary: 0,
            },
          },
          cleaning: {
            totalQuantity: 0,
            items: {},
            rarityDistribution: {
              common: 0,
              uncommon: 0,
              rare: 0,
              epic: 0,
              mythic: 0,
              legendary: 0,
            },
          },
          toy: {
            totalQuantity: 0,
            items: {},
            rarityDistribution: {
              common: 0,
              uncommon: 0,
              rare: 0,
              epic: 0,
              mythic: 0,
              legendary: 0,
            },
          },
          boost: {
            totalQuantity: 0,
            items: {},
            rarityDistribution: {
              common: 0,
              uncommon: 0,
              rare: 0,
              epic: 0,
              mythic: 0,
              legendary: 0,
            },
          },
          special: {
            totalQuantity: 0,
            items: {},
            rarityDistribution: {
              common: 0,
              uncommon: 0,
              rare: 0,
              epic: 0,
              mythic: 0,
              legendary: 0,
            },
          },
          chest: {
            totalQuantity: 0,
            items: {},
            rarityDistribution: {
              common: 0,
              uncommon: 0,
              rare: 0,
              epic: 0,
              mythic: 0,
              legendary: 0,
            },
          },
        },
        totalItems: 0,
        allItemsList: {},
        errors: [],
      };
    });

    // Відкриваємо по 1000 скринь кожного типу
    for (const chestType of chestTypes) {
      console.log(`\n📦 Відкриваємо ${chestType} chests...`);

      for (let i = 0; i < 1000; i++) {
        try {
          const rewards = ChestGenerator.openChest(chestType);

          // Логуємо першу скриню для перевірки
          if (i === 0) {
            console.log(
              `  Перша ${chestType} скриня:`,
              JSON.stringify(rewards, null, 2),
            );
          }

          openedResults[chestType].totalValue += rewards.totalValue;

          if (rewards.egg) {
            openedResults[chestType].eggDrops += 1;
          }

          // Перевіряємо чи є items
          if (!rewards.items || rewards.items.length === 0) {
            openedResults[chestType].errors.push(
              `Скриня #${i} не має предметів`,
            );
            if (openedResults[chestType].errors.length <= 5) {
              console.log(`  ⚠️ ${chestType} скриня #${i} не має предметів!`);
            }
            continue;
          }

          // Підрахунок itemів
          for (const item of rewards.items) {
            const itemKey = `${item.itemId}_${item.type}`;

            // Загальний список всіх предметів
            if (!openedResults[chestType].allItemsList[itemKey]) {
              openedResults[chestType].allItemsList[itemKey] = {
                itemId: item.itemId,
                type: item.type,
                quantity: 0,
                rarity: item.rarity,
                occurrences: 0,
              };
            }
            openedResults[chestType].allItemsList[itemKey].quantity +=
              item.quantity;
            openedResults[chestType].allItemsList[itemKey].occurrences += 1;

            // Деталізація по типу предметів
            const typeData = openedResults[chestType].itemsByType[item.type];
            if (typeData) {
              typeData.totalQuantity += item.quantity;

              if (!typeData.items[item.itemId]) {
                typeData.items[item.itemId] = {
                  itemId: item.itemId,
                  quantity: 0,
                  rarity: item.rarity,
                  occurrences: 0,
                };
              }

              const targetItem = typeData.items[item.itemId];
              if (targetItem) {
                targetItem.quantity += item.quantity;
                targetItem.occurrences += 1;
              }

              if (typeData.rarityDistribution[item.rarity] !== undefined) {
                typeData.rarityDistribution[item.rarity] += item.quantity;
              }
            }
          }
        } catch (error) {
          console.error(
            `  ❌ Помилка при відкритті ${chestType} скрині #${i}:`,
            error,
          );
          openedResults[chestType].errors.push(`Помилка: ${error}`);
        }
      }

      // Розрахунок середніх значень
      openedResults[chestType].averageValue =
        openedResults[chestType].totalValue / 1000;
      openedResults[chestType].eggChance =
        (openedResults[chestType].eggDrops / 1000) * 100;
      openedResults[chestType].totalItems = Object.values(
        openedResults[chestType].allItemsList,
      ).reduce((sum, item) => sum + item.quantity, 0);

      console.log(
        `  ✅ ${chestType}: отримано ${openedResults[chestType].totalItems} предметів, середня цінність: ${openedResults[chestType].averageValue}`,
      );
      if (openedResults[chestType].errors.length > 0) {
        console.log(
          `  ⚠️ ${openedResults[chestType].errors.length} помилок/попереджень`,
        );
      }
    }

    // Розрахунок відсотків для generatedChests
    const generatedPercentages: Record<ChestType, number> = {} as any;
    for (const [type, count] of Object.entries(generatedChests)) {
      generatedPercentages[type as ChestType] = (count / 10000) * 100;
    }

    // Форматуємо результати
    const formattedResults: any = {
      generatedChests: {
        counts: generatedChests,
        percentages: generatedPercentages,
        total: 10000,
      },
      openedResults: {},
      summary: {
        bestValueChest: chestTypes.reduce((best, type) =>
          openedResults[type].averageValue > openedResults[best].averageValue
            ? type
            : best,
        ),
        bestEggChanceChest: chestTypes.reduce((best, type) =>
          openedResults[type].eggChance > openedResults[best].eggChance
            ? type
            : best,
        ),
        worstValueChest: chestTypes.reduce((worst, type) =>
          openedResults[type].averageValue < openedResults[worst].averageValue
            ? type
            : worst,
        ),
        mostItemsChest: chestTypes.reduce((most, type) =>
          openedResults[type].totalItems > openedResults[most].totalItems
            ? type
            : most,
        ),
      },
    };

    // Форматуємо кожен тип скрині
    for (const chestType of chestTypes) {
      const stats = openedResults[chestType];

      const sortedItems = Object.values(stats.allItemsList).sort(
        (a, b) => b.quantity - a.quantity,
      );

      const itemsByTypeDetailed: any = {};
      for (const [type, typeData] of Object.entries(stats.itemsByType)) {
        if (typeData && typeData.totalQuantity > 0) {
          itemsByTypeDetailed[type] = {
            totalQuantity: typeData.totalQuantity,
            averagePerChest: typeData.totalQuantity / 1000,
            rarityDistribution: typeData.rarityDistribution,
            items: Object.values(typeData.items).sort(
              (a, b) => b.quantity - a.quantity,
            ),
          };
        }
      }

      formattedResults.openedResults[chestType] = {
        summary: {
          totalValue: stats.totalValue,
          averageValue: parseFloat(stats.averageValue.toFixed(2)),
          eggDrops: stats.eggDrops,
          eggChance: `${stats.eggChance.toFixed(2)}%`,
          totalItems: stats.totalItems,
          averageItemsPerChest: parseFloat(
            (stats.totalItems / 1000).toFixed(2),
          ),
          errors:
            stats.errors.length > 0 ? stats.errors.slice(0, 10) : undefined,
        },
        itemsByType: itemsByTypeDetailed,
        topItems: sortedItems.slice(0, 20).map((item) => ({
          itemId: item.itemId,
          type: item.type,
          rarity: item.rarity,
          quantity: item.quantity,
          occurrences: item.occurrences,
          chanceToDrop: `${((item.occurrences / 1000) * 100).toFixed(2)}%`,
          averagePerChest: parseFloat((item.quantity / 1000).toFixed(2)),
        })),
        allItems: sortedItems.map((item) => ({
          itemId: item.itemId,
          type: item.type,
          rarity: item.rarity,
          quantity: item.quantity,
          occurrences: item.occurrences,
          chanceToDrop: `${((item.occurrences / 1000) * 100).toFixed(2)}%`,
          averagePerChest: parseFloat((item.quantity / 1000).toFixed(2)),
        })),
      };
    }

    return formattedResults;
  };
}

ChestGenerator.statistic();
