import type {
  TraitType,
  TraitEffect,
  TraitEffectKey,
} from "../types/traits";
import { RarityType } from "../enums";

export const TRAIT_RARITY: Record<TraitType, RarityType> = {
  // Common
  lazy: "common",
  glutton: "common",
  messy: "common",
  shy: "common",
  energetic: "common",

  // Uncommon
  playful: "uncommon",
  curious: "uncommon",
  stubborn: "uncommon",
  fragile: "uncommon",

  // Rare
  hyperactive: "rare",
  antisocial: "rare",
  hardy: "rare",
  wild: "rare",

  // Epic
  brave: "epic",
  loyal: "epic",
  childish: "epic",
  pessimist: "epic",

  // Mythic
  optimist: "mythic",
  athlete: "mythic",

  // Legendary
  immortal_soul: "legendary",
};

// Який пул трейтів доступний для кожної rarity
// (включає всі нижчі + свій рівень)
export const RARITY_TRAIT_POOL: Record<RarityType, RarityType[]> = {
  common: ["common"],
  uncommon: ["common", "uncommon"],
  rare: ["common", "uncommon", "rare"],
  epic: ["common", "uncommon", "rare", "epic"],
  mythic: ["common", "uncommon", "rare", "epic", "mythic"],
  legendary: ["common", "uncommon", "rare", "epic", "mythic", "legendary"],
};

// ─────────────────────────────────────────────
// TRAIT EFFECTS — 20 трейтів
// Кожен впливає на різні стати по-своєму
// ─────────────────────────────────────────────
export const TRAIT_EFFECTS: Record<TraitType, TraitEffect> = {
  // ═══════════════════════════════════════════
  // COMMON — прості, часто зустрічаються
  // ═══════════════════════════════════════════

  lazy: {
    trait: "lazy",
    rarity: "common",
    isNegative: true,
    description: "Loves to lie around and does the bare minimum",
    effects: {
      energy_drain: 0.5, // ↓ повільніше витрачає енергію
      game_energy_cost: 1.25, // ↑ важче змусити активно грати
    },
  },

  glutton: {
    trait: "glutton",
    rarity: "common",
    isNegative: true,
    description: "Always hungry, eats everything in sight",
    effects: {
      hunger_rate: 1.35, // ↑ швидше голодніє
      feed_happiness_gain: 1.15, // ↑ їжа сильніше тішить
    },
  },

  messy: {
    trait: "messy",
    rarity: "common",
    isNegative: true,
    description: "Leaves chaos everywhere it goes",
    effects: {
      cleanliness_decay: 1.5, // ↑ швидше бруднішає
    },
  },

  shy: {
    trait: "shy",
    rarity: "common",
    isNegative: false,
    description: "Timid and easily startled, warms up slowly",
    effects: {
      play_requirement: 0.7, // ↓ рідше потребує соціальної гри
      energy_drain: 0.9, // ↓ спокійніше витрачає енергію
    },
  },

  energetic: {
    trait: "energetic",
    rarity: "common",
    isNegative: false,
    description: "Full of life and always ready to move",
    effects: {
      energy_drain: 1.2, // ↑ активніше витрачає енергію
      game_energy_cost: 0.9, // ↓ легше включається в активні ігри
    },
  },

  // ═══════════════════════════════════════════
  // UNCOMMON — трохи рідші, виразніші ефекти
  // ═══════════════════════════════════════════

  playful: {
    trait: "playful",
    rarity: "uncommon",
    isNegative: false,
    description: "Turns everything into a game",
    effects: {
      play_requirement: 1.15, // ↑ трохи частіше потребує гри
      play_happiness_gain: 1.35, // ↑ гра перекриває додаткову потребу
    },
  },

  curious: {
    trait: "curious",
    rarity: "uncommon",
    isNegative: false,
    description: "Explores everything with wide eyes",
    effects: {
      happiness_gain: 1.15, // ↑ нові взаємодії приносять щастя
      game_chest_chance: 1.25, // ↑ частіше знаходить скрині в іграх
    },
  },

  stubborn: {
    trait: "stubborn",
    rarity: "uncommon",
    isNegative: true,
    description: "Does only what it wants, when it wants",
    effects: {
      happiness_gain: 0.8, // ↓ важче догодити
      health_resilience: 1.1, // ↑ характер додає стійкості
    },
  },

  fragile: {
    trait: "fragile",
    rarity: "uncommon",
    isNegative: true,
    description: "Delicate constitution, needs extra care",
    effects: {
      health_resilience: 0.75, // ↓ швидше втрачає здоров'я
      game_energy_cost: 1.15, // ↑ активні ігри даються важче
    },
  },

  // ═══════════════════════════════════════════
  // RARE — рідкісні, сильніший вплив
  // ═══════════════════════════════════════════

  hyperactive: {
    trait: "hyperactive",
    rarity: "rare",
    isNegative: false,
    description: "Boundless energy that never stops",
    effects: {
      energy_drain: 1.35, // ↑ швидше витрачає енергію
      play_happiness_gain: 1.35, // ↑↑ активна гра сильніше тішить
    },
  },

  antisocial: {
    trait: "antisocial",
    rarity: "rare",
    isNegative: true,
    description: "Prefers its own company above all else",
    effects: {
      play_requirement: 0.55, // ↓↓ майже не потребує компанії
      energy_drain: 0.85, // ↓ спокійно економить енергію
    },
  },

  hardy: {
    trait: "hardy",
    rarity: "rare",
    isNegative: false,
    description: "Iron constitution, rarely gets sick",
    effects: {
      health_resilience: 1.3, // ↑↑ повільніше втрачає здоров'я
    },
  },

  wild: {
    trait: "wild",
    rarity: "rare",
    isNegative: true,
    description: "Untamed spirit, thrives on freedom",
    effects: {
      play_requirement: 1.35, // ↑ потребує активного руху
      cleanliness_decay: 1.25, // ↑ активність приносить більше бруду
    },
  },

  // ═══════════════════════════════════════════
  // EPIC — яскраві ефекти, сильний характер
  // ═══════════════════════════════════════════

  brave: {
    trait: "brave",
    rarity: "epic",
    isNegative: false,
    description: "Fearless and resilient in any situation",
    effects: {
      health_resilience: 1.2, // ↑ сміливість додає стійкості
      game_energy_cost: 0.9, // ↓ сміливіше бере участь в іграх
    },
  },

  loyal: {
    trait: "loyal",
    rarity: "epic",
    isNegative: false,
    description: "Deeply devoted, bonds strengthen everything",
    effects: {
      happiness_gain: 1.35, // ↑↑ взаємодія з власником дає більше щастя
      game_exp_gain: 1.15, // ↑ швидше навчається у спільних іграх
    },
  },

  childish: {
    trait: "childish",
    rarity: "epic",
    isNegative: false,
    description: "Forever young at heart, pure joy in everything",
    effects: {
      play_requirement: 1.25, // ↑ частіше потребує гри
      play_happiness_gain: 1.5, // ↑↑ гра перекриває додаткову потребу
    },
  },

  pessimist: {
    trait: "pessimist",
    rarity: "epic",
    isNegative: true,
    description: "Always expects the worst, hard to cheer up",
    effects: {
      happiness_gain: 0.65, // ↓↓ важко зробити щасливим
      energy_drain: 0.85, // ↓ апатія зберігає енергію
    },
  },

  // ═══════════════════════════════════════════
  // MYTHIC — дуже рідкісні, потужні
  // ═══════════════════════════════════════════

  optimist: {
    trait: "optimist",
    rarity: "mythic",
    isNegative: false,
    description: "Radiates joy, everything is wonderful",
    effects: {
      happiness_gain: 1.5, // ↑↑ швидше отримує щастя
      game_pgc_gain: 1.15, // ↑ отримує більше PGC за ігри
    },
  },

  athlete: {
    trait: "athlete",
    rarity: "mythic",
    isNegative: false,
    description: "Peak physical form, body is a temple",
    effects: {
      health_resilience: 1.35, // ↑↑ висока фізична стійкість
      game_energy_cost: 0.75, // ↓ значно ефективніше витрачає енергію в іграх
    },
  },

  // ═══════════════════════════════════════════
  // LEGENDARY — унікальний трейт
  // ═══════════════════════════════════════════

  immortal_soul: {
    trait: "immortal_soul",
    rarity: "legendary",
    isNegative: false,
    description:
      "Ancient soul that transcends mortality — health never drops below 1",
    effects: {
      health_resilience: 1.5, // ↑↑ виняткова стійкість до занепаду
    },
    special: {
      minimumHealth: 1,
    },
  },
};

// ─────────────────────────────────────────────
// Утиліти
// ─────────────────────────────────────────────

/** Отримати всі трейти певної rarity */
export function getTraitsByRarity(rarity: RarityType): TraitType[] {
  return (Object.keys(TRAIT_RARITY) as TraitType[]).filter(
    (t) => TRAIT_RARITY[t] === rarity,
  );
}

/** Отримати доступний пул трейтів для rarity істоти */
export function getTraitPool(rarity: RarityType): TraitType[] {
  const allowedRarities = RARITY_TRAIT_POOL[rarity];
  return (Object.keys(TRAIT_RARITY) as TraitType[]).filter((t) =>
    allowedRarities.includes(TRAIT_RARITY[t]),
  );
}

/** Перевірити чи трейт є негативним */
export function isNegativeTrait(trait: TraitType): boolean {
  return TRAIT_EFFECTS[trait].isNegative;
}

const DEFAULT_TRAIT_MODIFIER_LIMITS = { min: 0.5, max: 1.75 } as const;
const HEALTH_TRAIT_MODIFIER_LIMITS = { min: 0.75, max: 1.5 } as const;

/** Перемножити ефекти унікальних трейтів і обмежити крайні комбінації. */
export function getTraitModifier(
  traits: readonly string[],
  effect: TraitEffectKey,
): number {
  const modifier = [...new Set(traits)].reduce(
    (result, trait) =>
      result * (TRAIT_EFFECTS[trait as TraitType]?.effects[effect] ?? 1),
    1,
  );
  const limits =
    effect === "health_resilience"
      ? HEALTH_TRAIT_MODIFIER_LIMITS
      : DEFAULT_TRAIT_MODIFIER_LIMITS;

  return Math.min(limits.max, Math.max(limits.min, modifier));
}

export type HappinessGainSource = "feed" | "play" | "general";

/** Об'єднати глобальний бонус щастя з бонусом конкретної дії. */
export function getHappinessGainModifier(
  traits: readonly string[],
  source: HappinessGainSource,
): number {
  const globalModifier = getTraitModifier(traits, "happiness_gain");
  const sourceModifier =
    source === "feed"
      ? getTraitModifier(traits, "feed_happiness_gain")
      : source === "play"
        ? getTraitModifier(traits, "play_happiness_gain")
        : 1;

  return Math.min(
    DEFAULT_TRAIT_MODIFIER_LIMITS.max,
    Math.max(
      DEFAULT_TRAIT_MODIFIER_LIMITS.min,
      globalModifier * sourceModifier,
    ),
  );
}

/** Найвище мінімальне здоров'я, гарантоване спеціальними трейтами. */
export function getTraitMinimumHealth(traits: readonly string[]): number {
  return [...new Set(traits)].reduce(
    (minimum, trait) =>
      Math.max(
        minimum,
        TRAIT_EFFECTS[trait as TraitType]?.special?.minimumHealth ?? 0,
      ),
    0,
  );
}
