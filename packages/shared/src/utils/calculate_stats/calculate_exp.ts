import { EXP, EXP_MULT } from "../../constants/pixegotchi_const";

export function getExpMult(happiness: number): number {
  if (happiness >= EXP_MULT.HIGH_PERCENT) {
    return EXP_MULT.HIGH;
  } else if (happiness >= EXP_MULT.MID_PERCENT) {
    return EXP_MULT.MID;
  } else {
    return EXP_MULT.LOW;
  }
}

export function getFinalExp(
  happiness: number,
  level: number,
  gameDifficult: number = 1,
): number {
  return (
    (EXP.BASE_EXP + level * EXP.LVL_MULT) *
    gameDifficult *
    getExpMult(happiness)
  );
}
