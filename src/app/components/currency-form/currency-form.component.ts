import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TuiFlagPipeModule, TuiGroupModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { TuiDataListWrapperModule, TuiInputNumberModule, TuiSelectModule } from '@taiga-ui/kit';
import { TuiCurrencyPipeModule } from '@taiga-ui/addon-commerce';
import { Countries, Currency } from '../../models/currency-and-countries';
import { TuiCountryIsoCode } from '@taiga-ui/i18n';

class Country {
  constructor(
    readonly name: Countries,
    readonly currency: Currency,
    readonly flag: TuiCountryIsoCode,
  ) {}
}

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
  ],
  templateUrl: './currency-form.component.html',
  styleUrl: './currency-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyFormComponent {
  public countries = [
    new Country('USA', 'USD', TuiCountryIsoCode.US),
    new Country('UK', 'GBP', TuiCountryIsoCode.GB),
    new Country('Uzbekistan', 'UZS', TuiCountryIsoCode.UZ),
    new Country('Russia', 'RUB', TuiCountryIsoCode.RU),
    new Country('Kazakhstan', 'KZT', TuiCountryIsoCode.KZ),
  ];

  public form = new FormGroup({
    money: new FormControl('1'),
    currency: new FormControl(this.countries[0]),
  });
}
