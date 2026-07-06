import { RARITY_STATS } from "../../constants/pixegotchi_const";
import { RarityType } from "../../enums";

export const getFinalPgc = (rarity: RarityType) => {
  return RARITY_STATS[rarity].goldEarn;
};
