import {
  CRITICAL_TIME,
  DEAD_TIME,
  DEGRADATION_STATS,
  RARITY_STATS,
} from "../../constants/pixegotchi_const";
import { PixegotchiStatus } from "../../enums";
import type {
  Pixegotchi,
  PixegotchiStats,
} from "../../types/pixegotchi";
import {
  applyTraitModifier,
  calculateDelta,
  percentToValue,
  round,
  valueToPercent,
} from "./calculate_delta";

export type PixegotchiSnapshot = Omit<
  Pixegotchi,
  "health" | "hunger" | "energy" | "happiness" | "cleanliness" | "status"
> &
  PixegotchiStats & {
    status: PixegotchiStatus;
    computedAt: string;
    elapsedMs: number;
  };

export type StatEngineConstants = {
  rarityStats: typeof RARITY_STATS;
  degradationStats: typeof DEGRADATION_STATS;
  criticalTime: number;
  deadTime: number;
};

export type StatEngineConstantOverrides = Partial<{
  rarityStats: Partial<typeof RARITY_STATS>;
  degradationStats: Partial<{
    [Key in keyof typeof DEGRADATION_STATS]: Partial<
      (typeof DEGRADATION_STATS)[Key]
    >;
  }>;
  criticalTime: number;
  deadTime: number;
}>;

export type StatEngineOptions = {
  constants?: StatEngineConstantOverrides;
};

const toNumber = (value: number | string, fallback = 0) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toTime = (value: Date | string | null) => {
  if (!value) return null;
  const time =
    value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
};

const clampStat = (value: number, maxStat: number) =>
  round(Math.min(maxStat, Math.max(0, value)));
const DEGRADATION_STEP_MS = 3_600_000;

const getStatEngineConstants = (
  overrides?: StatEngineConstantOverrides,
): StatEngineConstants => ({
  rarityStats: Object.fromEntries(
    (Object.entries(RARITY_STATS) as Array<
      [keyof typeof RARITY_STATS, (typeof RARITY_STATS)[keyof typeof RARITY_STATS]]
    >).map(([rarity, stats]) => [
      rarity,
      {
        ...stats,
        ...(overrides?.rarityStats?.[rarity] ?? {}),
      },
    ]),
  ) as typeof RARITY_STATS,
  degradationStats: Object.fromEntries(
    (Object.entries(DEGRADATION_STATS) as Array<
      [
        keyof typeof DEGRADATION_STATS,
        (typeof DEGRADATION_STATS)[keyof typeof DEGRADATION_STATS],
      ]
    >).map(([stat, values]) => [
      stat,
      {
        ...values,
        ...(overrides?.degradationStats?.[stat] ?? {}),
      },
    ]),
  ) as typeof DEGRADATION_STATS,
  criticalTime: overrides?.criticalTime ?? CRITICAL_TIME,
  deadTime: overrides?.deadTime ?? DEAD_TIME,
});

const applyRarityReduction = (
  delta: number,
  rarity: keyof typeof RARITY_STATS,
  constants: StatEngineConstants,
) => delta * (1 - constants.rarityStats[rarity].degradationReduce);

const getFinalHungerDelta = (
  level: number,
  rarity: keyof typeof RARITY_STATS,
  constants: StatEngineConstants,
) => {
  const deltaHunger =
    constants.degradationStats.hunger.DECAY +
    level * constants.degradationStats.hunger.DECAY_LVL;
  const applyRarity = applyRarityReduction(deltaHunger, rarity, constants);
  const applyTrait = applyTraitModifier(applyRarity);
  return -percentToValue(applyTrait, constants.rarityStats[rarity].maxStat);
};

const getFinalCleanlinessDelta = (
  level: number,
  rarity: keyof typeof RARITY_STATS,
  constants: StatEngineConstants,
) => {
  const deltaCleanliness =
    constants.degradationStats.cleanliness.DECAY +
    level * constants.degradationStats.cleanliness.DECAY_LVL;
  const applyRarity = applyRarityReduction(deltaCleanliness, rarity, constants);
  const applyTrait = applyTraitModifier(applyRarity);
  return -percentToValue(applyTrait, constants.rarityStats[rarity].maxStat);
};

const hungerToHappiness = (
  hunger: number,
  rarity: keyof typeof RARITY_STATS,
  constants: StatEngineConstants,
) => {
  const hungerPercent = valueToPercent(
    hunger,
    constants.rarityStats[rarity].maxStat,
  );
  return hungerPercent < constants.degradationStats.happiness.DECAY_HUNGER
    ? constants.degradationStats.happiness.MINUS
    : constants.degradationStats.happiness.PLUS;
};

const cleanlinessToHappiness = (
  cleanliness: number,
  rarity: keyof typeof RARITY_STATS,
  constants: StatEngineConstants,
) => {
  const cleanlinessPercent = valueToPercent(
    cleanliness,
    constants.rarityStats[rarity].maxStat,
  );
  return cleanlinessPercent < constants.degradationStats.happiness.DECAY_CLEAN
    ? constants.degradationStats.happiness.MINUS
    : constants.degradationStats.happiness.PLUS;
};

const getFinalHappinessDelta = (
  level: number,
  hunger: number,
  cleanliness: number,
  rarity: keyof typeof RARITY_STATS,
  constants: StatEngineConstants,
) => {
  const happinessDelta =
    constants.degradationStats.happiness.DECAY +
    level * constants.degradationStats.happiness.DECAY_LVL +
    hungerToHappiness(hunger, rarity, constants) +
    cleanlinessToHappiness(cleanliness, rarity, constants);
  const applyRarity = applyRarityReduction(happinessDelta, rarity, constants);
  const applyTrait = applyTraitModifier(applyRarity);
  return -percentToValue(applyTrait, constants.rarityStats[rarity].maxStat);
};

const hungerToEnergy = (
  hunger: number,
  rarity: keyof typeof RARITY_STATS,
  constants: StatEngineConstants,
) => {
  const hungerPercent = valueToPercent(
    hunger,
    constants.rarityStats[rarity].maxStat,
  );
  const energyConst = constants.degradationStats.energy;
  if (hungerPercent >= energyConst.HUNGER_BEST_PERCENT) {
    return energyConst.HUNGER_BEST_RATE;
  }
  if (hungerPercent >= energyConst.HUNGER_MID_PERCENT) {
    return energyConst.HUNGER_MID_RATE;
  }
  return energyConst.HUNGER_LOW_RATE;
};

const healthToEnergy = (
  health: number,
  rarity: keyof typeof RARITY_STATS,
  constants: StatEngineConstants,
) => {
  const healthPercent = valueToPercent(
    health,
    constants.rarityStats[rarity].maxStat,
  );
  const energyConst = constants.degradationStats.energy;
  if (healthPercent >= energyConst.HEALTH_BEST_PERCENT) {
    return energyConst.HEALTH_BEST_RATE;
  }
  if (healthPercent >= energyConst.HEALTH_MID_PERCENT) {
    return energyConst.HEALTH_MID_RATE;
  }
  return energyConst.HEALTH_LOW_RATE;
};

const getFinalEnergyDelta = (
  level: number,
  hunger: number,
  health: number,
  rarity: keyof typeof RARITY_STATS,
  constants: StatEngineConstants,
) => {
  const energyConst = constants.degradationStats.energy;
  const baseEnergyDelta = energyConst.REGEN_BASE + level * energyConst.REGEN_LVL;
  const hungerMult = hungerToEnergy(hunger, rarity, constants);
  const healthMult = healthToEnergy(health, rarity, constants);
  const traitMult = applyTraitModifier(baseEnergyDelta);
  return percentToValue(
    traitMult * hungerMult * healthMult,
    constants.rarityStats[rarity].maxStat,
  );
};

const cleanlinessToHealth = (
  cleanliness: number,
  rarity: keyof typeof RARITY_STATS,
  constants: StatEngineConstants,
) => {
  const cleanlinessPercent = valueToPercent(
    cleanliness,
    constants.rarityStats[rarity].maxStat,
  );
  const cleanlinessConst = constants.degradationStats.cleanliness;
  if (cleanlinessPercent >= cleanlinessConst.HEALTH_PLUS_PERCENT) {
    return cleanlinessConst.HEALTH_PLUS;
  }
  if (cleanlinessPercent >= cleanlinessConst.HEALTH_MINUS_PERCENT) {
    return 0;
  }
  return cleanlinessConst.HEALTH_MINUS;
};

const hungerToHealth = (
  hunger: number,
  rarity: keyof typeof RARITY_STATS,
  constants: StatEngineConstants,
) => {
  const hungerPercent = valueToPercent(
    hunger,
    constants.rarityStats[rarity].maxStat,
  );
  const hungerConst = constants.degradationStats.hunger;
  if (hungerPercent >= hungerConst.HEALTH_PLUS_DOUBLE_PERCENT) {
    return hungerConst.HEALTH_PLUS_DOUBLE;
  }
  if (hungerPercent >= hungerConst.HEALTH_PLUS_PERCENT) {
    return hungerConst.HEALTH_PLUS;
  }
  if (
    hungerPercent > hungerConst.HEALTH_MINUS_PERCENT &&
    hungerPercent < hungerConst.HEALTH_PLUS_PERCENT
  ) {
    return 0;
  }
  return hungerConst.HEALTH_MINUS;
};

const getFinalHealthDelta = (
  level: number,
  hunger: number,
  cleanliness: number,
  rarity: keyof typeof RARITY_STATS,
  constants: StatEngineConstants,
) => {
  const healthDelta =
    constants.degradationStats.health.REGEN +
    level * constants.degradationStats.health.DELTA_LVL +
    hungerToHealth(hunger, rarity, constants) +
    cleanlinessToHealth(cleanliness, rarity, constants);
  const applyRarity = applyRarityReduction(healthDelta, rarity, constants);
  const applyTrait = applyTraitModifier(applyRarity);
  return -percentToValue(applyTrait, constants.rarityStats[rarity].maxStat);
};

const getElapsedMs = (pixegotchi: Pixegotchi, now: Date) => {
  const lastUpdateTime = toTime(pixegotchi.lastUpdateAt);
  if (!lastUpdateTime) return 0;

  return Math.max(0, now.getTime() - lastUpdateTime);
};

export function calculateCurrentStats(
  pixegotchi: Pixegotchi,
  now = new Date(),
  options: StatEngineOptions = {},
): PixegotchiStats {
  const constants = getStatEngineConstants(options.constants);
  const maxStat = constants.rarityStats[pixegotchi.rarity].maxStat;
  const baseStats: PixegotchiStats = {
    health: clampStat(toNumber(pixegotchi.health), maxStat),
    hunger: clampStat(toNumber(pixegotchi.hunger), maxStat),
    energy: clampStat(toNumber(pixegotchi.energy), maxStat),
    happiness: clampStat(toNumber(pixegotchi.happiness), maxStat),
    cleanliness: clampStat(toNumber(pixegotchi.cleanliness), maxStat),
  };

  if (
    pixegotchi.status === PixegotchiStatus.vault ||
    pixegotchi.status === PixegotchiStatus.dead
  ) {
    return baseStats;
  }

  const elapsedMs = getElapsedMs(pixegotchi, now);
  if (elapsedMs === 0) return baseStats;

  const stats = { ...baseStats };
  let remainingMs = elapsedMs;

  while (remainingMs > 0) {
    const stepMs = Math.min(remainingMs, DEGRADATION_STEP_MS);

    stats.hunger = clampStat(
      stats.hunger +
        calculateDelta(
          getFinalHungerDelta(
            pixegotchi.level,
            pixegotchi.rarity,
            constants,
          ),
          stepMs,
        ),
      maxStat,
    );
    stats.cleanliness = clampStat(
      stats.cleanliness +
        calculateDelta(
          getFinalCleanlinessDelta(
            pixegotchi.level,
            pixegotchi.rarity,
            constants,
          ),
          stepMs,
        ),
      maxStat,
    );
    stats.happiness = clampStat(
      stats.happiness +
        calculateDelta(
          getFinalHappinessDelta(
            pixegotchi.level,
            stats.hunger,
            stats.cleanliness,
            pixegotchi.rarity,
            constants,
          ),
          stepMs,
        ),
      maxStat,
    );
    stats.energy = clampStat(
      stats.energy +
        calculateDelta(
          getFinalEnergyDelta(
            pixegotchi.level,
            stats.hunger,
            stats.health,
            pixegotchi.rarity,
            constants,
          ),
          stepMs,
        ),
      maxStat,
    );
    stats.health = clampStat(
      stats.health +
        calculateDelta(
          getFinalHealthDelta(
            pixegotchi.level,
            stats.hunger,
            stats.cleanliness,
            pixegotchi.rarity,
            constants,
          ),
          stepMs,
        ),
      maxStat,
    );

    remainingMs -= stepMs;
  }

  return stats;
}

export function derivePixegotchiStatus(
  pixegotchi: Pixegotchi,
  stats: PixegotchiStats,
  now = new Date(),
  options: StatEngineOptions = {},
): PixegotchiStatus {
  const constants = getStatEngineConstants(options.constants);
  if (
    pixegotchi.status === PixegotchiStatus.vault ||
    pixegotchi.status === PixegotchiStatus.dead
  ) {
    return pixegotchi.status;
  }

  if (stats.health > 0) return PixegotchiStatus.active;

  const criticalSince = toTime(pixegotchi.criticalSince);
  if (criticalSince) {
    if (now.getTime() - criticalSince >= constants.deadTime) {
      return PixegotchiStatus.dead;
    }

    return PixegotchiStatus.critical;
  }

  const healthZeroAt = toTime(pixegotchi.healthZeroAt);
  if (!healthZeroAt) return PixegotchiStatus.active;

  const timeSinceHealthZero = now.getTime() - healthZeroAt;
  if (timeSinceHealthZero >= constants.criticalTime + constants.deadTime) {
    return PixegotchiStatus.dead;
  }

  if (timeSinceHealthZero >= constants.criticalTime) {
    return PixegotchiStatus.critical;
  }

  return PixegotchiStatus.active;
}

export function buildPixegotchiSnapshot(
  pixegotchi: Pixegotchi,
  now = new Date(),
  options: StatEngineOptions = {},
): PixegotchiSnapshot {
  const stats = calculateCurrentStats(pixegotchi, now, options);
  const status = derivePixegotchiStatus(pixegotchi, stats, now, options);

  return {
    ...pixegotchi,
    ...stats,
    status,
    computedAt: now.toISOString(),
    elapsedMs: getElapsedMs(pixegotchi, now),
  };
}
