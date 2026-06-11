import {
  DEGRADATION_STATS,
  RARITY_STATS,
} from "../../constants/pixegotchi_const";
import { RarityType } from "../../enums";
import {
  round,
  //calculateDelta,
  applyRarityReduction,
  applyTraitModifier,
  getPercentStat,
} from "./calculate_delta";

export function getBaseHungerDelta(level: number): number {
  return (
    DEGRADATION_STATS.hunger.DECAY + level * DEGRADATION_STATS.hunger.DECAY_LVL
  );
}

export function getFinalHungerDelta(level: number, rarity: RarityType): number {
  const deltaHunger = getBaseHungerDelta(level);
  const applyRarity = applyRarityReduction(deltaHunger, rarity);
  const applyTrait = applyTraitModifier(applyRarity);
  const finalDelta = -getPercentStat(applyTrait, RARITY_STATS[rarity].maxStat);
  return finalDelta;
}

// for (const key of Object.keys(RarityType)) {
//   console.log(`${key}`, getFinalHungerDelta(20, key as RarityType));
// }
