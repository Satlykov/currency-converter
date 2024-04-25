import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  TuiButtonModule,
  TuiFlagPipeModule,
  TuiFormatNumberPipeModule,
  TuiGroupModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/core';
import { TuiDataListWrapperModule, TuiInputNumberModule, TuiSelectModule } from '@taiga-ui/kit';
import { TuiCurrencyPipeModule } from '@taiga-ui/addon-commerce';
import { CurrencyFormProp, rateForOne, rateForSome } from '../../const/currency';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyFormControllerService } from '../../services/currency-form-controller.service';
import { CurrencyApiService } from '../../services/currency-api.service';
import { AsyncPipe } from '@angular/common';

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
    TuiFormatNumberPipeModule,
    AsyncPipe,
  ],
  templateUrl: './currency-form.component.html',
  styleUrl: './currency-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencyFormControllerService, CurrencyApiService],
})
export class CurrencyFormComponent implements OnInit {
  public destroyRef = inject(DestroyRef);
  public readonly CurrencyFormProp = CurrencyFormProp;
  public readonly Infinity = Infinity;
  public readonly rateForOne = rateForOne;
  public readonly rateForSome = rateForSome;

  public form = this.controller.form;
  public countries = this.controller.countries;
  public disabledItemHandlerFirstInput = this.controller.disabledItemHandlerFirstInput;
  public disabledItemHandlerSecondInput = this.controller.disabledItemHandlerSecondInput;
  public rate: number = 1;

  @Output() showLoader = new EventEmitter<boolean>();

  constructor(private controller: CurrencyFormControllerService) {}

  public ngOnInit() {
    this.controller.showLoader$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(value => this.showLoader.emit(value)),
      )
      .subscribe();

    this.controller.rate$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(value => (this.rate = value)),
      )
      .subscribe();
  }

  public onSwapCurrency() {
    this.controller.swapCurrency();
  }
}
