import { TraitType, TraitEffect } from "../types/traits";
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

// ─────────────────────────────────────────────
// Скільки трейтів може мати істота за rarity
// Чим вища rarity — тим більше трейтів і доступ
// до рідкісніших пулів. Негативні трейти можливі
// на будь-якому рівні, але рідше на вищих.
// ─────────────────────────────────────────────
export const RARITY_TRAIT_COUNT: Record<RarityType, number> = {
  common: 1,
  uncommon: 2,
  rare: 2,
  epic: 3,
  mythic: 3,
  legendary: 4,
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
      sleep_requirement: 1.4, // ↑ потребує більше сну
      play_requirement: 0.5, // ↓ не любить гратись
      happiness_gain: 0.7, // ↓ важче зробити щасливим
    },
  },

  glutton: {
    trait: "glutton",
    rarity: "common",
    isNegative: true,
    description: "Always hungry, eats everything in sight",
    effects: {
      hunger_rate: 2.0, // ↑↑ дуже швидко голодніє
      happiness_gain: 1.3, // ↑ їжа дає більше щастя
      health_modifier: 0.9, // ↓ трохи слабше здоров'я
    },
  },

  messy: {
    trait: "messy",
    rarity: "common",
    isNegative: true,
    description: "Leaves chaos everywhere it goes",
    effects: {
      cleanliness_decay: 2.2, // ↑↑ дуже швидко бруднішає
      happiness_gain: 1.1, // ↑ не переймається брудом — щасливий
      health_modifier: 0.85, // ↓ бруд впливає на здоров'я
    },
  },

  shy: {
    trait: "shy",
    rarity: "common",
    isNegative: false,
    description: "Timid and easily startled, warms up slowly",
    effects: {
      happiness_gain: 0.65, // ↓↓ важко розвеселити
      play_requirement: 0.8, // ↓ не прагне до ігор
      energy_drain: 0.9, // ↓ тихо сидить, майже не витрачає енергію
    },
  },

  energetic: {
    trait: "energetic",
    rarity: "common",
    isNegative: false,
    description: "Full of life and always ready to move",
    effects: {
      energy_drain: 1.3, // ↑ активніше витрачає енергію
      hunger_rate: 1.25, // ↑ активність = більший апетит
      happiness_gain: 1.3, // ↑ легко радіє
      play_requirement: 1.3, // ↑ потребує більше ігор
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
      play_requirement: 1.8, // ↑↑ постійно потребує ігор
      happiness_gain: 1.6, // ↑↑ гра дає багато щастя
      energy_drain: 1.2, // ↑ гра витрачає енергію
    },
  },

  curious: {
    trait: "curious",
    rarity: "uncommon",
    isNegative: false,
    description: "Explores everything with wide eyes",
    effects: {
      play_requirement: 1.4, // ↑ потребує нових вражень
      happiness_gain: 1.2, // ↑ нові речі приносять щастя
      energy_drain: 1.15, // ↑ дослідження забирає енергію
      hunger_rate: 1.1, // ↑ активний мозок — більший апетит
    },
  },

  stubborn: {
    trait: "stubborn",
    rarity: "uncommon",
    isNegative: true,
    description: "Does only what it wants, when it wants",
    effects: {
      happiness_gain: 0.55, // ↓↓ важко догодити
      hunger_rate: 0.85, // ↓ їсть лише коли само хоче
      health_modifier: 1.05, // ↑ впертість = стійкість
    },
  },

  fragile: {
    trait: "fragile",
    rarity: "uncommon",
    isNegative: true,
    description: "Delicate constitution, needs extra care",
    effects: {
      health_modifier: 0.55, // ↓↓ значно менше здоров'я
      energy_drain: 1.2, // ↑ швидше втомлюється
      cleanliness_decay: 1.3, // ↑ чистота впливає на самопочуття
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
      energy_drain: 1.9, // ↑↑ дуже швидко витрачає енергію
      play_requirement: 2.0, // ↑↑ постійно хоче рухатись
      hunger_rate: 1.6, // ↑↑ величезний апетит
      happiness_gain: 1.5, // ↑↑ але дуже радісний
    },
  },

  antisocial: {
    trait: "antisocial",
    rarity: "rare",
    isNegative: true,
    description: "Prefers its own company above all else",
    effects: {
      happiness_gain: 0.5, // ↓↓ взаємодія не радує
      play_requirement: 0.4, // ↓↓ майже не потребує ігор
      energy_drain: 0.8, // ↓ спокійний, економить енергію
      health_modifier: 1.05, // ↑ самотність = стабільність
    },
  },

  hardy: {
    trait: "hardy",
    rarity: "rare",
    isNegative: false,
    description: "Iron constitution, rarely gets sick",
    effects: {
      health_modifier: 1.6, // ↑↑ дуже міцне здоров'я
      hunger_rate: 0.85, // ↓ ефективний обмін речовин
      cleanliness_decay: 0.85, // ↓ менш схильний до брудного шкоди
    },
  },

  wild: {
    trait: "wild",
    rarity: "rare",
    isNegative: false,
    description: "Untamed spirit, thrives on freedom",
    effects: {
      health_modifier: 1.3, // ↑ природна витривалість
      happiness_gain: 0.6, // ↓ важко зробити щасливим в неволі
      play_requirement: 1.6, // ↑↑ потребує активного руху
      cleanliness_decay: 1.5, // ↑ дика природа = бруд
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
      health_modifier: 1.35, // ↑↑ сміливість = міцність
      happiness_gain: 1.25, // ↑ не боїться — радіє більше
      energy_drain: 0.9, // ↓ не витрачає енергію на страх
    },
  },

  loyal: {
    trait: "loyal",
    rarity: "epic",
    isNegative: false,
    description: "Deeply devoted, bonds strengthen everything",
    effects: {
      happiness_gain: 1.7, // ↑↑ прив'язаність = щастя
      health_modifier: 1.2, // ↑ любов зміцнює здоров'я
      hunger_rate: 0.9, // ↓ задоволений — менше потреби в їжі
    },
  },

  childish: {
    trait: "childish",
    rarity: "epic",
    isNegative: false,
    description: "Forever young at heart, pure joy in everything",
    effects: {
      play_requirement: 2.1, // ↑↑ обожнює гратись
      happiness_gain: 1.6, // ↑↑ радіє всьому
      energy_drain: 1.5, // ↑↑ невичерпна дитяча енергія
      hunger_rate: 1.2, // ↑ постійно в русі = апетит
    },
  },

  pessimist: {
    trait: "pessimist",
    rarity: "epic",
    isNegative: true,
    description: "Always expects the worst, hard to cheer up",
    effects: {
      happiness_gain: 0.4, // ↓↓↓ дуже важко зробити щасливим
      energy_drain: 0.75, // ↓ апатія зберігає енергію
      sleep_requirement: 1.3, // ↑ депресивний сон
      health_modifier: 0.9, // ↓ негатив впливає на здоров'я
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
      happiness_gain: 2.0, // ↑↑↑ щастя росте вдвічі швидше
      health_modifier: 1.3, // ↑↑ позитив зміцнює здоров'я
      energy_drain: 0.85, // ↓ оптимізм зберігає енергію
      hunger_rate: 0.9, // ↓ задоволений собою — менш голодний
    },
  },

  athlete: {
    trait: "athlete",
    rarity: "mythic",
    isNegative: false,
    description: "Peak physical form, body is a temple",
    effects: {
      health_modifier: 1.5, // ↑↑↑ максимальне здоров'я
      energy_drain: 1.4, // ↑ тренування забирають енергію
      hunger_rate: 1.5, // ↑↑ спортсмен їсть багато
      happiness_gain: 1.4, // ↑↑ тренування = ендорфіни = щастя
      cleanliness_decay: 1.2, // ↑ піт і активність = бруд
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
      health_modifier: 2.0, // ↑↑↑↑ подвійне здоров'я
      happiness_gain: 1.5, // ↑↑ мудрість приносить спокій
      hunger_rate: 0.7, // ↓↓ потребує мало їжі
      energy_drain: 0.7, // ↓↓ невичерпна душа
      cleanliness_decay: 0.8, // ↓ ефірна природа — майже не бруднить
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
