import {
  DEGRADATION_STATS,
  RARITY_STATS,
} from "../../constants/pixegotchi_const";
import { RarityType } from "../../enums";
import {
  round,
  applyRarityReduction,
  applyTraitModifier,
} from "../calculate_delta";

export function getBaseCleanlinessDelta(level: number): number {
  return -(
    DEGRADATION_STATS.cleanliness.DECAY +
    level * DEGRADATION_STATS.cleanliness.DECAY_LVL
  );
}

export function getFinalCleanlinessDelta(
  level: number,
  rarity: RarityType,
): number {
  const deltaCleanliness = getBaseCleanlinessDelta(level);
  const applyRarity = applyRarityReduction(
    deltaCleanliness,
    RARITY_STATS[rarity].degradationReduce,
  );
  const finalCleanlinessDelta = applyTraitModifier(applyRarity);
  return round(finalCleanlinessDelta);
}
