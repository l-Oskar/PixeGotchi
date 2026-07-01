export const toFiniteStatNumber = (value: number | string | null | undefined) => {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : 0;
};

export const formatWholeStatValue = (
  value: number | string | null | undefined,
) => Math.round(toFiniteStatNumber(value));
