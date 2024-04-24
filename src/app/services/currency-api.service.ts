import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Currency } from '../models/currency-and-countries';

@Injectable()
export class CurrencyApiService {
  private readonly currencies: Array<Currency> = ['USD', 'GBP', 'UZS', 'RUB', 'KZT'];

  constructor(private http: HttpClient) {}

  public getCurrencies(baseCurrency: Currency = 'USD'): void {
    this.http
      .get(`https://api.currencyfreaks.com/v2.0/rates/latest`, {
        params: { base: baseCurrency, symbols: this.getSymbolsParams(baseCurrency) },
      })
      .subscribe(date => console.table(date));
  }

  private getSymbolsParams(baseCurrency: Currency): Array<Currency> {
    return this.currencies.filter(currency => currency !== baseCurrency);
  }
}
