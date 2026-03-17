import { CurrencyType } from "../enums";

export interface MarketplaceListing {
  id: number;
  itemId: string;
  item: string;
  price: number;
  currency: CurrencyType;
  seller: string;
  icon: string;
}
