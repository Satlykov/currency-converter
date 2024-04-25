import { DestroyRef, inject, Injectable } from '@angular/core';
import { CurrencyApiService } from './currency-api.service';
import { Country, Currency } from '../models/currency-and-countries';
import { TuiCountryIsoCode } from '@taiga-ui/i18n';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CurrencyFormProp } from '../const/currency';
import { BehaviorSubject, debounceTime, finalize, tap } from 'rxjs';
import { TuiBooleanHandler } from '@taiga-ui/cdk';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class CurrencyFormControllerService {
  public destroyRef = inject(DestroyRef);
  public countries = [
    new Country('USA', 'USD', TuiCountryIsoCode.US),
    new Country('UK', 'GBP', TuiCountryIsoCode.GB),
    new Country('Uzbekistan', 'UZS', TuiCountryIsoCode.UZ),
    new Country('Russia', 'RUB', TuiCountryIsoCode.RU),
    new Country('Kazakhstan', 'KZT', TuiCountryIsoCode.KZ),
  ];

  private defaultFirstCountry = this.countries[0];
  private defaultSecondCountry = this.countries[2];
  private defaultMoneyFirst: number = 1;

  private showLoaderSubject$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public showLoader$ = this.showLoaderSubject$.asObservable();

  private rateSubject$: BehaviorSubject<number> = new BehaviorSubject(1);
  public rate$ = this.rateSubject$.asObservable();

  constructor(private readonly api: CurrencyApiService) {
    this.convertFromToAPI(this.defaultFirstCountry.currency, this.defaultSecondCountry.currency);
    this.formValueChangesOn();
  }

  public form = new FormGroup({
    [CurrencyFormProp.MoneyFirstInput]: new FormControl(this.defaultMoneyFirst, [
      Validators.required,
      Validators.min(0.000001),
    ]),
    [CurrencyFormProp.MoneySecondInput]: new FormControl(1, [Validators.required, Validators.min(0.000001)]),
    [CurrencyFormProp.CurrencyFirstInput]: new FormControl(this.defaultFirstCountry),
    [CurrencyFormProp.CurrencySecondInput]: new FormControl(this.defaultSecondCountry),
  });

  public swapCurrency() {
    const firstControl = this.form.get(CurrencyFormProp.CurrencyFirstInput);
    const secondControl = this.form.get(CurrencyFormProp.CurrencySecondInput);
    const firstValue = firstControl!.value;
    const secondValue = secondControl!.value;

    firstControl?.patchValue(secondValue);
    secondControl?.patchValue(firstValue);
    this.convertFromToAPI(secondValue!.currency, firstValue!.currency);
  }

  private formValueChangesOn() {
    const moneyFirstControl = this.form.get(CurrencyFormProp.MoneyFirstInput);
    const moneySecondControl = this.form.get(CurrencyFormProp.MoneySecondInput);
    const currencyFirstControl = this.form.get(CurrencyFormProp.CurrencyFirstInput);
    const currencySecondControl = this.form.get(CurrencyFormProp.CurrencySecondInput);

    moneyFirstControl!.valueChanges
      .pipe(
        debounceTime(500),
        takeUntilDestroyed(this.destroyRef),
        tap(value => {
          if (moneyFirstControl!.invalid || !value) return;
          const first = currencyFirstControl!.value!.currency;
          const second = currencySecondControl!.value!.currency;

          this.convertFromToAPI(first, second, value);
        }),
      )
      .subscribe();

    moneySecondControl!.valueChanges
      .pipe(
        debounceTime(500),
        takeUntilDestroyed(this.destroyRef),
        tap(value => {
          if (moneySecondControl!.invalid || !value) return;
          const first = currencyFirstControl!.value!.currency;
          const second = currencySecondControl!.value!.currency;

          this.convertFromToAPI(second, first, value, moneyFirstControl);
        }),
      )
      .subscribe();

    currencyFirstControl!.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(value => {
          if (!value) return;
          const second = currencySecondControl!.value!.currency;

          this.convertFromToAPI(value.currency, second);
        }),
      )
      .subscribe();

    currencySecondControl!.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(value => {
          if (!value) return;
          const first = currencyFirstControl!.value!.currency;

          this.convertFromToAPI(first, value.currency);
        }),
      )
      .subscribe();
  }

  private convertFromToAPI(
    fromCurrency: Currency,
    toCurrency: Currency,
    amount: number = this.form.get(CurrencyFormProp.MoneyFirstInput)!.value ?? this.defaultMoneyFirst,
    moneyInput = this.form.get(CurrencyFormProp.MoneySecondInput),
  ) {
    this.showLoaderSubject$.next(true);
    this.api
      .convertFromTo(fromCurrency, toCurrency, amount)
      .pipe(
        tap(({ convertedAmount, rate }) => {
          this.rateSubject$.next(this.rounding(rate));
          moneyInput!.patchValue(this.rounding(convertedAmount), { emitEvent: false });
        }),
        finalize(() => this.showLoaderSubject$.next(false)),
      )
      .subscribe();
  }

  private rounding(value: string | number): number {
    return Number(Number(value).toFixed(6));
  }

  public readonly disabledItemHandlerFirstInput: TuiBooleanHandler<Country> = ({ currency }) =>
    currency === this.form.get(CurrencyFormProp.CurrencySecondInput)?.value?.currency;

  public readonly disabledItemHandlerSecondInput: TuiBooleanHandler<Country> = ({ currency }) =>
    currency === this.form.get(CurrencyFormProp.CurrencyFirstInput)?.value?.currency;
}
