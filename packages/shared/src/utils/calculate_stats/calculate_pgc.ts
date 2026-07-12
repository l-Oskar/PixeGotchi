import { RARITY_STATS } from "../../constants/pixegotchi_const";
import { getTraitModifier } from "../../constants/traits_const";
import { RarityType } from "../../enums";

export const getFinalPgc = (
  score: number,
  rarity: RarityType,
  traits: readonly string[] = [],
  gameDifficulty: number = 1,
) => {
  const reward =
    (score / 2) *
    RARITY_STATS[rarity].goldEarn *
    getTraitModifier(traits, "game_pgc_gain") *
    gameDifficulty;

  return Number(reward.toFixed(8));
};
