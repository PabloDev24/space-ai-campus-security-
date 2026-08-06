import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing').then((m) => m.Landing),
    canActivate: [guestGuard],
    title: 'SpaceIA Casetas',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login').then((m) => m.Login),
    canActivate: [guestGuard],
    title: 'Iniciar sesión | SpaceIA Casetas',
  },
  {
    path: 'app',
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
        title: 'Inicio | SpaceIA Casetas',
      },
      {
        path: 'escanear',
        loadComponent: () => import('./features/qr-scanner/qr-scanner').then((m) => m.QrScanner),
        title: 'Escanear QR | SpaceIA Casetas',
      },
      {
        path: 'accesos',
        loadComponent: () => import('./features/access-log/access-log').then((m) => m.AccessLog),
        title: 'Accesos | SpaceIA Casetas',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
        title: 'Dashboard | SpaceIA Casetas',
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
        title: 'Mi perfil | SpaceIA Casetas',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
