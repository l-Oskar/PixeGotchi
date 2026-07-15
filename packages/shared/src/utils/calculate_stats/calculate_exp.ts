import { EXP, EXP_MULT } from "../../constants/pixegotchi_const";
import { valueToPercent } from "./calculate_delta";

export function getExpMult(happiness: number, maxHappiness: number): number {
  const percent = valueToPercent(happiness, maxHappiness);
  if (percent >= EXP_MULT.HIGH_PERCENT) {
    return EXP_MULT.HIGH;
  } else if (percent >= EXP_MULT.MID_PERCENT) {
    return EXP_MULT.MID;
  } else {
    return EXP_MULT.LOW;
  }
}

export function getFinalExp(
  happiness: number,
  level: number,
  score: number,
  maxScore: number,
  maxHappiness: number,
  gameDifficulty: number = 1,
): number {
  if (score <= 0 || maxScore <= 0) {
    return 0;
  }

  const scoreRatio = Math.min(1, Math.max(0, score / maxScore));
  // Make player performance meaningful while keeping the total reward bounded.
  const scoreMultiplier = 0.25 + scoreRatio * 1.25;

  return Math.floor(
    (EXP.BASE_EXP + level * EXP.LVL_MULT) *
      getExpMult(happiness, maxHappiness) *
      gameDifficulty *
      scoreMultiplier,
  );
}
