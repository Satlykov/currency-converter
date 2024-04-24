import { provideAnimations } from "@angular/platform-browser/animations";
import { TuiRootModule } from "@taiga-ui/core";
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiKeyInterceptor } from './services/api-key.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideAnimations(), provideRouter(routes), provideHttpClient(withInterceptors([apiKeyInterceptor])), importProvidersFrom(TuiRootModule)],
};
