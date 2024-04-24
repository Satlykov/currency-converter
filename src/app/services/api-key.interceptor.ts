import { HttpInterceptorFn } from '@angular/common/http';
import { environmentExample } from '../../environments/environment.example';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const apiKey = environmentExample.API_KEY;

  const cloneReq = req.clone({ setParams: { apikey: apiKey } });
  return next(cloneReq);
};
