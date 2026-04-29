import { RarityStatsType } from "../types/pixegotchi";
import { RarityType } from "../enums";

export const RARITY_STATS: Record<RarityType, RarityStatsType> = {
  common: {
    maxStat: 100,
    degradationReduce: 0,
    traits: {
      min: 0,
      max: 1,
    },
    goldEarn: 1,
  },
  uncommon: {
    maxStat: 110,
    degradationReduce: 5,
    traits: {
      min: 1,
      max: 1,
    },
    goldEarn: 1,
  },
  rare: {
    maxStat: 115,
    degradationReduce: 10,
    traits: {
      min: 1,
      max: 2,
    },
    goldEarn: 1,
  },
  epic: {
    maxStat: 120,
    degradationReduce: 15,
    traits: {
      min: 2,
      max: 2,
    },
    goldEarn: 1.1,
  },
  mythic: {
    maxStat: 130,
    degradationReduce: 20,
    traits: {
      min: 2,
      max: 3,
    },
    goldEarn: 1.2,
  },
  legendary: {
    maxStat: 150,
    degradationReduce: 25,
    traits: {
      min: 4,
      max: 4,
    },
    goldEarn: 1.5,
  },
};

export const RARITY_COLORS: Record<string, string> = {
  common: "text-gray-400",
  uncommon: "text-green-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  mythic: "text-pink-400",
  legendary: "text-yellow-400",
};

export const ELEMENT_COLORS: Record<string, string> = {
  fire: "bg-red-500/15 border-red-400/50 text-red-400",
  water: "bg-blue-500/15 border-blue-400/50 text-blue-400",
  earth: "bg-amber-700/15 border-amber-700/50 text-amber-700",
  air: "bg-sky-300/15 border-sky-300/50 text-sky-300",
  electric: "bg-yellow-300/15 border-yellow-300/50 text-yellow-300",
  ice: "bg-cyan-300/15 border-cyan-300/50 text-cyan-300",
  grass: "bg-green-400/15 border-green-400/50 text-green-400",
  metal: "bg-slate-400/15 border-slate-400/50 text-slate-400",
  ghost: "bg-purple-400/15 border-purple-400/50 text-purple-400",
  poison: "bg-violet-500/15 border-violet-500/50 text-violet-500",
  psychic: "bg-pink-400/15 border-pink-400/50 text-pink-400",
  light: "bg-yellow-200/15 border-yellow-200/50 text-yellow-200",
  dark: "bg-gray-600/15 border-gray-600/50 text-gray-400",
  rainbow: "bg-fuchsia-400/15 border-fuchsia-400/50 text-fuchsia-400",
};

export const CREATE_STATS: Record<string, number> = {
  health: 100,
  hunger: 70,
  energy: 100,
  happiness: 50,
  cleanliness: 100,
};

export const MAX_EXP: number = 1000;
export const CRITICAL_TIME: number = 86400000;
export const DEAD_TIME: number = 86400000;

export const HUNGER = {
  DECAY: 2,
  DECAY_LVL: 0.05,
  HEALTH_PLUS_DOUBLE: 1,
  HEALTH_PLUS_DOUBLE_PERCENT: 80,
  HEALTH_PLUS: 0.5,
  HEALTH_PLUS_PERCENT: 40,
  HEALTH_MINUS: 1,
} as const;

export const CLEAN = {
  DECAY: 1.5,
  DECAY_LVL: 0.03,
  HEALTH_PLUS: 0.5,
  HEALTH_PLUS_PERCENT: 80,
  HEALTH_MINUS: 0.5,
  HEALTH_MINUS_PERCENT: 30,
} as const;

export const HAPPINES = {
  MINUS: 0.5,
  PLUS: 0.2,
  DECAY_HUNGER: 30,
  DECAY_CLEAN: 30,
} as const;

export const EXP = {
  HIGH: 1.2,
  HIGH_PERCENT: 80,
  MID: 1.0,
  MID_PERCENT: 50,
  LOW: 0.8,
} as const;

export const ENERGY = {
  REGEN_BASE: 10,
  REGEN_SLEEP: 20,
  REGEN_LVL: 0.2,
  BASE_LVL: 2,
  HUNGER_BEST_PERCENT: 80,
  HUNGER_BEST_RATE: 1.2,
  HUNGER_MID_PERCENT: 40,
  HUNGER_MID_RATE: 1.0,
  HUNGER_LOW_RATE: 0.6,
} as const;
