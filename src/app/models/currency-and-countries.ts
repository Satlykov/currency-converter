import { TuiCountryIsoCode } from '@taiga-ui/i18n';

export type Currency = 'USD' | 'GBP' | 'UZS' | 'RUB' | 'KZT';
export type Countries = 'USA' | 'UK' | 'Uzbekistan' | 'Russia' | 'Kazakhstan';

export class Country {
  constructor(
    readonly name: Countries,
    readonly currency: Currency,
    readonly flag: TuiCountryIsoCode,
  ) {}
}
