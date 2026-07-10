import {
  TRAIT_RARITY,
  RARITY_TRAIT_POOL,
  isNegativeTrait,
} from "../constants/traits_const";
import type { ElementType, PixegotchiGender, RarityType } from "../enums";
import type { GenomeInfo } from "../types/pixegotchi";
import type { TraitType } from "../types/traits";

export type GenomeGeneratorOptions = {
  now?: Date | number;
  rng?: () => number;
};

export class GenomeGenerator {
  private static GENDER_WEIGHTS: Record<PixegotchiGender, number> = {
    male: 50,
    female: 50,
  };

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
    rainbow: 1,
  };

  private static RARITY_WEIGHTS: Record<RarityType, number> = {
    common: 45, // 45%
    uncommon: 25, // 25%
    rare: 15, // 15%
    epic: 10, // 10%
    mythic: 4, // 4%
    legendary: 1, // 1%
  };

  // Ваги для трейтів всередині свого rarity-пулу
  // Негативні трейти мають трохи вищу вагу — частіше випадають як "прокляття"
  private static TRAIT_WEIGHTS: Record<TraitType, number> = {
    // Common
    lazy: 12, // негативний — частіше
    glutton: 12, // негативний — частіше
    messy: 12, // негативний — частіше
    shy: 8,
    energetic: 8,

    // Uncommon
    playful: 8,
    curious: 8,
    stubborn: 10, // негативний — частіше
    fragile: 10, // негативний — частіше

    // Rare
    hyperactive: 6,
    antisocial: 8, // негативний — частіше
    hardy: 5,
    wild: 6,

    // Epic
    brave: 4,
    loyal: 4,
    childish: 5,
    pessimist: 6, // негативний — частіше

    // Mythic
    optimist: 3,
    athlete: 3,

    // Legendary
    immortal_soul: 1,
  };

  // Кількість трейтів за рідкістю
  private static TRAIT_COUNT_BY_RARITY: Record<
    RarityType,
    { min: number; max: number }
  > = {
    common: { min: 0, max: 1 },
    uncommon: { min: 1, max: 2 },
    rare: { min: 1, max: 2 },
    epic: { min: 2, max: 3 },
    mythic: { min: 2, max: 3 },
    legendary: { min: 3, max: 4 },
  };

  // Шанс отримати негативний трейт залежно від rarity
  // Вища рідкість = менший шанс на негативний трейт
  private static NEGATIVE_TRAIT_CHANCE: Record<RarityType, number> = {
    common: 0.7, // 70% — commons часто мають негативний трейт
    uncommon: 0.55, // 55%
    rare: 0.4, // 40%
    epic: 0.3, // 30%
    mythic: 0.2, // 20%
    legendary: 0.1, // 10% — рідко, але можливо
  };

  // Конфліктуючі пари трейтів (несумісні між собою)
  private static CONFLICTS: Partial<Record<TraitType, TraitType[]>> = {
    lazy: ["energetic", "hyperactive", "athlete"],
    energetic: ["lazy"],
    hyperactive: ["lazy"],
    glutton: ["athlete"],
    messy: ["athlete"],
    shy: ["brave", "loyal"],
    fragile: ["hardy", "immortal_soul", "athlete"],
    hardy: ["fragile"],
    antisocial: ["loyal"],
    pessimist: ["optimist"],
    optimist: ["pessimist"],
    immortal_soul: ["fragile"],
    athlete: ["lazy", "glutton", "messy", "fragile"],
  };

  // Бонусні ваги трейтів залежно від елементу
  private static ELEMENT_TRAIT_AFFINITY: Partial<
    Record<ElementType, Partial<Record<TraitType, number>>>
  > = {
    fire: { energetic: 1.8, hyperactive: 1.5, brave: 1.5 },
    water: { shy: 1.5, curious: 1.4, optimist: 1.3 },
    earth: { hardy: 1.8, stubborn: 1.5, loyal: 1.4 },
    air: { wild: 1.6, curious: 1.5, antisocial: 1.3 },
    grass: { playful: 1.5, curious: 1.4, childish: 1.3 },
    electric: { hyperactive: 1.8, energetic: 1.5, athlete: 1.4 },
    ice: { antisocial: 1.5, pessimist: 1.4, fragile: 1.3 },
    metal: { hardy: 1.6, stubborn: 1.5, brave: 1.4 },
    poison: { messy: 1.6, glutton: 1.4, pessimist: 1.3 },
    psychic: { curious: 1.7, optimist: 1.5, loyal: 1.4 },
    ghost: { shy: 1.6, antisocial: 1.5, pessimist: 1.4 },
    light: { optimist: 1.8, loyal: 1.6, brave: 1.4 },
    dark: { pessimist: 1.6, antisocial: 1.5, wild: 1.4 },
    rainbow: { immortal_soul: 3.0, optimist: 2.0, athlete: 1.8 },
  };

  // ─────────────────────────────────────────────
  // Публічні методи
  // ─────────────────────────────────────────────

  static generate(options: GenomeGeneratorOptions = {}): GenomeInfo {
    const hash = this.generateHash(options);
    const gender = this.determineGender(hash);
    const rarity = this.determineRarity(hash);
    const element = this.determineElement(hash);
    const traits = this.generateTraits(hash, rarity, element);

    return { genome_hash: hash, element, rarity, gender, traits };
  }

  static generateWithTraitCount(
    traitCount: number,
    options: GenomeGeneratorOptions = {},
  ): GenomeInfo {
    const hash = this.generateHash(options);
    const gender = this.determineGender(hash);
    const element = this.determineElement(hash);
    const rarity = this.determineRarity(hash);

    const original = this.TRAIT_COUNT_BY_RARITY[rarity];
    this.TRAIT_COUNT_BY_RARITY[rarity] = { min: traitCount, max: traitCount };
    const traits = this.generateTraits(hash, rarity, element);
    this.TRAIT_COUNT_BY_RARITY[rarity] = original;

    return { genome_hash: hash, element, rarity, gender, traits };
  }

  // ─────────────────────────────────────────────
  // Генерація геному
  // ─────────────────────────────────────────────

  private static generateHash(options: GenomeGeneratorOptions = {}): string {
    const timestamp =
      typeof options.now === "number"
        ? options.now
        : (options.now ?? new Date()).getTime();
    const rng = options.rng ?? Math.random;
    const random = Array.from({ length: 12 }, () =>
      Math.floor(rng() * 36).toString(36),
    ).join("");
    const randomBytes = Array.from({ length: 16 }, () =>
      Math.floor(rng() * 256),
    );
    const hexString = randomBytes
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `${timestamp}-${random}-${hexString}`;
  }

  private static determineGender(hash: string): PixegotchiGender {
    const seed = this.hashToNumber(hash);
    return this.weightedRandom(this.GENDER_WEIGHTS, seed);
  }

  private static determineRarity(hash: string): RarityType {
    const seed = this.hashToNumber(hash.split("-")[2] || hash);
    return this.weightedRandom(this.RARITY_WEIGHTS, seed);
  }

  private static determineElement(hash: string): ElementType {
    const seed = this.hashToNumber(hash);
    return this.weightedRandom(this.ELEMENT_WEIGHTS, seed);
  }

  private static generateTraits(
    hash: string,
    rarity: RarityType,
    element: ElementType,
  ): TraitType[] {
    const config = this.TRAIT_COUNT_BY_RARITY[rarity];
    const traitCount = this.randomInRange(
      config.min,
      config.max,
      this.hashToNumber(hash.split("-")[1] || hash),
    );

    const selected: TraitType[] = [];
    let currentHash = hash;

    for (let i = 0; i < traitCount; i++) {
      currentHash = this.rehash(currentHash, i);
      const seed = this.hashToNumber(currentHash);

      // Вирішуємо чи цей трейт буде негативним
      const negativeChance = this.NEGATIVE_TRAIT_CHANCE[rarity];
      const forceNegative = seed < negativeChance && selected.length === 0;

      const weights = this.buildTraitWeights(
        rarity,
        element,
        selected,
        forceNegative,
      );

      if (Object.keys(weights).length === 0) break;

      const trait = this.weightedRandom(weights, seed);
      selected.push(trait);
    }

    return selected;
  }

  // ─────────────────────────────────────────────
  // Побудова пулу трейтів
  // ─────────────────────────────────────────────

  private static buildTraitWeights(
    rarity: RarityType,
    element: ElementType,
    selected: TraitType[],
    forceNegative: boolean,
  ): Record<TraitType, number> {
    // 1. Отримуємо доступний пул rarity
    const allowedRarities = RARITY_TRAIT_POOL[rarity as RarityType];
    const pool = (Object.keys(TRAIT_RARITY) as TraitType[]).filter((t) =>
      allowedRarities.includes(TRAIT_RARITY[t]),
    );

    // 2. Базові ваги з пулу
    const weights: Record<string, number> = {};
    for (const trait of pool) {
      weights[trait] = this.TRAIT_WEIGHTS[trait] ?? 1;
    }

    // 3. Застосовуємо афінітет елементу
    const affinity = this.ELEMENT_TRAIT_AFFINITY[element] ?? {};
    for (const [trait, multiplier] of Object.entries(affinity)) {
      if (weights[trait] !== undefined) {
        weights[trait]! *= multiplier!;
      }
    }

    // 4. Видаляємо вже обрані та конфліктуючі
    for (const s of selected) {
      delete weights[s];
      for (const conflict of this.CONFLICTS[s] ?? []) {
        delete weights[conflict];
      }
    }

    // 5. Якщо forceNegative — залишаємо лише негативні
    if (forceNegative) {
      for (const trait of Object.keys(weights) as TraitType[]) {
        if (!isNegativeTrait(trait)) {
          delete weights[trait];
        }
      }
    }

    return weights as Record<TraitType, number>;
  }

  // ─────────────────────────────────────────────
  // Статистика
  // ─────────────────────────────────────────────

  static getGenomeStats(genome: GenomeInfo): {
    rarityScore: number;
    traitScore: number;
    totalScore: number;
    hasImmortalSoul: boolean;
    negativeTraitCount: number;
  } {
    const rarityScores: Record<RarityType, number> = {
      common: 1,
      uncommon: 2,
      rare: 4,
      epic: 8,
      mythic: 16,
      legendary: 32,
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
      rainbow: 12,
    };

    // Очки за трейти: rarity рівень → очки (негативні дають менше)
    const traitRarityScore: Record<RarityType, number> = {
      common: 1,
      uncommon: 2,
      rare: 4,
      epic: 8,
      mythic: 16,
      legendary: 32,
    };

    let traitScore = 0;
    let negativeTraitCount = 0;

    for (const trait of genome.traits) {
      const traitRarity = TRAIT_RARITY[trait];
      const base = traitRarityScore[traitRarity];
      const isNeg = isNegativeTrait(trait);

      traitScore += isNeg ? base * 0.5 : base; // негативні дають менше очок
      if (isNeg) negativeTraitCount++;
    }

    const rarityScore =
      rarityScores[genome.rarity] * elementScores[genome.element];

    return {
      rarityScore,
      traitScore,
      totalScore: rarityScore + traitScore,
      hasImmortalSoul: genome.traits.includes("immortal_soul"),
      negativeTraitCount,
    };
  }

  static getGenderStats(genomes: GenomeInfo[]): {
    male: number;
    female: number;
    malePercentage: number;
    femalePercentage: number;
  } {
    const males = genomes.filter((g) => g.gender === "male").length;
    const females = genomes.filter((g) => g.gender === "female").length;
    const total = genomes.length;
    return {
      male: males,
      female: females,
      malePercentage: (males / total) * 100,
      femalePercentage: (females / total) * 100,
    };
  }

  // ─────────────────────────────────────────────
  // Утиліти rarity
  // ─────────────────────────────────────────────

  static canHaveImmortalSoul(rarity: RarityType): boolean {
    return rarity === "legendary";
  }

  static getRarityIndex(rarity: RarityType): number {
    const order: RarityType[] = [
      "common",
      "uncommon",
      "rare",
      "epic",
      "mythic",
      "legendary",
    ];
    return order.indexOf(rarity);
  }

  static compareRarity(r1: RarityType, r2: RarityType): number {
    return this.getRarityIndex(r1) - this.getRarityIndex(r2);
  }

  // ─────────────────────────────────────────────
  // Хешування
  // ─────────────────────────────────────────────

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
    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    let random = seed * total;
    for (const [key, weight] of entries) {
      random -= weight;
      if (random <= 0) return key;
    }
    return entries[0]![0];
  }

  private static randomInRange(min: number, max: number, seed: number): number {
    return Math.floor(min + seed * (max - min + 1));
  }

  // ─────────────────────────────────────────────
  // Масова статистика (dev / аналітика)
  // ─────────────────────────────────────────────

  static async getStats() {
    const pets = Array.from({ length: 10000 }, () => this.generate());

    // Rarity distribution
    const rarityStats = pets.reduce(
      (acc, p) => {
        acc[p.rarity] = (acc[p.rarity] || 0) + 1;
        return acc;
      },
      {} as Record<RarityType, number>,
    );
    const rarityDistribution = Object.entries(rarityStats)
      .map(([rarity, count]) => ({
        rarity,
        count,
        percentage: ((count / pets.length) * 100).toFixed(2) + "%",
      }))
      .sort((a, b) => b.count - a.count);

    // Element distribution
    const elementStats = pets.reduce(
      (acc, p) => {
        acc[p.element] = (acc[p.element] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const elementDistribution = Object.entries(elementStats)
      .map(([element, count]) => ({
        element,
        count,
        percentage: ((count / pets.length) * 100).toFixed(2) + "%",
      }))
      .sort((a, b) => b.count - a.count);

    // Trait distribution
    const traitStats = pets.reduce(
      (acc, p) => {
        p.traits.forEach((t) => {
          acc[t] = (acc[t] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>,
    );
    const traitDistribution = Object.entries(traitStats)
      .map(([trait, count]) => ({
        trait,
        count,
        percentage: ((count / pets.length) * 100).toFixed(2) + "%",
      }))
      .sort((a, b) => b.count - a.count);

    // Immortal soul stats
    const immortalPets = pets.filter((p) => p.traits.includes("immortal_soul"));
    const legendaryPets = pets.filter((p) => p.rarity === "legendary");
    const immortalStats = {
      totalImmortalSoul: immortalPets.length,
      totalLegendary: legendaryPets.length,
      legendaryWithImmortalSoul: immortalPets.length,
      immortalSoulRate:
        (
          (immortalPets.length / Math.max(legendaryPets.length, 1)) *
          100
        ).toFixed(1) + "%",
    };

    // Negative trait stats
    const negativeStats = pets.reduce(
      (acc, p) => {
        const negCount = p.traits.filter((t) => isNegativeTrait(t)).length;
        acc[negCount] = (acc[negCount] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    // Top-10 pets by score
    const topPets = pets
      .map((pet) => ({ pet, stats: this.getGenomeStats(pet) }))
      .sort((a, b) => b.stats.totalScore - a.stats.totalScore)
      .slice(0, 10)
      .map(({ pet, stats }) => ({
        rarity: pet.rarity,
        element: pet.element,
        gender: pet.gender,
        traits: pet.traits,
        ...stats,
      }));

    // Holy grail: legendary + rainbow + immortal_soul
    let holyGrail = null;
    let attempts = 0;
    const maxAttempts = 100_000;
    while (!holyGrail && attempts < maxAttempts) {
      const pet = this.generate();
      if (
        pet.rarity === "legendary" &&
        pet.element === "rainbow" &&
        pet.traits.includes("immortal_soul")
      ) {
        holyGrail = { pet, stats: this.getGenomeStats(pet) };
      }
      attempts++;
    }

    // Gender stats
    const genderStats = this.getGenderStats(pets);

    return {
      timestamp: new Date().toISOString(),
      totalPetsGenerated: pets.length,
      data: {
        rarityDistribution,
        elementDistribution,
        traitDistribution,
        negativeTraitDistribution: negativeStats,
        immortalStats,
        topPets,
        holyGrail: {
          found: !!holyGrail,
          attempts,
          maxAttempts,
          estimatedProbability: holyGrail
            ? ((1 / attempts) * 100).toFixed(6) + "%"
            : "< 0.001%",
          ...(holyGrail && {
            pet: holyGrail.pet,
            score: holyGrail.stats.totalScore,
          }),
        },
        genderDistribution: {
          male: genderStats.male,
          female: genderStats.female,
          malePercentage: genderStats.malePercentage.toFixed(1) + "%",
          femalePercentage: genderStats.femalePercentage.toFixed(1) + "%",
        },
      },
      metadata: {
        generationTime: Date.now(),
        version: "2.0.0",
      },
    };
  }
}
