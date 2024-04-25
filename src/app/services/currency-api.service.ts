import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Currency } from '../models/currency-and-countries';
import { Observable } from 'rxjs';
import { IFromToDto } from '../models/currency-dto';

@Injectable()
export class CurrencyApiService {
  constructor(private http: HttpClient) {}

  public convertFromTo(fromCurrency: Currency, toCurrency: Currency, amount: number): Observable<IFromToDto> {
    return this.http.get<IFromToDto>(this.getBaseUrl('convert/latest'), {
      params: { from: fromCurrency, to: toCurrency, amount: amount.toString() },
    });
  }

  private getBaseUrl(suffix = '') {
    return `https://api.currencyfreaks.com/v2.0/` + suffix;
  }
}
