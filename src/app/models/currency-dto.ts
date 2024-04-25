import { Currency } from './currency-and-countries';

export interface ICurrencyDto {
  date: string;
  base: Currency;
  rates: Record<Currency, string>;
}

export interface IFromToDto {
  date: string;
  from: Currency;
  to: Currency;
  rate: string;
  givenAmount: string;
  convertedAmount: string;
}
