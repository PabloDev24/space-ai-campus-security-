import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TimeoutError, catchError, throwError, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../shared/ui/toast';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(request).pipe(
    timeout(environment.requestTimeoutMs),
    catchError((error: unknown) => {
      const isLogin = request.url.includes('/gate-auth/login');
      if (error instanceof HttpErrorResponse && error.status === 401 && !isLogin) {
        auth.logout();
        void router.navigate(['/login'], { queryParams: { reason: 'expired' } });
        toast.show('Tu sesión expiró. Inicia sesión nuevamente.', 'danger');
      } else if (error instanceof TimeoutError) {
        toast.show('El servidor tardó demasiado en responder.', 'danger');
      } else if (error instanceof HttpErrorResponse && error.status === 0) {
        toast.show('Sin conexión con SpaceIA. Revisa tu red.', 'danger');
      }
      return throwError(() => error);
    }),
  );
};
