import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../services/session-store';

export const authGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  const router = inject(Router);
  return session.isValid() && session.role()?.toLowerCase() === 'caseta'
    ? true
    : router.createUrlTree(['/login']);
};
