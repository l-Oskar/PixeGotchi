import {
  DEGRADATION_STATS,
  RARITY_STATS,
} from "../../constants/pixegotchi_const";
import { RarityType } from "../../enums";
import { getTraitModifier } from "../../constants/traits_const";
import {
  applyRarityReduction,
  percentToValue,
} from "./calculate_delta";

export function getBaseCleanlinessDelta(level: number): number {
  return (
    DEGRADATION_STATS.cleanliness.DECAY +
    level * DEGRADATION_STATS.cleanliness.DECAY_LVL
  );
}

export function getFinalCleanlinessDelta(
  level: number,
  rarity: RarityType,
  traits: readonly string[] = [],
): number {
  const deltaCleanliness = getBaseCleanlinessDelta(level);
  const applyRarity = applyRarityReduction(deltaCleanliness, rarity);
  const applyTrait =
    applyRarity * getTraitModifier(traits, "cleanliness_decay");
  const finalDelta = -percentToValue(applyTrait, RARITY_STATS[rarity].maxStat);
  return finalDelta;
}

// for (const key of Object.keys(RarityType)) {
//   console.log(`${key}`, getFinalCleanlinessDelta(50, key as RarityType));
// }
