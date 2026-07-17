const PRICE_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/;
const MONEY_SCALE = 100_000_000n;

const parseScaledMoney = (value: string) => {
  if (!PRICE_PATTERN.test(value)) return null;
  const [whole = "0", fraction = ""] = value.split(".");
  return BigInt(whole) * MONEY_SCALE + BigInt(fraction.padEnd(8, "0"));
};

const formatScaledMoney = (value: bigint) => {
  const whole = value / MONEY_SCALE;
  const fraction = (value % MONEY_SCALE)
    .toString()
    .padStart(8, "0")
    .replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
};

export const multiplyMarketplaceMoney = (
  unitPrice: string,
  quantity: number,
) => {
  const scaledPrice = parseScaledMoney(unitPrice);
  if (scaledPrice === null || quantity < 1) return null;
  return formatScaledMoney(scaledPrice * BigInt(quantity));
};

export const calculateMarketplaceSalePreview = (
  unitPrice: string,
  quantity: number,
  commissionBps: number,
  minUnitPrice: string,
  maxUnitPrice: string,
) => {
  const scaledPrice = parseScaledMoney(unitPrice);
  const scaledMin = parseScaledMoney(minUnitPrice);
  const scaledMax = parseScaledMoney(maxUnitPrice);
  if (
    scaledPrice === null ||
    scaledMin === null ||
    scaledMax === null ||
    scaledPrice < scaledMin ||
    scaledPrice > scaledMax ||
    quantity < 1
  ) {
    return null;
  }

  const gross = scaledPrice * BigInt(quantity);
  const fee =
    (gross * BigInt(commissionBps) + 5_000n) / 10_000n;
  return {
    gross: formatScaledMoney(gross),
    fee: formatScaledMoney(fee),
    proceeds: formatScaledMoney(gross - fee),
  };
};
