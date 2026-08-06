import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { interval, startWith } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { AppIcon, IconName } from '../../shared/ui/app-icon';
import { ConfirmService } from '../../shared/ui/confirm-dialog';

interface NavItem {
  label: string;
  short: string;
  path: string;
  icon: IconName;
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AppIcon],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirm = inject(ConfirmService);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly clock = signal('');

  readonly navItems: NavItem[] = [
    { label: 'Inicio', short: 'Inicio', path: '/app/inicio', icon: 'home' },
    { label: 'Escanear QR', short: 'Escanear', path: '/app/escanear', icon: 'scan' },
    { label: 'Accesos', short: 'Accesos', path: '/app/accesos', icon: 'history' },
    { label: 'Estadísticas', short: 'Datos', path: '/app/dashboard', icon: 'chart' },
    { label: 'Mi perfil', short: 'Perfil', path: '/app/perfil', icon: 'user' },
  ];

  constructor() {
    if (!this.auth.profile()) {
      this.auth.loadProfile().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
    interval(30_000)
      .pipe(startWith(0), takeUntilDestroyed(this.destroyRef))
      .subscribe(() =>
        this.clock.set(
          new Intl.DateTimeFormat('es-MX', {
            timeZone: environment.universityTimeZone,
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date()),
        ),
      );
  }

  initial(): string {
    return this.auth.profile()?.name?.charAt(0).toUpperCase() ?? 'C';
  }

  async confirmLogout(): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: 'Cerrar sesión',
      message: 'Tendrás que ingresar tus credenciales para volver al portal de casetas.',
      confirmLabel: 'Cerrar sesión',
      tone: 'destructive',
    });
    if (!confirmed) return;
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
