import {
  DEGRADATION_STATS,
  RARITY_STATS,
} from "../../constants/pixegotchi_const";
import { RarityType } from "../../enums";
import {
  applyTraitModifier,
  getPercentStat,
  getStatPercent,
} from "./calculate_delta";

export function hungerToEnergy(hunger: number, rarity: RarityType): number {
  let energyDelta = 0;
  const energyConst = DEGRADATION_STATS.energy;
  const hungerPercent = getStatPercent(hunger, RARITY_STATS[rarity].maxStat);
  if (hungerPercent >= energyConst.HUNGER_BEST_PERCENT) {
    energyDelta = energyConst.HUNGER_BEST_RATE;
  } else if (hungerPercent >= energyConst.HUNGER_MID_PERCENT) {
    energyDelta = energyConst.HUNGER_MID_RATE;
  } else {
    energyDelta = energyConst.HUNGER_LOW_RATE;
  }
  return energyDelta;
}

export function healthToEnergy(health: number, rarity: RarityType): number {
  let energyDelta = 0;
  const energyConst = DEGRADATION_STATS.energy;
  const healthPercent = getStatPercent(health, RARITY_STATS[rarity].maxStat);
  if (healthPercent >= energyConst.HEALTH_BEST_PERCENT) {
    energyDelta = energyConst.HEALTH_BEST_RATE;
  } else if (healthPercent >= energyConst.HEALTH_MID_PERCENT) {
    energyDelta = energyConst.HEALTH_MID_RATE;
  } else {
    energyDelta = energyConst.HEALTH_LOW_RATE;
  }
  return energyDelta;
}

export function getBaseEnergyDelta(
  level: number,
  isSleeping: boolean = false,
): number {
  const energyConst = DEGRADATION_STATS.energy;
  return (
    (isSleeping ? energyConst.REGEN_SLEEP : energyConst.REGEN_BASE) +
    level * energyConst.REGEN_LVL
  );
}

export function getFinalEnergyDelta(
  level: number,
  hunger: number,
  health: number,
  rarity: RarityType,
): number {
  const baseEnergyDelta = getBaseEnergyDelta(level);
  const hungerMult = hungerToEnergy(hunger, rarity);
  const healthMult = healthToEnergy(health, rarity);
  const traitMult = applyTraitModifier(baseEnergyDelta);
  const finalDelta = getPercentStat(
    traitMult * hungerMult * healthMult,
    RARITY_STATS[rarity].maxStat,
  );
  return finalDelta;
}

// for (const key of Object.keys(RarityType)) {
//   console.log(`${key}`, getFinalEnergyDelta(10, 80, 80, key as RarityType));
// }

/// !!!!!!!!! FIX THIS !!!!!!!
