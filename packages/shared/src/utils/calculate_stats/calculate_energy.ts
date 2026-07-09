import {
  DEGRADATION_STATS,
  ENERGY_COST,
  RARITY_STATS,
} from "../../constants/pixegotchi_const";
import { RarityType } from "../../enums";
import {
  applyTraitModifier,
  percentToValue,
  valueToPercent,
} from "./calculate_delta";

export function hungerToEnergy(hunger: number, rarity: RarityType): number {
  let energyDelta = 0;
  const energyConst = DEGRADATION_STATS.energy;
  const hungerPercent = valueToPercent(hunger, RARITY_STATS[rarity].maxStat);
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
  const healthPercent = valueToPercent(health, RARITY_STATS[rarity].maxStat);
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
  const finalDelta = percentToValue(
    traitMult * hungerMult * healthMult,
    RARITY_STATS[rarity].maxStat,
  );
  return finalDelta;
}

export function getEnergyCost(health: number, rarity: RarityType): number {
  let mult = 0;
  const healthPercent = valueToPercent(health, RARITY_STATS[rarity].maxStat);
  if (healthPercent >= ENERGY_COST.STRONG) {
    mult = ENERGY_COST.STRONG_MULT;
  } else if (healthPercent >= ENERGY_COST.NORMAL) {
    mult = ENERGY_COST.NORMAL_MULT;
  } else if (healthPercent >= ENERGY_COST.WEAK) {
    mult = ENERGY_COST.WEAK_MULT;
  } else {
    mult = ENERGY_COST.SICK_MULT;
  }
  return mult;
}

export function getFinalEnergyCost(
  health: number,
  rarity: RarityType,
  energycost: number,
) {
  return energycost * getEnergyCost(health, rarity);
}

// for (const key of Object.keys(RarityType)) {
//   console.log(
//     `${key}`,
//     getFinalEnergyDelta(
//       10,
//       percentToValue(80, RARITY_STATS[key as RarityType].maxStat),
//       percentToValue(80, RARITY_STATS[key as RarityType].maxStat),
//       key as RarityType,
//     ),
//   );
// }
