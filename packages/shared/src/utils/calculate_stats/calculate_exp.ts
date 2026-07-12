import { EXP, EXP_MULT } from "../../constants/pixegotchi_const";
import { valueToPercent } from "./calculate_delta";

export function getExpMult(happiness: number, max: number): number {
  const percent = valueToPercent(happiness, max);
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
  max: number,
  gameDifficulty: number = 1,
): number {
  if (score <= 0) {
    return 0;
  }

  const scoreMultiplier = Math.min(1.1, Math.max(0.5, 0.5 + score / 200));

  return Math.round(
    (EXP.BASE_EXP + level * EXP.LVL_MULT) *
      getExpMult(happiness, max) *
      gameDifficulty *
      scoreMultiplier,
  );
}
