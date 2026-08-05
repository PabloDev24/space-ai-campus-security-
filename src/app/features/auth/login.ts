import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { AppIcon } from '../../shared/ui/app-icon';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, AppIcon],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly theme = inject(ThemeService);
  readonly hidePassword = signal(true);
  readonly notice = signal<string | null>(
    this.initialMessage(inject(ActivatedRoute).snapshot.queryParamMap.get('reason')),
  );
  readonly errorMessage = signal<string | null>(null);
  readonly submitting = signal(false);

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    this.errorMessage.set(null);
    this.notice.set(null);
    this.submitting.set(true);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email.trim(), password).subscribe({
      next: () => void this.router.navigate(['/app/inicio']),
      error: (error: unknown) => {
        this.submitting.set(false);
        this.errorMessage.set(this.readError(error));
      },
    });
  }

  private readError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return (
        error.error?.error ??
        error.error?.detail ??
        (error.status === 0
          ? 'No fue posible conectar con SpaceIA.'
          : 'Credenciales incorrectas o cuenta no autorizada.')
      );
    }
    return 'No fue posible iniciar sesión.';
  }

  private initialMessage(reason: string | null): string | null {
    if (reason === 'expired') return 'Tu sesión terminó. Inicia sesión nuevamente.';
    if (reason === 'passwordChanged') {
      return 'Contraseña actualizada. Inicia sesión con tus nuevas credenciales.';
    }
    return null;
  }
}
