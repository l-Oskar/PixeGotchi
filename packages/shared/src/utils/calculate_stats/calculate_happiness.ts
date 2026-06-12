import {
  DEGRADATION_STATS,
  RARITY_STATS,
} from "../../constants/pixegotchi_const";
import { RarityType } from "../../enums";
import {
  applyRarityReduction,
  applyTraitModifier,
  percentToValue,
  valueToPercent,
} from "./calculate_delta";

export function hungerToHappiness(hunger: number, rarity: RarityType): number {
  let happinessDelta = 0;
  const happinessConst = DEGRADATION_STATS.happiness;
  const hungerPercent = valueToPercent(hunger, RARITY_STATS[rarity].maxStat);
  if (hungerPercent < happinessConst.DECAY_HUNGER) {
    happinessDelta = happinessConst.MINUS;
  } else {
    happinessDelta = happinessConst.PLUS;
  }
  return happinessDelta;
}

export function cleanlinessToHappiness(
  cleanliness: number,
  rarity: RarityType,
): number {
  let happinessDelta = 0;
  const happinessConst = DEGRADATION_STATS.happiness;
  const cleanlinessPercent = valueToPercent(
    cleanliness,
    RARITY_STATS[rarity].maxStat,
  );
  if (cleanlinessPercent < happinessConst.DECAY_CLEAN) {
    happinessDelta = happinessConst.MINUS;
  } else {
    happinessDelta = happinessConst.PLUS;
  }
  return happinessDelta;
}

export function getBaseHappinessDelta(level: number): number {
  return (
    DEGRADATION_STATS.happiness.DECAY +
    level * DEGRADATION_STATS.happiness.DECAY_LVL
  );
}

export function getFinalHappinessDelta(
  level: number,
  hunger: number,
  cleanliness: number,
  rarity: RarityType,
): number {
  let happinessDelta =
    getBaseHappinessDelta(level) +
    hungerToHappiness(hunger, rarity) +
    cleanlinessToHappiness(cleanliness, rarity);
  const applyRarity = applyRarityReduction(happinessDelta, rarity);
  const applyTrait = applyTraitModifier(applyRarity);
  const finalDelta = -percentToValue(applyTrait, RARITY_STATS[rarity].maxStat);
  return finalDelta;
}

// for (const key of Object.keys(RarityType)) {
//   console.log(`${key}`, getFinalHappinessDelta(50, 50, 50, key as RarityType));
// }
