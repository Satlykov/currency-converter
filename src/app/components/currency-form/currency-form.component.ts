import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButtonModule, TuiFlagPipeModule, TuiGroupModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { TuiDataListWrapperModule, TuiInputNumberModule, TuiSelectModule } from '@taiga-ui/kit';
import { TuiCurrencyPipeModule } from '@taiga-ui/addon-commerce';
import { TuiCountryIsoCode } from '@taiga-ui/i18n';
import { CurrencyFormProp } from '../../const/currency-form-prop';
import { CurrencyApiService } from '../../services/currency-api.service';
import { debounceTime, finalize, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Country, Currency } from '../../models/currency-and-countries';
import { TuiBooleanHandler } from '@taiga-ui/cdk';

@Component({
  selector: 'app-currency-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TuiGroupModule,
    TuiSelectModule,
    TuiInputNumberModule,
    TuiTextfieldControllerModule,
    TuiCurrencyPipeModule,
    TuiDataListWrapperModule,
    TuiFlagPipeModule,
    TuiButtonModule,
  ],
  templateUrl: './currency-form.component.html',
  styleUrl: './currency-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencyApiService],
})
export class CurrencyFormComponent implements OnInit {
  public destroyRef = inject(DestroyRef);
  @Output() showLoader = new EventEmitter<boolean>();

  public readonly CurrencyFormProp = CurrencyFormProp;
  public readonly Infinity = Infinity;

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

  constructor(private readonly api: CurrencyApiService) {}

  public ngOnInit() {
    this.convertFromToAPI(this.defaultFirstCountry.currency, this.defaultSecondCountry.currency);
    this.form
      .get(CurrencyFormProp.MoneyFirstInput)!
      .valueChanges.pipe(
        debounceTime(500),
        takeUntilDestroyed(this.destroyRef),
        tap(value => {
          if (this.form.get(CurrencyFormProp.MoneyFirstInput)!.invalid || !value) return;
          const first = this.form.get(CurrencyFormProp.CurrencyFirstInput)!.value!.currency;
          const second = this.form.get(CurrencyFormProp.CurrencySecondInput)!.value!.currency;

          this.convertFromToAPI(first, second, value);
        }),
      )
      .subscribe();

    this.form
      .get(CurrencyFormProp.MoneySecondInput)!
      .valueChanges.pipe(
        debounceTime(500),
        takeUntilDestroyed(this.destroyRef),
        tap(value => {
          if (this.form.get(CurrencyFormProp.MoneySecondInput)!.invalid || !value) return;
          const first = this.form.get(CurrencyFormProp.CurrencyFirstInput)!.value!.currency;
          const second = this.form.get(CurrencyFormProp.CurrencySecondInput)!.value!.currency;

          this.convertFromToAPI(second, first, value, this.form.get(CurrencyFormProp.MoneyFirstInput));
        }),
      )
      .subscribe();

    this.form
      .get(CurrencyFormProp.CurrencyFirstInput)!
      .valueChanges.pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(value => {
          if (!value) return;
          const second = this.form.get(CurrencyFormProp.CurrencySecondInput)!.value!.currency;

          this.convertFromToAPI(value.currency, second);
        }),
      )
      .subscribe();

    this.form
      .get(CurrencyFormProp.CurrencySecondInput)!
      .valueChanges.pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(value => {
          if (!value) return;
          const first = this.form.get(CurrencyFormProp.CurrencyFirstInput)!.value!.currency;

          this.convertFromToAPI(first, value.currency);
        }),
      )
      .subscribe();
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

  public onSwapCurrency() {
    const firstControl = this.form.get(CurrencyFormProp.CurrencyFirstInput);
    const secondControl = this.form.get(CurrencyFormProp.CurrencySecondInput);
    const firstValue = firstControl!.value;
    const secondValue = secondControl!.value;

    firstControl?.patchValue(secondValue);
    secondControl?.patchValue(firstValue);
    this.convertFromToAPI(secondValue!.currency, firstValue!.currency);
  }

  private convertFromToAPI(
    fromCurrency: Currency,
    toCurrency: Currency,
    amount: number = this.form.get(CurrencyFormProp.MoneyFirstInput)!.value ?? this.defaultMoneyFirst,
    moneyInput = this.form.get(CurrencyFormProp.MoneySecondInput),
  ) {
    this.showLoader.emit(true);
    this.api
      .convertFromTo(fromCurrency, toCurrency, amount)
      .pipe(
        tap(({ convertedAmount }) => {
          moneyInput!.patchValue(this.rounding(convertedAmount), { emitEvent: false });
        }),
        finalize(() => this.showLoader.emit(false)),
      )
      .subscribe();
  }

  private rounding(value: string | number): number {
    return Number(Number(value).toFixed(6));
  }

  readonly disabledItemHandlerFirstInput: TuiBooleanHandler<Country> = ({ currency }) =>
    currency === this.form.get(CurrencyFormProp.CurrencySecondInput)?.value?.currency;

  readonly disabledItemHandlerSecondInput: TuiBooleanHandler<Country> = ({ currency }) =>
    currency === this.form.get(CurrencyFormProp.CurrencyFirstInput)?.value?.currency;
}
