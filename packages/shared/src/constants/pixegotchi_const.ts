import { RarityStatsType } from "../types/pixegotchi";
import { PixegotchiStatsType, RarityType } from "../enums";

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
    maxStat: 105,
    degradationReduce: 0.05,
    traits: {
      min: 1,
      max: 1,
    },
    goldEarn: 1,
  },
  rare: {
    maxStat: 110,
    degradationReduce: 0.1,
    traits: {
      min: 1,
      max: 2,
    },
    goldEarn: 1,
  },
  epic: {
    maxStat: 115,
    degradationReduce: 0.15,
    traits: {
      min: 2,
      max: 2,
    },
    goldEarn: 1.1,
  },
  mythic: {
    maxStat: 120,
    degradationReduce: 0.2,
    traits: {
      min: 2,
      max: 3,
    },
    goldEarn: 1.2,
  },
  legendary: {
    maxStat: 130,
    degradationReduce: 0.25,
    traits: {
      min: 4,
      max: 4,
    },
    goldEarn: 1.5,
  },
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

export const DEGRADATION_STATS: Record<
  PixegotchiStatsType,
  Record<string, number>
> = {
  health: {
    REGEN: 0,
  },
  hunger: {
    DECAY: 5,
    DECAY_LVL: 0.05,
    HEALTH_PLUS_DOUBLE: 1,
    HEALTH_PLUS_DOUBLE_PERCENT: 80,
    HEALTH_PLUS: 0.5,
    HEALTH_PLUS_PERCENT: 40,
    HEALTH_MINUS: 1,
  },
  cleanliness: {
    DECAY: 4,
    DECAY_LVL: 0.03,
    HEALTH_PLUS: 0.5,
    HEALTH_PLUS_PERCENT: 80,
    HEALTH_MINUS: 0.5,
    HEALTH_MINUS_PERCENT: 30,
  },
  happiness: {
    MINUS: 0.5,
    PLUS: 0.2,
    DECAY_HUNGER: 30,
    DECAY_CLEAN: 30,
  },
  energy: {
    REGEN_BASE: 10,
    REGEN_SLEEP: 20,
    REGEN_LVL: 0.2,
    BASE_LVL: 2,
    HUNGER_BEST_PERCENT: 80,
    HUNGER_BEST_RATE: 1.2,
    HUNGER_MID_PERCENT: 40,
    HUNGER_MID_RATE: 1.0,
    HUNGER_LOW_RATE: 0.6,
  },
};

export const EXP = {
  HIGH: 1.2,
  HIGH_PERCENT: 80,
  MID: 0.8,
  MID_PERCENT: 50,
  LOW: 0.5,
} as const;
