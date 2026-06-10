import {
  DEGRADATION_STATS,
  RARITY_STATS,
} from "../../constants/pixegotchi_const";
import { RarityType } from "../../enums";
import {
  round,
  calculateDelta,
  applyRarityReduction,
  applyTraitModifier,
} from "../calculate_delta";

export function getBaseHungerDelta(level: number): number {
  return -(
    DEGRADATION_STATS.hunger.DECAY +
    level * DEGRADATION_STATS.hunger.DECAY_LVL
  );
}

export function getFinalHungerDelta(level: number, rarity: RarityType): number {
  const deltaHunger = getBaseHungerDelta(level);
  const applyRarity = applyRarityReduction(
    deltaHunger,
    RARITY_STATS[rarity].degradationReduce,
  );
  const finalDelta = applyTraitModifier(applyRarity);
  return round(finalDelta);
}

// for (const key of Object.keys(RarityType)) {
//   console.log(
//     `${key}`,
//     calculateDelta(getFinalHungerDelta(20, key as RarityType), 36000000),
//   );
// }
