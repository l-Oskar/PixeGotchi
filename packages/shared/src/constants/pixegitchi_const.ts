import { RarityStats } from "../types/pixegotchi";

export const RARITY_STATS: RarityStats = {
  common: {
    maxStatus: 100,
    degradationReduce: 0,
    traits: {
      min: 0,
      max: 1,
    },
    goldEarn: 1,
  },
  uncommon: {
    maxStatus: 110,
    degradationReduce: 5,
    traits: {
      min: 1,
      max: 1,
    },
    goldEarn: 1,
  },
  rare: {
    maxStatus: 115,
    degradationReduce: 10,
    traits: {
      min: 1,
      max: 2,
    },
    goldEarn: 1,
  },
  epic: {
    maxStatus: 120,
    degradationReduce: 15,
    traits: {
      min: 2,
      max: 2,
    },
    goldEarn: 1.1,
  },
  mythic: {
    maxStatus: 130,
    degradationReduce: 20,
    traits: {
      min: 2,
      max: 3,
    },
    goldEarn: 1.2,
  },
  legendary: {
    maxStatus: 150,
    degradationReduce: 25,
    traits: {
      min: 4,
      max: 4,
    },
    goldEarn: 1.5,
  },
};

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
