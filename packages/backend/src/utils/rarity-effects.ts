import { RarityType } from "@shared";

export interface RarityEffects {
  max_status: number; // Максимальне значення статусів (HP, Energy, etc.)
  degradation: number; // Модифікатор деградації (-10 = на 10% повільніше)
  trait_count: {
    min: number;
    max: number;
  };
  gold_earn_multiplier: number; // Множник заробітку золота
  passive_income: number; // Пасивний дохід (монет на годину)
  special_abilities?: string[]; // Спеціальні здібності
}

export const RARITY_EFFECTS: Record<RarityType, RarityEffects> = {
  common: {
    max_status: 100,
    degradation: 0,
    trait_count: {
      min: 0,
      max: 1,
    },
    gold_earn_multiplier: 1.0,
    passive_income: 0,
  },

  uncommon: {
    max_status: 110,
    degradation: -10,
    trait_count: {
      min: 1,
      max: 1,
    },
    gold_earn_multiplier: 1.0,
    passive_income: 0,
  },

  rare: {
    max_status: 115,
    degradation: -15,
    trait_count: {
      min: 1,
      max: 2,
    },
    gold_earn_multiplier: 1.0,
    passive_income: 0,
  },

  epic: {
    max_status: 120,
    degradation: -20,
    trait_count: {
      min: 2,
      max: 2,
    },
    gold_earn_multiplier: 1.0,
    passive_income: 0,
  },

  mythic: {
    max_status: 130,
    degradation: -25,
    trait_count: {
      min: 2,
      max: 3,
    },
    gold_earn_multiplier: 1.5,
    passive_income: 0,
    special_abilities: ["enhanced_luck"],
  },

  legendary: {
    max_status: 150,
    degradation: -50,
    trait_count: {
      min: 4,
      max: 4, // 3 звичайні + 1 immortal
    },
    gold_earn_multiplier: 2.0,
    passive_income: 10, // 10 PGC/год
    special_abilities: ["legendary_aura", "auto_heal"],
  },
};

// Утилітарні функції для роботи з rarity effects

export class RarityEffectsHelper {
  /**
   * Отримати ефекти рідкості
   */
  static getEffects(rarity: RarityType): RarityEffects {
    return RARITY_EFFECTS[rarity];
  }

  /**
   * Розрахувати максимальне значення статусу з урахуванням рідкості
   */
  static calculateMaxStatus(baseStatus: number, rarity: RarityType): number {
    const effects = this.getEffects(rarity);
    return Math.floor((baseStatus * effects.max_status) / 100);
  }

  /**
   * Розрахувати швидкість деградації статусу
   * @param baseRate - базова швидкість деградації (наприклад, -1 HP/год)
   * @param rarity - рідкість пета
   * @returns модифікована швидкість деградації
   */
  static calculateDegradationRate(
    baseRate: number,
    rarity: RarityType,
  ): number {
    const effects = this.getEffects(rarity);
    // degradation -10 означає на 10% повільніше
    const modifier = 1 + effects.degradation / 100;
    return baseRate * modifier;
  }

  /**
   * Розрахувати заробіток золота з ігри
   */
  static calculateGoldEarned(baseGold: number, rarity: RarityType): number {
    const effects = this.getEffects(rarity);
    return Math.floor(baseGold * effects.gold_earn_multiplier);
  }

  /**
   * Отримати пасивний дохід за годину
   */
  static getPassiveIncome(rarity: RarityType): number {
    return this.getEffects(rarity).passive_income;
  }

  /**
   * Розрахувати пасивний дохід за певний період
   * @param rarity - рідкість пета
   * @param hours - кількість годин
   */
  static calculatePassiveIncomeForPeriod(
    rarity: RarityType,
    hours: number,
  ): number {
    const hourlyIncome = this.getPassiveIncome(rarity);
    return Math.floor(hourlyIncome * hours);
  }

  /**
   * Перевірити чи має рідкість спеціальні здібності
   */
  static hasSpecialAbilities(rarity: RarityType): boolean {
    const effects = this.getEffects(rarity);
    return (
      effects.special_abilities !== undefined &&
      effects.special_abilities.length > 0
    );
  }

  /**
   * Отримати список спеціальних здібностей
   */
  static getSpecialAbilities(rarity: RarityType): string[] {
    const effects = this.getEffects(rarity);
    return effects.special_abilities || [];
  }

  /**
   * Порівняти дві рідкості за потужністю
   * @returns позитивне число якщо rarity1 краща, негативне якщо rarity2 краща
   */
  static compareRarityPower(rarity1: RarityType, rarity2: RarityType): number {
    const effects1 = this.getEffects(rarity1);
    const effects2 = this.getEffects(rarity2);

    // Простий скор на основі різних параметрів
    const score1 =
      effects1.max_status +
      Math.abs(effects1.degradation) +
      effects1.gold_earn_multiplier * 10 +
      effects1.passive_income;

    const score2 =
      effects2.max_status +
      Math.abs(effects2.degradation) +
      effects2.gold_earn_multiplier * 10 +
      effects2.passive_income;

    return score1 - score2;
  }

  /**
   * Отримати повний опис ефектів рідкості
   */
  static getEffectsDescription(rarity: RarityType): string {
    const effects = this.getEffects(rarity);
    const lines: string[] = [];

    lines.push(`Rarity: ${rarity.toUpperCase()}`);
    lines.push(`Max Status: ${effects.max_status}%`);
    lines.push(`Degradation: ${effects.degradation}%`);
    lines.push(`Traits: ${effects.trait_count.min}-${effects.trait_count.max}`);

    if (effects.gold_earn_multiplier > 1.0) {
      lines.push(`Gold Multiplier: x${effects.gold_earn_multiplier}`);
    }

    if (effects.passive_income > 0) {
      lines.push(`Passive Income: ${effects.passive_income} PGC/hour`);
    }

    if (effects.special_abilities && effects.special_abilities.length > 0) {
      lines.push(`Special Abilities: ${effects.special_abilities.join(", ")}`);
    }

    return lines.join("\n");
  }
}

// ============= ПРИКЛАДИ ВИКОРИСТАННЯ =============

// 1. Отримати ефекти рідкості
const legendaryEffects = RarityEffectsHelper.getEffects("legendary");
console.log(legendaryEffects);
/*
{
  max_status: 150,
  degradation: -50,
  trait_count: { min: 3, max: 4 },
  gold_earn_multiplier: 2.0,
  passive_income: 10,
  special_abilities: ['legendary_aura', 'auto_heal']
}
*/

// 2. Розрахунок максимального статусу
const commonMaxHP = RarityEffectsHelper.calculateMaxStatus(100, "common");
const legendaryMaxHP = RarityEffectsHelper.calculateMaxStatus(100, "legendary");
console.log(`Common max HP: ${commonMaxHP}`); // 100
console.log(`Legendary max HP: ${legendaryMaxHP}`); // 150

// 3. Розрахунок деградації
const baseHungerRate = -1; // -1 HP за годину
const commonHungerRate = RarityEffectsHelper.calculateDegradationRate(
  baseHungerRate,
  "common",
);
const legendaryHungerRate = RarityEffectsHelper.calculateDegradationRate(
  baseHungerRate,
  "legendary",
);
console.log(`Common hunger rate: ${commonHungerRate}/hour`); // -1
console.log(`Legendary hunger rate: ${legendaryHungerRate}/hour`); // -0.5

// 4. Розрахунок заробітку
const baseGameReward = 100; // монет
const commonReward = RarityEffectsHelper.calculateGoldEarned(
  baseGameReward,
  "common",
);
const legendaryReward = RarityEffectsHelper.calculateGoldEarned(
  baseGameReward,
  "legendary",
);
console.log(`Common reward: ${commonReward} gold`); // 100
console.log(`Legendary reward: ${legendaryReward} gold`); // 200

// 5. Пасивний дохід
const passiveIncomePerHour = RarityEffectsHelper.getPassiveIncome("legendary");
const passiveIncomePerDay = RarityEffectsHelper.calculatePassiveIncomeForPeriod(
  "legendary",
  24,
);
console.log(`Legendary passive income: ${passiveIncomePerHour} PGC/hour`); // 10
console.log(`Legendary passive income per day: ${passiveIncomePerDay} PGC`); // 240

// 6. Спеціальні здібності
const hasAbilities = RarityEffectsHelper.hasSpecialAbilities("legendary");
const abilities = RarityEffectsHelper.getSpecialAbilities("legendary");
console.log(`Has special abilities: ${hasAbilities}`); // true
console.log(`Abilities: ${abilities.join(", ")}`); // legendary_aura, auto_heal

// 7. Порівняння рідкостей
const comparison = RarityEffectsHelper.compareRarityPower(
  "legendary",
  "common",
);
console.log(
  `Legendary vs Common: ${comparison > 0 ? "Legendary stronger" : "Common stronger"}`,
);

// 8. Опис ефектів
console.log("\n=== LEGENDARY EFFECTS ===");
console.log(RarityEffectsHelper.getEffectsDescription("legendary"));
/*
Rarity: LEGENDARY
Max Status: 150%
Degradation: -50%
Traits: 3-4
Gold Multiplier: x2
Passive Income: 10 PGC/hour
Special Abilities: legendary_aura, auto_heal
*/

// 9. Практичний приклад: створення пета з урахуванням rarity
interface PetStatus {
  maxHP: number;
  maxEnergy: number;
  maxHappiness: number;
  hungerRate: number;
  energyRate: number;
}

function createPetStatus(rarity: RarityType): PetStatus {
  const baseHP = 100;
  const baseEnergy = 100;
  const baseHappiness = 100;
  const baseHungerRate = -1; // -1 за годину
  const baseEnergyRate = -2; // -2 за годину

  return {
    maxHP: RarityEffectsHelper.calculateMaxStatus(baseHP, rarity),
    maxEnergy: RarityEffectsHelper.calculateMaxStatus(baseEnergy, rarity),
    maxHappiness: RarityEffectsHelper.calculateMaxStatus(baseHappiness, rarity),
    hungerRate: RarityEffectsHelper.calculateDegradationRate(
      baseHungerRate,
      rarity,
    ),
    energyRate: RarityEffectsHelper.calculateDegradationRate(
      baseEnergyRate,
      rarity,
    ),
  };
}

const commonPet = createPetStatus("common");
const legendaryPet = createPetStatus("legendary");

console.log("\n=== PET STATUS COMPARISON ===");
console.log("Common:", commonPet);
console.log("Legendary:", legendaryPet);
/*
Common: {
  maxHP: 100,
  maxEnergy: 100,
  maxHappiness: 100,
  hungerRate: -1,
  energyRate: -2
}
Legendary: {
  maxHP: 150,
  maxEnergy: 150,
  maxHappiness: 150,
  hungerRate: -0.5,
  energyRate: -1
}
*/
