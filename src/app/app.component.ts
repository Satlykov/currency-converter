import { NgDompurifySanitizer } from '@tinkoff/ng-dompurify';
import { TuiRootModule, TuiAlertModule, TUI_SANITIZER, TuiLoaderModule } from '@taiga-ui/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CurrencyFormComponent } from './components/currency-form/currency-form.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TuiRootModule, TuiAlertModule, CurrencyFormComponent, TuiLoaderModule, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: TUI_SANITIZER, useClass: NgDompurifySanitizer }],
})
export class AppComponent {
  public title = 'currency-converter';
  public showLoader = false;

  public onShowLoader(showLoader: boolean): void {
    this.showLoader = showLoader;
  }
}
