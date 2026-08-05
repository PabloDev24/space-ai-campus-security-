import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { AppIcon } from '../../shared/ui/app-icon';
import { ToastService } from '../../shared/ui/toast';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, AppIcon],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  readonly profile = this.authService.profile;
  readonly hideCurrent = signal(true);
  readonly hideNew = signal(true);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10), Validators.maxLength(128)],
    }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly passwordValue = toSignal(this.form.controls.newPassword.valueChanges, {
    initialValue: '',
  });

  readonly rules = [
    { key: 'length', label: '10 caracteres', test: (value: string) => value.length >= 10 },
    { key: 'upper', label: 'Una mayúscula', test: (value: string) => /[A-Z]/.test(value) },
    { key: 'lower', label: 'Una minúscula', test: (value: string) => /[a-z]/.test(value) },
    { key: 'number', label: 'Un número', test: (value: string) => /[0-9]/.test(value) },
    { key: 'symbol', label: 'Un símbolo', test: (value: string) => /[^a-zA-Z0-9]/.test(value) },
  ];

  constructor() {
    if (!this.profile()) {
      this.authService.loadProfile().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
  }

  meets(rule: (value: string) => boolean): boolean {
    return rule(this.passwordValue());
  }

  changePassword(): void {
    const value = this.form.getRawValue();
    const strong = this.rules.every((rule) => rule.test(value.newPassword));
    if (this.form.invalid || value.newPassword !== value.confirmPassword || !strong || this.submitting()) {
      this.form.markAllAsTouched();
      this.error.set(
        value.newPassword !== value.confirmPassword
          ? 'La confirmación no coincide con la nueva contraseña.'
          : 'La nueva contraseña no cumple todos los requisitos.',
      );
      return;
    }
    this.error.set(null);
    this.submitting.set(true);
    this.authService
      .changePassword(value.currentPassword, value.newPassword)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show('Contraseña actualizada. Inicia sesión nuevamente.', 'success');
          this.authService.logout();
          void this.router.navigate(['/login'], { queryParams: { reason: 'passwordChanged' } });
        },
        error: (error: unknown) => {
          this.submitting.set(false);
          this.error.set(this.readError(error));
        },
      });
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return 'Sin registro';
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: environment.universityTimeZone,
    }).format(new Date(value));
  }

  private readError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.detail ?? error.error?.error ?? 'No fue posible cambiar la contraseña.';
    }
    return 'No fue posible cambiar la contraseña.';
  }
}
