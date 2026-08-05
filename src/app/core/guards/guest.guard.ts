import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../services/session-store';

export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  return session.isValid() && session.role()?.toLowerCase() === 'caseta'
    ? inject(Router).createUrlTree(['/app/inicio'])
    : true;
};
