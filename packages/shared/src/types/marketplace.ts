import { CurrencyType } from "../enums";

export interface MarketplaceListing {
  id: number;
  item: string;
  price: number;
  currency: CurrencyType;
  seller: string;
  icon: string;
}
