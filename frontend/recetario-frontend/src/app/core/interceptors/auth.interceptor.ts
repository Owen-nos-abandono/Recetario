import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getAccessToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el access token expiró, intentamos refrescarlo una vez
      if (error.status === 401 && auth.getRefreshToken() && !req.url.includes('/auth/refresh')) {
        return auth.refreshToken().pipe(
          switchMap(() => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${auth.getAccessToken()}` },
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            auth.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }

      if (error.status === 401) {
        auth.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
