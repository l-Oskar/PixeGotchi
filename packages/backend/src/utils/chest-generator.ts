// chest-generator.ts

import { RarityType } from "@shared";

export type ChestType =
  | "wooden" // common items
  | "silver" // uncommon items
  | "golden" // rare items
  | "crystal" // epic items
  | "mythic" // mythic items
  | "legendary" // legendary items
  | "unique"; // unique items

export interface ChestInfo {
  chest_hash: string;
  chest_type: ChestType;
  rarity: RarityType;
  guaranteed_items: number; // Скільки items гарантовано
  bonus_chance: number; // Шанс додаткового item (0-100)
}

export interface ChestReward {
  items: ChestItem[];
  total_value: number; // Загальна цінність у PGC
}

export interface ChestItem {
  item_id: string;
  quantity: number;
  rarity: RarityType;
}

export class ChestGenerator {
  // Маппінг chest type → rarity
  private static CHEST_TYPE_TO_RARITY: Record<ChestType, RarityType> = {
    wooden: "common",
    silver: "uncommon",
    golden: "rare",
    crystal: "epic",
    mythic: "mythic",
    legendary: "legendary",
    unique: "unique",
  };

  // Зворотній маппінг
  private static RARITY_TO_CHEST_TYPE: Record<RarityType, ChestType> = {
    common: "wooden",
    uncommon: "silver",
    rare: "golden",
    epic: "crystal",
    mythic: "mythic",
    legendary: "legendary",
    unique: "unique",
  };

  // Конфігурація chest'ів
  private static CHEST_CONFIG: Record<
    ChestType,
    {
      guaranteed_items: number;
      bonus_chance: number;
      item_rarity_distribution: Record<RarityType, number>; // ваги для items
    }
  > = {
    wooden: {
      guaranteed_items: 1,
      bonus_chance: 10,
      item_rarity_distribution: {
        common: 80, // 80% common items
        uncommon: 20, // 20% uncommon items
        rare: 0,
        epic: 0,
        mythic: 0,
        legendary: 0,
        unique: 0,
      },
    },
    silver: {
      guaranteed_items: 2,
      bonus_chance: 20,
      item_rarity_distribution: {
        common: 50,
        uncommon: 40,
        rare: 10,
        epic: 0,
        mythic: 0,
        legendary: 0,
        unique: 0,
      },
    },
    golden: {
      guaranteed_items: 2,
      bonus_chance: 30,
      item_rarity_distribution: {
        common: 30,
        uncommon: 40,
        rare: 25,
        epic: 5,
        mythic: 0,
        legendary: 0,
        unique: 0,
      },
    },
    crystal: {
      guaranteed_items: 3,
      bonus_chance: 40,
      item_rarity_distribution: {
        common: 20,
        uncommon: 30,
        rare: 30,
        epic: 18,
        mythic: 2,
        legendary: 0,
        unique: 0,
      },
    },
    mythic: {
      guaranteed_items: 3,
      bonus_chance: 60,
      item_rarity_distribution: {
        common: 10,
        uncommon: 20,
        rare: 30,
        epic: 25,
        mythic: 14,
        legendary: 1,
        unique: 0,
      },
    },
    legendary: {
      guaranteed_items: 4,
      bonus_chance: 80,
      item_rarity_distribution: {
        common: 5,
        uncommon: 10,
        rare: 25,
        epic: 30,
        mythic: 20,
        legendary: 9,
        unique: 1,
      },
    },
    unique: {
      guaranteed_items: 5,
      bonus_chance: 100,
      item_rarity_distribution: {
        common: 0,
        uncommon: 5,
        rare: 15,
        epic: 25,
        mythic: 25,
        legendary: 20,
        unique: 10,
      },
    },
  };

  /**
   * Генерація chest info (без відкриття)
   */
  static generate(rarity?: RarityType): ChestInfo {
    const hash = this.generateHash();

    // Якщо rarity не вказана, визначаємо випадково
    const chestRarity = rarity || this.determineRarity(hash);
    const chestType = this.RARITY_TO_CHEST_TYPE[chestRarity];
    const config = this.CHEST_CONFIG[chestType];

    return {
      chest_hash: hash,
      chest_type: chestType,
      rarity: chestRarity,
      guaranteed_items: config.guaranteed_items,
      bonus_chance: config.bonus_chance,
    };
  }

  /**
   * Відкриття chest - генерація rewards
   */
  static open(chestInfo: ChestInfo, availableItems: string[]): ChestReward {
    const config = this.CHEST_CONFIG[chestInfo.chest_type];
    const items: ChestItem[] = [];

    // Генеруємо seed з chest_hash
    let currentHash = chestInfo.chest_hash;

    // 1. Гарантовані items
    for (let i = 0; i < config.guaranteed_items; i++) {
      currentHash = this.rehash(currentHash, i);
      const item = this.generateItem(
        currentHash,
        config.item_rarity_distribution,
        availableItems,
      );
      items.push(item);
    }

    // 2. Бонусний item
    currentHash = this.rehash(currentHash, 999);
    const bonusSeed = this.hashToNumber(currentHash);
    if (bonusSeed * 100 < config.bonus_chance) {
      currentHash = this.rehash(currentHash, 1000);
      const bonusItem = this.generateItem(
        currentHash,
        config.item_rarity_distribution,
        availableItems,
      );
      items.push(bonusItem);
    }

    // 3. Об'єднуємо однакові items
    const mergedItems = this.mergeItems(items);

    // 4. Розраховуємо total value (опціонально)
    const totalValue = this.calculateTotalValue(mergedItems);

    return {
      items: mergedItems,
      total_value: totalValue,
    };
  }

  /**
   * Генерація одного item
   */
  private static generateItem(
    hash: string,
    rarityDistribution: Record<RarityType, number>,
    availableItems: string[],
  ): ChestItem {
    // 1. Визначаємо rarity item
    const seed = this.hashToNumber(hash);
    const itemRarity = this.weightedRandom(rarityDistribution, seed);

    // 2. Вибираємо випадковий item з доступних
    // TODO: Фільтрувати availableItems по rarity
    const itemIndex = Math.floor(seed * availableItems.length);
    const itemId = availableItems[itemIndex] || availableItems[0];

    // 3. Визначаємо quantity (залежить від rarity)
    const quantity = this.determineQuantity(itemRarity, hash);

    return {
      item_id: itemId!,
      quantity,
      rarity: itemRarity,
    };
  }

  /**
   * Визначити кількість item
   */
  private static determineQuantity(rarity: RarityType, hash: string): number {
    const quantityRanges: Record<RarityType, { min: number; max: number }> = {
      common: { min: 1, max: 5 },
      uncommon: { min: 1, max: 3 },
      rare: { min: 1, max: 2 },
      epic: { min: 1, max: 1 },
      mythic: { min: 1, max: 1 },
      legendary: { min: 1, max: 1 },
      unique: { min: 1, max: 1 },
    };

    const range = quantityRanges[rarity];
    const seed = this.hashToNumber(hash);
    return Math.floor(range.min + seed * (range.max - range.min + 1));
  }

  /**
   * Об'єднати однакові items
   */
  private static mergeItems(items: ChestItem[]): ChestItem[] {
    const merged = new Map<string, ChestItem>();

    for (const item of items) {
      const existing = merged.get(item.item_id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        merged.set(item.item_id, { ...item });
      }
    }

    return Array.from(merged.values());
  }

  /**
   * Розрахувати загальну вартість (заглушка)
   */
  private static calculateTotalValue(items: ChestItem[]): number {
    // TODO: Отримати ціни items з БД
    const itemValues: Record<RarityType, number> = {
      common: 10,
      uncommon: 25,
      rare: 50,
      epic: 100,
      mythic: 250,
      legendary: 500,
      unique: 1000,
    };

    return items.reduce((sum, item) => {
      return sum + (itemValues[item.rarity] || 0) * item.quantity;
    }, 0);
  }

  /**
   * Визначити rarity chest (якщо не вказана)
   */
  private static determineRarity(hash: string): RarityType {
    const weights: Record<RarityType, number> = {
      common: 45,
      uncommon: 25,
      rare: 15,
      epic: 10,
      mythic: 4,
      legendary: 0.9,
      unique: 0.1,
    };

    const seed = this.hashToNumber(hash);
    return this.weightedRandom(weights, seed);
  }

  private static generateHash(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const randomBytes = crypto.getRandomValues(new Uint8Array(16));
    const hexString = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return `chest-${timestamp}-${random}-${hexString}`;
  }

  private static rehash(hash: string, iteration: number): string {
    const combined = hash + iteration.toString();
    let newHash = 0;
    for (let i = 0; i < combined.length; i++) {
      newHash = (newHash << 5) - newHash + combined.charCodeAt(i);
      newHash = newHash & newHash;
    }
    return Math.abs(newHash).toString(16);
  }

  private static hashToNumber(hash: string): number {
    let num = 0;
    for (let i = 0; i < hash.length; i++) {
      num = (num * 31 + hash.charCodeAt(i)) % 1000000;
    }
    return num / 1000000;
  }

  private static weightedRandom<T extends string>(
    weights: Record<T, number>,
    seed: number,
  ): T {
    const entries = Object.entries(weights) as [T, number][];
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);

    let random = seed * total;

    for (const [key, weight] of entries) {
      random -= weight;
      if (random <= 0) {
        return key;
      }
    }

    return entries[0]![0];
  }

  /**
   * Отримати chest type з rarity
   */
  static getChestType(rarity: RarityType): ChestType {
    return this.RARITY_TO_CHEST_TYPE[rarity];
  }

  /**
   * Отримати опис chest
   */
  static getChestDescription(chestType: ChestType): string {
    const config = this.CHEST_CONFIG[chestType];
    const rarity = this.CHEST_TYPE_TO_RARITY[chestType];

    return (
      `${chestType.toUpperCase()} Chest (${rarity})\n` +
      `Guaranteed: ${config.guaranteed_items} items\n` +
      `Bonus chance: ${config.bonus_chance}%`
    );
  }
}
