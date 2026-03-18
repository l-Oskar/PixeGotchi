export type TraitType =
  // Активність
  | "lazy" // ледачий
  | "energetic" // енергійний
  | "hyperactive" // гіперактивний
  | "sleepy" // сонний

  // Характер
  | "playful" // грайливий
  | "serious" // серйозний
  | "shy" // сором'язливий
  | "brave" // хоробрий
  | "curious" // цікавий
  | "stubborn" // впертий

  // Їжа
  | "glutton" // ненажера
  | "picky" // вибагливий
  | "vegetarian" // вегетаріанець
  | "carnivore" // м'ясоїд
  | "foodie" // гурман

  // Чистота
  | "cleanfreak" // чистюля
  | "messy" // неохайний
  | "perfectionist" // перфекціоніст

  // Соціальність
  | "friendly" // дружелюбний
  | "antisocial" // нетовариський
  | "loyal" // вірний
  | "independent" // незалежний

  // Здоров'я
  | "hardy" // витривалий
  | "fragile" // крихкий
  | "immortal" // безсмертний (рідкісний)
  | "sickly" // хворобливий

  // Особливі
  | "nocturnal" // нічний
  | "diurnal" // денний
  | "greedy" // жадібний
  | "generous" // щедрий
  | "wise" // мудрий
  | "childish" // дитячий
  | "royal" // королівський
  | "wild"; // дикий;

interface TraitEffect {
  trait: TraitType;
  description: string;
  effects: {
    hunger_rate?: number; // швидкість голоду (множник)
    energy_drain?: number; // витрата енергії
    happiness_gain?: number; // приріст щастя від дій
    cleanliness_decay?: number; // швидкість забруднення
    health_modifier?: number; // базове здоров'я
    play_requirement?: number; // потреба в іграх
    sleep_requirement?: number; // потреба в сні
    food_preference?: string[]; // улюблена їжа
    special_needs?: string[]; // особливі потреби
  };
}

export const TRAIT_EFFECTS: Record<TraitType, TraitEffect> = {
  // === ACTIVITY ===
  lazy: {
    trait: "lazy",
    description: "Loves to sleep and avoids activities",
    effects: {
      energy_drain: 0.5,
      sleep_requirement: 1.5,
      play_requirement: 0.5,
      happiness_gain: 0.7,
    },
  },

  energetic: {
    trait: "energetic",
    description: "Always ready for adventure",
    effects: {
      energy_drain: 1.3,
      play_requirement: 1.5,
      happiness_gain: 1.3,
      hunger_rate: 1.2,
    },
  },

  hyperactive: {
    trait: "hyperactive",
    description: "Can't sit still",
    effects: {
      energy_drain: 1.8,
      play_requirement: 2.0,
      hunger_rate: 1.5,
      happiness_gain: 1.5,
      special_needs: ["constant_attention"],
    },
  },

  sleepy: {
    trait: "sleepy",
    description: "Always wants to sleep",
    effects: {
      sleep_requirement: 2.0,
      energy_drain: 0.3,
      play_requirement: 0.3,
      happiness_gain: 0.8,
    },
  },

  // === CHARACTER ===
  playful: {
    trait: "playful",
    description: "Loves to play",
    effects: {
      play_requirement: 1.8,
      happiness_gain: 1.5,
      energy_drain: 1.2,
    },
  },

  serious: {
    trait: "serious",
    description: "Serious and focused",
    effects: {
      play_requirement: 0.5,
      happiness_gain: 0.8,
      health_modifier: 1.1,
    },
  },

  shy: {
    trait: "shy",
    description: "Afraid of strangers",
    effects: {
      happiness_gain: 0.7,
      special_needs: ["quiet_environment", "slow_approach"],
    },
  },

  brave: {
    trait: "brave",
    description: "Afraid of nothing",
    effects: {
      health_modifier: 1.2,
      happiness_gain: 1.1,
    },
  },

  curious: {
    trait: "curious",
    description: "Curious about everything",
    effects: {
      play_requirement: 1.3,
      happiness_gain: 1.2,
      energy_drain: 1.1,
      special_needs: ["new_toys", "exploration"],
    },
  },

  stubborn: {
    trait: "stubborn",
    description: "Does only what it wants",
    effects: {
      happiness_gain: 0.6,
      special_needs: ["patience", "specific_food"],
    },
  },

  // === FOOD ===
  glutton: {
    trait: "glutton",
    description: "Always hungry",
    effects: {
      hunger_rate: 2.0,
      happiness_gain: 1.5,
      health_modifier: 0.9,
      special_needs: ["frequent_feeding"],
    },
  },

  picky: {
    trait: "picky",
    description: "Eats only selected dishes",
    effects: {
      hunger_rate: 0.8,
      happiness_gain: 0.5,
      food_preference: ["premium_food", "specific_type"],
      special_needs: ["variety"],
    },
  },

  vegetarian: {
    trait: "vegetarian",
    description: "Eats only plant-based food",
    effects: {
      hunger_rate: 1.1,
      food_preference: ["vegetables", "fruits", "grass"],
      health_modifier: 1.05,
    },
  },

  carnivore: {
    trait: "carnivore",
    description: "Eats only meat",
    effects: {
      hunger_rate: 1.2,
      food_preference: ["meat", "fish"],
      health_modifier: 1.1,
    },
  },

  foodie: {
    trait: "foodie",
    description: "A true gourmet",
    effects: {
      hunger_rate: 1.0,
      happiness_gain: 2.0,
      food_preference: ["gourmet", "exotic"],
      special_needs: ["high_quality_food"],
    },
  },

  // === CLEANLINESS ===
  cleanfreak: {
    trait: "cleanfreak",
    description: "Obsessed with cleanliness",
    effects: {
      cleanliness_decay: 2.0,
      happiness_gain: 0.5,
      special_needs: ["frequent_cleaning", "pristine_environment"],
    },
  },

  messy: {
    trait: "messy",
    description: "Doesn't care about dirt",
    effects: {
      cleanliness_decay: 0.3,
      happiness_gain: 1.2,
      health_modifier: 0.9,
    },
  },

  perfectionist: {
    trait: "perfectionist",
    description: "Everything must be perfect",
    effects: {
      cleanliness_decay: 1.5,
      happiness_gain: 0.4,
      special_needs: ["perfect_order", "routine"],
    },
  },

  // === SOCIAL ===
  friendly: {
    trait: "friendly",
    description: "Loves everyone",
    effects: {
      happiness_gain: 1.3,
      play_requirement: 1.2,
    },
  },

  antisocial: {
    trait: "antisocial",
    description: "Prefers solitude",
    effects: {
      happiness_gain: 0.6,
      play_requirement: 0.5,
      special_needs: ["alone_time"],
    },
  },

  loyal: {
    trait: "loyal",
    description: "Devoted to its owner",
    effects: {
      happiness_gain: 1.5,
      health_modifier: 1.1,
    },
  },

  independent: {
    trait: "independent",
    description: "Doesn't need much attention",
    effects: {
      play_requirement: 0.7,
      happiness_gain: 0.9,
      health_modifier: 1.05,
    },
  },

  // === HEALTH ===
  hardy: {
    trait: "hardy",
    description: "Very strong health",
    effects: {
      health_modifier: 1.5,
      hunger_rate: 0.9,
    },
  },

  fragile: {
    trait: "fragile",
    description: "Gets sick easily",
    effects: {
      health_modifier: 0.6,
      special_needs: ["gentle_care", "medicine"],
    },
  },

  immortal: {
    trait: "immortal",
    description: "Cannot die",
    effects: {
      health_modifier: 999,
      special_needs: ["legendary_care"],
    },
  },

  sickly: {
    trait: "sickly",
    description: "Often sick",
    effects: {
      health_modifier: 0.7,
      hunger_rate: 0.8,
      special_needs: ["regular_medicine"],
    },
  },

  // === SPECIAL ===
  nocturnal: {
    trait: "nocturnal",
    description: "Active at night",
    effects: {
      sleep_requirement: 1.0,
      special_needs: ["night_activity"],
      happiness_gain: 1.2,
    },
  },

  diurnal: {
    trait: "diurnal",
    description: "Active during the day",
    effects: {
      sleep_requirement: 1.0,
      energy_drain: 1.1,
      happiness_gain: 1.1,
    },
  },

  greedy: {
    trait: "greedy",
    description: "Wants more of everything",
    effects: {
      hunger_rate: 1.5,
      happiness_gain: 0.7,
      special_needs: ["extra_resources"],
    },
  },

  generous: {
    trait: "generous",
    description: "Ready to share",
    effects: {
      happiness_gain: 1.4,
      hunger_rate: 0.9,
    },
  },

  wise: {
    trait: "wise",
    description: "Wise and experienced",
    effects: {
      health_modifier: 1.2,
      happiness_gain: 1.1,
      special_needs: ["meditation", "knowledge"],
    },
  },

  childish: {
    trait: "childish",
    description: "Behaves like a child",
    effects: {
      play_requirement: 2.0,
      happiness_gain: 1.5,
      energy_drain: 1.4,
    },
  },

  royal: {
    trait: "royal",
    description: "Has royal manners",
    effects: {
      happiness_gain: 0.6,
      food_preference: ["premium", "gourmet"],
      special_needs: ["luxury_treatment", "royal_items"],
    },
  },

  wild: {
    trait: "wild",
    description: "Wild and untamed",
    effects: {
      health_modifier: 1.3,
      happiness_gain: 0.5,
      play_requirement: 1.5,
      special_needs: ["freedom", "outdoor_time"],
    },
  },
};
