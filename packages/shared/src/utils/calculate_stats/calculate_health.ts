import {
  DEGRADATION_STATS,
  RARITY_STATS,
} from "../../constants/pixegotchi_const";
import { RarityType } from "../../enums";
import {
  applyRarityReduction,
  valueToPercent,
  applyTraitModifier,
  percentToValue,
} from "./calculate_delta";

export function cleanlinessToHealth(
  cleanliness: number,
  rarity: RarityType,
): number {
  const cleanlinessPercent = valueToPercent(
    cleanliness,
    RARITY_STATS[rarity].maxStat,
  );
  const cleanlinessConst = DEGRADATION_STATS.cleanliness;
  let healthRegenDelta = 0;
  if (cleanlinessPercent >= cleanlinessConst.HEALTH_PLUS_PERCENT) {
    healthRegenDelta = cleanlinessConst.HEALTH_PLUS;
  } else if (cleanlinessPercent >= cleanlinessConst.HEALTH_MINUS_PERCENT) {
    healthRegenDelta = 0;
  } else {
    healthRegenDelta = cleanlinessConst.HEALTH_MINUS;
  }
  return healthRegenDelta;
}

export function hungerToHealth(hunger: number, rarity: RarityType): number {
  const hungerPercent = valueToPercent(hunger, RARITY_STATS[rarity].maxStat);
  const hungerConst = DEGRADATION_STATS.hunger;
  let healthRegenDelta = 0;
  if (hungerPercent >= hungerConst.HEALTH_PLUS_DOUBLE_PERCENT) {
    healthRegenDelta = hungerConst.HEALTH_PLUS_DOUBLE;
  } else if (hungerPercent >= hungerConst.HEALTH_PLUS_PERCENT) {
    healthRegenDelta = hungerConst.HEALTH_PLUS;
  } else if (
    hungerPercent > hungerConst.HEALTH_MINUS_PERCENT &&
    hungerPercent < hungerConst.HEALTH_PLUS_PERCENT
  ) {
    healthRegenDelta = 0;
  } else {
    healthRegenDelta = hungerConst.HEALTH_MINUS;
  }
  return healthRegenDelta;
}

export function getBaseHealthDelta(level: number): number {
  return (
    DEGRADATION_STATS.health.REGEN + level * DEGRADATION_STATS.health.DELTA_LVL
  );
}

export function getFinalHealthDelta(
  level: number,
  hunger: number,
  cleanliness: number,
  rarity: RarityType,
): number {
  let healthRegenDelta =
    getBaseHealthDelta(level) +
    hungerToHealth(hunger, rarity) +
    cleanlinessToHealth(cleanliness, rarity);
  const applyRarity = applyRarityReduction(healthRegenDelta, rarity);
  const applyTrait = applyTraitModifier(applyRarity);
  const finalDelta = -percentToValue(applyTrait, RARITY_STATS[rarity].maxStat);
  return finalDelta;
}

// for (const key of Object.keys(RarityType)) {
//   console.log(`${key}`, getFinalHealthDelta(10, 10, 10, key as RarityType));
// }
