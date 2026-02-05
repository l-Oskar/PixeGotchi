import { ElementType, RarityType } from "../../../generated/prisma/enums";

interface GenomeInfo {
  genome_hash: string;
  element: ElementType;
  rarity: RarityType;
}

export class GenomeGenerator {
  // Ваги для елементів (деякі рідкісніші)
  private static ELEMENT_WEIGHTS: Record<ElementType, number> = {
    fire: 10,
    water: 10,
    earth: 10,
    air: 10,
    grass: 10,
    electric: 8,
    ice: 8,
    metal: 7,
    poison: 7,
    psychic: 6,
    ghost: 5,
    light: 4,
    dark: 4,
    rainbow: 1, // найрідкісніший
  };

  // Ваги для рідкості
  private static RARITY_WEIGHTS: Record<RarityType, number> = {
    common: 50, // 50%
    uncommon: 25, // 25%
    rare: 15, // 15%
    epic: 7, // 7%
    mythic: 2.5, // 2.5%
    legendary: 0.5, // 0.5%
  };

  static generate(): GenomeInfo {
    const hash = this.generateHash();

    return {
      genome_hash: hash,
      element: this.determineElement(hash),
      rarity: this.determineRarity(hash),
    };
  }

  private static generateHash(): string {
    // Генеруємо криптографічно випадковий хеш
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const randomBytes = crypto.getRandomValues(new Uint8Array(16));
    const hexString = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return `${timestamp}-${random}-${hexString}`;
  }

  private static determineElement(hash: string): ElementType {
    // Використовуємо хеш для детермінованого вибору
    const seed = this.hashToNumber(hash);
    return this.weightedRandom(this.ELEMENT_WEIGHTS, seed);
  }

  private static determineRarity(hash: string): RarityType {
    // Використовуємо іншу частину хешу для рідкості
    const seed = this.hashToNumber(hash.split("-")[2] || hash);
    return this.weightedRandom(this.RARITY_WEIGHTS, seed);
  }

  // Конвертує хеш у число для детермінованості
  private static hashToNumber(hash: string): number {
    let num = 0;
    for (let i = 0; i < hash.length; i++) {
      num = (num * 31 + hash.charCodeAt(i)) % 1000000;
    }
    return num / 1000000; // нормалізуємо до 0-1
  }

  // Вибір на основі ваг
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

    return entries[0][0]; // fallback
  }

  // Додатковий метод: генерація з модифікаторами шансів
  static generateWithBoost(
    elementBoost?: Partial<Record<ElementType, number>>,
    rarityBoost?: Partial<Record<RarityType, number>>,
  ): GenomeInfo {
    const originalElementWeights = { ...this.ELEMENT_WEIGHTS };
    const originalRarityWeights = { ...this.RARITY_WEIGHTS };

    // Застосовуємо буст
    if (elementBoost) {
      Object.entries(elementBoost).forEach(([element, boost]) => {
        this.ELEMENT_WEIGHTS[element as ElementType] *= boost;
      });
    }

    if (rarityBoost) {
      Object.entries(rarityBoost).forEach(([rarity, boost]) => {
        this.RARITY_WEIGHTS[rarity as RarityType] *= boost;
      });
    }

    const result = this.generate();

    // Відновлюємо оригінальні ваги
    this.ELEMENT_WEIGHTS = originalElementWeights;
    this.RARITY_WEIGHTS = originalRarityWeights;

    return result;
  }

  // Перевірка рідкості геному
  static getGenomeRarityScore(genome: GenomeInfo): number {
    const rarityScores: Record<RarityType, number> = {
      common: 1,
      uncommon: 2,
      rare: 3,
      epic: 4,
      legendary: 5,
      mythic: 6,
    };

    const elementScores: Record<ElementType, number> = {
      fire: 1,
      water: 1,
      earth: 1,
      air: 1,
      grass: 1,
      electric: 2,
      ice: 2,
      metal: 3,
      poison: 3,
      psychic: 4,
      ghost: 5,
      light: 6,
      dark: 6,
      rainbow: 10,
    };

    return rarityScores[genome.rarity] * elementScores[genome.element];
  }
}

// Приклади використання:

// Звичайна генерація
const pet1 = GenomeGenerator.generate();
console.log(pet1);
// { genome_hash: "1738778...", element: "fire", rarity: "common" }

// Генерація з бустом (наприклад, евент "Rainbow Week")
const pet2 = GenomeGenerator.generateWithBoost(
  { rainbow: 5 }, // в 5 разів більший шанс rainbow
  { legendary: 2, mythic: 3 }, // покращені шанси на рідкість
);

// Оцінка рідкості
const score = GenomeGenerator.getGenomeRarityScore(pet1);
console.log(`Rarity score: ${score}`);
