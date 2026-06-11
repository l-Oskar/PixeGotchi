import { RARITY_STATS } from "../../constants/pixegotchi_const";
import { RarityType } from "../../enums";

export function round(num: number): number {
  return parseFloat(num.toFixed(2));
}

export function getStatPercent(value: number, max: number): number {
  return round((value / max) * 100);
}

export function getPercentStat(percent: number, max: number): number {
  return round((percent * max) / 100);
}

export function calculateDelta(
  deltaPerHour: number,
  elapsedMs: number,
): number {
  return (deltaPerHour * elapsedMs) / 3_600_000;
}

export function applyRarityReduction(
  delta: number,
  rarity: RarityType,
): number {
  return delta * (1 - RARITY_STATS[rarity].degradationReduce);
}

export function applyTraitModifier(delta: number): number {
  return delta;
}
