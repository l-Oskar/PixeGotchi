import { TraitType } from "./traits";
import {
  RarityType,
  ElementType,
  PixegotchiGender,
} from "generated/prisma/enums";

interface GenomeInfo {
  genome_hash: string;
  element: ElementType;
  rarity: RarityType;
  gender: PixegotchiGender;
  traits: TraitType[];
}

export class GenomeGenerator {
  private static GENDER_WEIGHTS: Record<PixegotchiGender, number> = {
    male: 50,
    female: 50,
  };
  // Ваги для елементів
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

  // Ваги для рідкості (від найпростіших до найрідкісніших)
  private static RARITY_WEIGHTS: Record<RarityType, number> = {
    common: 45, // 45%
    uncommon: 25, // 25%
    rare: 15, // 15%
    epic: 10, // 10%
    mythic: 4, // 4%
    legendary: 0.9, // 0.9%
    unique: 0, // 0%
  };

  // Базові ваги для трейтів (БЕЗ immortal - він додається окремо)
  private static BASE_TRAIT_WEIGHTS: Record<
    Exclude<TraitType, "immortal">,
    number
  > = {
    // Common traits (високі шанси)
    lazy: 10,
    energetic: 10,
    playful: 10,
    friendly: 10,
    messy: 10,
    diurnal: 10,

    // Uncommon traits
    sleepy: 7,
    serious: 7,
    shy: 7,
    curious: 7,
    glutton: 7,
    cleanfreak: 7,
    independent: 7,

    // Rare traits
    hyperactive: 5,
    brave: 5,
    picky: 5,
    vegetarian: 5,
    carnivore: 5,
    antisocial: 5,
    hardy: 5,
    nocturnal: 5,
    greedy: 5,
    childish: 5,

    // Epic traits
    stubborn: 3,
    foodie: 3,
    perfectionist: 3,
    loyal: 3,
    fragile: 3,
    sickly: 3,
    generous: 3,
    wild: 3,

    // Mythic/Legendary traits
    wise: 1,
    royal: 1,
  };

  // Кількість трейтів за рідкістю
  private static TRAIT_COUNT_BY_RARITY: Record<
    RarityType,
    { min: number; max: number }
  > = {
    common: { min: 0, max: 1 },
    uncommon: { min: 1, max: 1 },
    rare: { min: 1, max: 2 },
    epic: { min: 2, max: 2 },
    mythic: { min: 2, max: 3 },
    legendary: { min: 4, max: 4 },
    unique: { min: 5, max: 5 },
  };

  static generate(): GenomeInfo {
    const hash = this.generateHash();
    const gender = this.determineGender(hash);
    const rarity = this.determineRarity(hash);
    const element = this.determineElement(hash);
    const traits = this.generateTraits(hash, rarity, element);

    return {
      genome_hash: hash,
      element,
      rarity,
      gender,
      traits,
    };
  }

  private static generateHash(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const randomBytes = crypto.getRandomValues(new Uint8Array(16));
    const hexString = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return `${timestamp}-${random}-${hexString}`;
  }

  private static determineGender(hash: string): PixegotchiGender {
    const seed = this.hashToNumber(hash.split("-")[0] || hash);
    return this.weightedRandom(this.GENDER_WEIGHTS, seed);
  }

  private static determineElement(hash: string): ElementType {
    const seed = this.hashToNumber(hash);
    return this.weightedRandom(this.ELEMENT_WEIGHTS, seed);
  }

  private static determineRarity(hash: string): RarityType {
    const seed = this.hashToNumber(hash.split("-")[2] || hash);
    return this.weightedRandom(this.RARITY_WEIGHTS, seed);
  }

  private static generateTraits(
    hash: string,
    rarity: RarityType,
    element: ElementType,
  ): TraitType[] {
    const traitConfig = this.TRAIT_COUNT_BY_RARITY[rarity];
    const traitCount = this.randomInRange(
      traitConfig.min,
      traitConfig.max,
      this.hashToNumber(hash.split("-")[1] || hash),
    );

    const selectedTraits: TraitType[] = [];

    // Створюємо копію хешу для кожного трейту
    let currentHash = hash;

    for (let i = 0; i < traitCount; i++) {
      // Генеруємо новий seed для кожного трейту
      currentHash = this.rehash(currentHash, i);
      const seed = this.hashToNumber(currentHash);

      // Отримуємо доступні ваги для поточної рідкості
      const availableWeights = this.getAvailableTraitWeights(
        rarity,
        selectedTraits,
        element,
      );

      if (Object.keys(availableWeights).length === 0) break;

      const trait = this.weightedRandom(availableWeights, seed);
      selectedTraits.push(trait);
    }

    return selectedTraits;
  }

  // Отримує доступні трейти з урахуванням рідкості
  private static getAvailableTraitWeights(
    rarity: RarityType,
    selectedTraits: TraitType[],
    element: ElementType,
  ): Record<TraitType, number> {
    // Починаємо з базових трейтів
    let weights: Record<string, number> = { ...this.BASE_TRAIT_WEIGHTS };

    // Додаємо immortal ТІЛЬКИ для legendary
    if (rarity === "legendary") {
      weights.immortal = 100;
    }

    // Фільтруємо конфліктуючі трейти
    const filtered = this.filterConflictingTraits(
      selectedTraits,
      element,
      weights as Record<TraitType, number>,
    );

    return filtered;
  }

  // Фільтрує трейти що конфліктують
  private static filterConflictingTraits(
    selectedTraits: TraitType[],
    element: ElementType,
    availableWeights: Record<TraitType, number>,
  ): Record<TraitType, number> {
    const filtered = { ...availableWeights };

    // Видаляємо вже обрані
    selectedTraits.forEach((trait) => {
      delete filtered[trait];
    });

    // Конфліктуючі пари
    const conflicts: Partial<Record<TraitType, TraitType[]>> = {
      lazy: ["energetic", "hyperactive"],
      energetic: ["lazy", "sleepy"],
      hyperactive: ["lazy", "sleepy"],
      sleepy: ["energetic", "hyperactive"],

      glutton: ["picky"],
      picky: ["glutton"],

      cleanfreak: ["messy"],
      messy: ["cleanfreak", "perfectionist"],
      perfectionist: ["messy"],

      friendly: ["antisocial"],
      antisocial: ["friendly"],

      hardy: ["fragile", "sickly", "immortal"],
      fragile: ["hardy", "immortal"],
      sickly: ["hardy", "immortal"],
      immortal: ["fragile", "sickly", "hardy"], // immortal конфліктує з health traits

      nocturnal: ["diurnal"],
      diurnal: ["nocturnal"],

      greedy: ["generous"],
      generous: ["greedy"],

      wise: ["childish"],
      childish: ["wise"],

      wild: ["royal"],
      royal: ["wild"],
    };

    // Видаляємо конфліктуючі
    selectedTraits.forEach((trait) => {
      const conflicting = conflicts[trait] || [];
      conflicting.forEach((conflictTrait) => {
        delete filtered[conflictTrait];
      });
    });

    if (element === "ice" && filtered.nocturnal) {
      // Ice петам більше підходить nocturnal
      filtered.nocturnal *= 2;
    }

    if (element === "fire" && filtered.energetic) {
      filtered.energetic *= 1.5;
    }

    return filtered;
  }

  // Генерує новий хеш на основі попереднього
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

    return entries[0][0];
  }

  private static randomInRange(min: number, max: number, seed: number): number {
    return Math.floor(min + seed * (max - min + 1));
  }

  // Додаткова функція: генерація з фіксованою кількістю трейтів
  static generateWithTraitCount(traitCount: number): GenomeInfo {
    const hash = this.generateHash();
    const gender = this.determineGender(hash);
    const element = this.determineElement(hash);
    const rarity = this.determineRarity(hash);

    // Перевизначаємо кількість трейтів
    const originalConfig = this.TRAIT_COUNT_BY_RARITY[rarity];
    this.TRAIT_COUNT_BY_RARITY[rarity] = { min: traitCount, max: traitCount };

    const traits = this.generateTraits(hash, rarity, element);

    // Відновлюємо оригінальну конфігурацію
    this.TRAIT_COUNT_BY_RARITY[rarity] = originalConfig;

    return {
      genome_hash: hash,
      element,
      rarity,
      gender,
      traits,
    };
  }

  // Статистика геному
  static getGenomeStats(genome: GenomeInfo): {
    rarityScore: number;
    traitRarityScore: number;
    totalScore: number;
    hasImmortal: boolean;
  } {
    const rarityScores: Record<RarityType, number> = {
      common: 1,
      uncommon: 2,
      rare: 3,
      epic: 4,
      mythic: 5,
      legendary: 6,
      unique: 10,
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

    // Рахуємо рідкість трейтів
    const traitScores: Record<TraitType, number> = {
      // Common = 1
      lazy: 1,
      energetic: 1,
      playful: 1,
      friendly: 1,
      messy: 1,
      diurnal: 1,
      // Uncommon = 2
      sleepy: 2,
      serious: 2,
      shy: 2,
      curious: 2,
      glutton: 2,
      cleanfreak: 2,
      independent: 2,
      // Rare = 3
      hyperactive: 3,
      brave: 3,
      picky: 3,
      vegetarian: 3,
      carnivore: 3,
      antisocial: 3,
      hardy: 3,
      nocturnal: 3,
      greedy: 3,
      childish: 3,
      // Epic = 4
      stubborn: 4,
      foodie: 4,
      perfectionist: 4,
      loyal: 4,
      fragile: 4,
      sickly: 4,
      generous: 4,
      wild: 4,
      // Mythic/Legendary = 5
      wise: 5,
      royal: 5,
      // Immortal = 20 (НАЙРІДКІСНІШИЙ - тільки legendary)
      immortal: 20,
    };

    const rarityScore =
      rarityScores[genome.rarity] * elementScores[genome.element];
    const traitRarityScore = genome.traits.reduce(
      (sum, trait) => sum + traitScores[trait],
      0,
    );
    const totalScore = rarityScore + traitRarityScore;
    const hasImmortal = genome.traits.includes("immortal");

    return {
      rarityScore,
      traitRarityScore,
      totalScore,
      hasImmortal,
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

  // Утиліта: перевірка чи може рідкість мати immortal
  static canHaveImmortal(rarity: RarityType): boolean {
    return rarity === "legendary";
  }

  // Утиліта: шанс отримати immortal для рідкості
  static getImmortalChance(rarity: RarityType): number {
    if (rarity === "legendary") return 100; // 10% для legendary
    return 0; // Інші рідкості не можуть мати immortal
  }

  // Утиліта: отримати індекс рідкості (для порівняння)
  static getRarityIndex(rarity: RarityType): number {
    const order: RarityType[] = [
      "common",
      "uncommon",
      "rare",
      "epic",
      "mythic",
      "legendary",
      "unique",
    ];
    return order.indexOf(rarity);
  }

  // Утиліта: порівняти дві рідкості
  static compareRarity(rarity1: RarityType, rarity2: RarityType): number {
    return this.getRarityIndex(rarity1) - this.getRarityIndex(rarity2);
  }
}

// STATISTIC
function getStats() {
  // ============= ПРИКЛАДИ ВИКОРИСТАННЯ =============

  // 1. Генерація 10000 петів для статистики
  const pets = Array.from({ length: 10000 }, () => GenomeGenerator.generate());

  // 2. Статистика по рідкості
  const rarityStats = pets.reduce(
    (acc, pet) => {
      acc[pet.rarity] = (acc[pet.rarity] || 0) + 1;
      return acc;
    },
    {} as Record<RarityType, number>,
  );

  console.log("=== RARITY DISTRIBUTION (10000 pets) ===");
  console.log(
    "Common:    ",
    rarityStats.common || 0,
    `(${((rarityStats.common || 0) / 100).toFixed(1)}%)`,
  );
  console.log(
    "Uncommon:  ",
    rarityStats.uncommon || 0,
    `(${((rarityStats.uncommon || 0) / 100).toFixed(1)}%)`,
  );
  console.log(
    "Rare:      ",
    rarityStats.rare || 0,
    `(${((rarityStats.rare || 0) / 100).toFixed(1)}%)`,
  );
  console.log(
    "Epic:      ",
    rarityStats.epic || 0,
    `(${((rarityStats.epic || 0) / 100).toFixed(1)}%)`,
  );
  console.log(
    "Mythic:    ",
    rarityStats.mythic || 0,
    `(${((rarityStats.mythic || 0) / 100).toFixed(1)}%)`,
  );
  console.log(
    "Legendary: ",
    rarityStats.legendary || 0,
    `(${((rarityStats.legendary || 0) / 100).toFixed(1)}%)`,
  );
  console.log(
    "Unique:    ",
    rarityStats.unique || 0,
    `(${((rarityStats.unique || 0) / 100).toFixed(1)}%)`,
  );

  // 3. Статистика по immortal
  const immortalPets = pets.filter((p) => p.traits.includes("immortal"));
  const legendaryPets = pets.filter((p) => p.rarity === "legendary");

  console.log("\n=== IMMORTAL TRAIT STATISTICS ===");
  console.log(`Total immortal pets: ${immortalPets.length}`);
  console.log(`Total legendary pets: ${legendaryPets.length}`);
  console.log(
    `Legendary with immortal: ${immortalPets.length}/${legendaryPets.length} (${((immortalPets.length / Math.max(legendaryPets.length, 1)) * 100).toFixed(1)}%)`,
  );
  console.log("Immortal pet rarities:", [
    ...new Set(immortalPets.map((p) => p.rarity)),
  ]);

  // 4. Знайти топ-10 найрідкісніших петів
  const topPets = pets
    .map((pet) => ({
      pet,
      stats: GenomeGenerator.getGenomeStats(pet),
    }))
    .sort((a, b) => b.stats.totalScore - a.stats.totalScore)
    .slice(0, 10);

  console.log("\n=== TOP 10 RAREST PETS ===");
  topPets.forEach((item, i) => {
    const { pet, stats } = item;
    console.log(`\n${i + 1}. Score: ${stats.totalScore}`);
    console.log(`   ${pet.rarity.toUpperCase()} ${pet.element}`);
    console.log(`   Traits: ${pet.traits.join(", ")}`);
    console.log(`   Immortal: ${stats.hasImmortal ? "✓" : "✗"}`);
  });

  // 5. Пошук святого грааля: Legendary Rainbow Immortal
  console.log(
    "\n=== SEARCHING FOR HOLY GRAIL (Legendary Rainbow Immortal) ===",
  );
  let holyGrail = null;
  let attempts = 0;
  const maxAttempts = 100000;

  while (!holyGrail && attempts < maxAttempts) {
    const pet = GenomeGenerator.generate();
    if (
      pet.rarity === "legendary" &&
      pet.element === "rainbow" &&
      pet.traits.includes("immortal")
    ) {
      holyGrail = pet;
    }
    attempts++;
  }

  if (holyGrail) {
    console.log(`FOUND after ${attempts} attempts!`);
    console.log(holyGrail);
    const stats = GenomeGenerator.getGenomeStats(holyGrail);
    console.log(`Total score: ${stats.totalScore}`);
  } else {
    console.log(`Not found in ${maxAttempts} attempts`);
    console.log(
      "Estimated probability: ~0.0009% (legendary 0.9% × rainbow 1% × immortal 10%)",
    );
  }

  // 6. Порівняння рідкостей
  console.log("\n=== RARITY COMPARISON ===");
  console.log(
    "Common vs Legendary:",
    GenomeGenerator.compareRarity("common", "legendary"),
  ); // -5
  console.log(
    "Legendary vs Unique:",
    GenomeGenerator.compareRarity("legendary", "unique"),
  ); // -1
  console.log("Epic vs Rare:", GenomeGenerator.compareRarity("epic", "rare")); // 1

  // 7. Практичний приклад: гравець відкриває "legendary egg"
  console.log("\n=== OPENING LEGENDARY EGG ===");
  const legendaryEgg = pets.find((p) => p.rarity === "legendary");
  if (legendaryEgg) {
    console.log("Congratulations! You got:");
    console.log(
      `${legendaryEgg.element.toUpperCase()} ${legendaryEgg.rarity.toUpperCase()}`,
    );
    console.log(`Traits: ${legendaryEgg.traits.join(", ")}`);
    const stats = GenomeGenerator.getGenomeStats(legendaryEgg);
    console.log(`Immortal: ${stats.hasImmortal ? "YES! 🎉" : "No"}`);
    console.log(`Total value: ${stats.totalScore} points`);
  }

  const genderStats = GenomeGenerator.getGenderStats(pets);

  console.log("=== GENDER DISTRIBUTION ===");
  console.log(
    `Male:   ${genderStats.male} (${genderStats.malePercentage.toFixed(1)}%)`,
  );
  console.log(
    `Female: ${genderStats.female} (${genderStats.femalePercentage.toFixed(1)}%)`,
  );

  // 4. Фільтрація по гендеру
  const femalePets = pets.filter((p) => p.gender === "female");
  const malePets = pets.filter((p) => p.gender === "male");

  console.log(`\nFemale pets: ${femalePets.length}`);
  console.log(`Male pets: ${malePets.length}`);

  // 5. Знайти рідкісну female legendary
  const rareFemale = pets.find(
    (p) => p.gender === "female" && p.rarity === "legendary",
  );
  if (rareFemale) {
    console.log("\n=== RARE FEMALE LEGENDARY ===");
    console.log(rareFemale);
  }

  // 6. Статистика: чи впливає гендер на рідкість? (спойлер: ні)
  const maleRarities = malePets.reduce(
    (acc, p) => {
      acc[p.rarity] = (acc[p.rarity] || 0) + 1;
      return acc;
    },
    {} as Record<RarityType, number>,
  );

  const femaleRarities = femalePets.reduce(
    (acc, p) => {
      acc[p.rarity] = (acc[p.rarity] || 0) + 1;
      return acc;
    },
    {} as Record<RarityType, number>,
  );

  console.log("\n=== RARITY BY GENDER ===");
  console.log("Male rarities:", maleRarities);
  console.log("Female rarities:", femaleRarities);
}
