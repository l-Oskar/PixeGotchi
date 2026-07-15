import { RARITY_STATS } from "../../constants/pixegotchi_const";
import { getTraitModifier } from "../../constants/traits_const";
import { RarityType } from "../../enums";

export const getFinalPgc = (
  score: number,
  maxScore: number,
  rarity: RarityType,
  traits: readonly string[] = [],
  gameDifficulty: number = 1,
) => {
  if (score <= 0 || maxScore <= 0) {
    return 0;
  }

  const boundedScore = Math.min(maxScore, score);
  const scoreRatio = boundedScore / maxScore;
  const scoreMultiplier = 0.25 + scoreRatio * 1.25;
  const reward =
    (boundedScore / 2) *
    scoreMultiplier *
    RARITY_STATS[rarity].goldEarn *
    getTraitModifier(traits, "game_pgc_gain") *
    gameDifficulty;

  return Math.floor(reward);
};
