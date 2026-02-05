import { RarityType } from "generated/prisma/enums";

type TraitType =
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
  rarity: RarityType;
}

const TRAIT_EFFECTS: Record<TraitType, TraitEffect> = {
  // === АКТИВНІСТЬ ===
  lazy: {
    trait: "lazy",
    description: "Обожнює спати і уникає активностей",
    effects: {
      energy_drain: 0.5, // витрачає менше енергії
      sleep_requirement: 1.5, // спить більше
      play_requirement: 0.5, // мало потребує ігор
      happiness_gain: 0.7, // важче зробити щасливим
    },
    rarity: "common",
  },

  energetic: {
    trait: "energetic",
    description: "Завжди готовий до пригод",
    effects: {
      energy_drain: 1.3,
      play_requirement: 1.5,
      happiness_gain: 1.3,
      hunger_rate: 1.2,
    },
    rarity: "common",
  },

  hyperactive: {
    trait: "hyperactive",
    description: "Не може всидіти на місці",
    effects: {
      energy_drain: 1.8,
      play_requirement: 2.0,
      hunger_rate: 1.5,
      happiness_gain: 1.5,
      special_needs: ["constant_attention"],
    },
    rarity: "uncommon",
  },

  sleepy: {
    trait: "sleepy",
    description: "Постійно хоче спати",
    effects: {
      sleep_requirement: 2.0,
      energy_drain: 0.3,
      play_requirement: 0.3,
      happiness_gain: 0.8,
    },
    rarity: "common",
  },

  // === ХАРАКТЕР ===
  playful: {
    trait: "playful",
    description: "Обожнює гратися",
    effects: {
      play_requirement: 1.8,
      happiness_gain: 1.5,
      energy_drain: 1.2,
    },
    rarity: "common",
  },

  serious: {
    trait: "serious",
    description: "Серйозний і зосереджений",
    effects: {
      play_requirement: 0.5,
      happiness_gain: 0.8,
      health_modifier: 1.1,
    },
    rarity: "uncommon",
  },

  shy: {
    trait: "shy",
    description: "Боїться незнайомців",
    effects: {
      happiness_gain: 0.7,
      special_needs: ["quiet_environment", "slow_approach"],
    },
    rarity: "common",
  },

  brave: {
    trait: "brave",
    description: "Нічого не боїться",
    effects: {
      health_modifier: 1.2,
      happiness_gain: 1.1,
    },
    rarity: "uncommon",
  },

  curious: {
    trait: "curious",
    description: "Цікавиться всім навколо",
    effects: {
      play_requirement: 1.3,
      happiness_gain: 1.2,
      energy_drain: 1.1,
      special_needs: ["new_toys", "exploration"],
    },
    rarity: "common",
  },

  stubborn: {
    trait: "stubborn",
    description: "Робить тільки те, що хоче",
    effects: {
      happiness_gain: 0.6,
      special_needs: ["patience", "specific_food"],
    },
    rarity: "rare",
  },

  // === ЇЖА ===
  glutton: {
    trait: "glutton",
    description: "Постійно голодний",
    effects: {
      hunger_rate: 2.0,
      happiness_gain: 1.5,
      health_modifier: 0.9,
      special_needs: ["frequent_feeding"],
    },
    rarity: "common",
  },

  picky: {
    trait: "picky",
    description: "Їсть тільки вибрані страви",
    effects: {
      hunger_rate: 0.8,
      happiness_gain: 0.5,
      food_preference: ["premium_food", "specific_type"],
      special_needs: ["variety"],
    },
    rarity: "uncommon",
  },

  vegetarian: {
    trait: "vegetarian",
    description: "Їсть тільки рослинну їжу",
    effects: {
      hunger_rate: 1.1,
      food_preference: ["vegetables", "fruits", "grass"],
      health_modifier: 1.05,
    },
    rarity: "uncommon",
  },

  carnivore: {
    trait: "carnivore",
    description: "Їсть тільки м'ясо",
    effects: {
      hunger_rate: 1.2,
      food_preference: ["meat", "fish"],
      health_modifier: 1.1,
    },
    rarity: "uncommon",
  },

  foodie: {
    trait: "foodie",
    description: "Справжній гурман",
    effects: {
      hunger_rate: 1.0,
      happiness_gain: 2.0,
      food_preference: ["gourmet", "exotic"],
      special_needs: ["high_quality_food"],
    },
    rarity: "rare",
  },

  // === ЧИСТОТА ===
  cleanfreak: {
    trait: "cleanfreak",
    description: "Одержимий чистотою",
    effects: {
      cleanliness_decay: 2.0,
      happiness_gain: 0.5,
      special_needs: ["frequent_cleaning", "pristine_environment"],
    },
    rarity: "uncommon",
  },

  messy: {
    trait: "messy",
    description: "Не звертає уваги на бруд",
    effects: {
      cleanliness_decay: 0.3,
      happiness_gain: 1.2,
      health_modifier: 0.9,
    },
    rarity: "common",
  },

  perfectionist: {
    trait: "perfectionist",
    description: "Все має бути ідеально",
    effects: {
      cleanliness_decay: 1.5,
      happiness_gain: 0.4,
      special_needs: ["perfect_order", "routine"],
    },
    rarity: "rare",
  },

  // === СОЦІАЛЬНІСТЬ ===
  friendly: {
    trait: "friendly",
    description: "Любить всіх",
    effects: {
      happiness_gain: 1.3,
      play_requirement: 1.2,
    },
    rarity: "common",
  },

  antisocial: {
    trait: "antisocial",
    description: "Віддає перевагу самотності",
    effects: {
      happiness_gain: 0.6,
      play_requirement: 0.5,
      special_needs: ["alone_time"],
    },
    rarity: "uncommon",
  },

  loyal: {
    trait: "loyal",
    description: "Відданий своєму власнику",
    effects: {
      happiness_gain: 1.5,
      health_modifier: 1.1,
    },
    rarity: "rare",
  },

  independent: {
    trait: "independent",
    description: "Не потребує багато уваги",
    effects: {
      play_requirement: 0.7,
      happiness_gain: 0.9,
      health_modifier: 1.05,
    },
    rarity: "uncommon",
  },

  // === ЗДОРОВ'Я ===
  hardy: {
    trait: "hardy",
    description: "Дуже міцне здоров'я",
    effects: {
      health_modifier: 1.5,
      hunger_rate: 0.9,
    },
    rarity: "uncommon",
  },

  fragile: {
    trait: "fragile",
    description: "Легко хворіє",
    effects: {
      health_modifier: 0.6,
      special_needs: ["gentle_care", "medicine"],
    },
    rarity: "common",
  },

  immortal: {
    trait: "immortal",
    description: "Не може померти",
    effects: {
      health_modifier: 999,
      special_needs: ["legendary_care"],
    },
    rarity: "mythic",
  },

  sickly: {
    trait: "sickly",
    description: "Часто хворіє",
    effects: {
      health_modifier: 0.7,
      hunger_rate: 0.8,
      special_needs: ["regular_medicine"],
    },
    rarity: "rare",
  },

  // === ОСОБЛИВІ ===
  nocturnal: {
    trait: "nocturnal",
    description: "Активний вночі",
    effects: {
      sleep_requirement: 1.0,
      special_needs: ["night_activity"],
      happiness_gain: 1.2,
    },
    rarity: "uncommon",
  },

  diurnal: {
    trait: "diurnal",
    description: "Активний вдень",
    effects: {
      sleep_requirement: 1.0,
      energy_drain: 1.1,
      happiness_gain: 1.1,
    },
    rarity: "common",
  },

  greedy: {
    trait: "greedy",
    description: "Хоче більше всього",
    effects: {
      hunger_rate: 1.5,
      happiness_gain: 0.7,
      special_needs: ["extra_resources"],
    },
    rarity: "uncommon",
  },

  generous: {
    trait: "generous",
    description: "Готовий ділитися",
    effects: {
      happiness_gain: 1.4,
      hunger_rate: 0.9,
    },
    rarity: "rare",
  },

  wise: {
    trait: "wise",
    description: "Мудрий і досвідчений",
    effects: {
      health_modifier: 1.2,
      happiness_gain: 1.1,
      special_needs: ["meditation", "knowledge"],
    },
    rarity: "epic",
  },

  childish: {
    trait: "childish",
    description: "Поводиться як дитина",
    effects: {
      play_requirement: 2.0,
      happiness_gain: 1.5,
      energy_drain: 1.4,
    },
    rarity: "common",
  },

  royal: {
    trait: "royal",
    description: "Має королівські манери",
    effects: {
      happiness_gain: 0.6,
      food_preference: ["premium", "gourmet"],
      special_needs: ["luxury_treatment", "royal_items"],
    },
    rarity: "legendary",
  },

  wild: {
    trait: "wild",
    description: "Дикий і неприборканий",
    effects: {
      health_modifier: 1.3,
      happiness_gain: 0.5,
      play_requirement: 1.5,
      special_needs: ["freedom", "outdoor_time"],
    },
    rarity: "epic",
  },
};
