import { ChestType, CurrencyType } from "../enums";

export const MARKETPLACE_CONFIG = {
  commissionBps: 500,
  listingDurationDays: 7,
  maxActiveListings: 10,
  minUnitPrice: "1",
  maxUnitPrice: "1000000000",
  enabledCurrencies: [CurrencyType.pgc],
  sellableChestTypes: [
    ChestType.crystal,
    ChestType.mythic,
    ChestType.legendary,
  ],
} as const;

export const MARKETPLACE_MONEY_SCALE = 8;
