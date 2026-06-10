export function round(num: number): number {
  return parseFloat(num.toFixed(2));
}

export function calculateDelta(
  deltaPerHour: number,
  elapsedMs: number,
): number {
  return (deltaPerHour * elapsedMs) / 3_600_000;
}

export function applyRarityReduction(delta: number, reduction: number): number {
  return delta * (1 - reduction);
}

export function applyTraitModifier(delta: number): number {
  return delta;
}
