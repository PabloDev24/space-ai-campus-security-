import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HomeSummary, PagedAccessResponse } from '../../core/models/api.models';
import { AuthService } from '../../core/services/auth.service';
import { GateAccessService } from '../../core/services/gate-access.service';
import { AppIcon } from '../../shared/ui/app-icon';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-home',
  imports: [RouterLink, AppIcon],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly accessService = inject(GateAccessService);
  private readonly destroyRef = inject(DestroyRef);
  readonly auth = inject(AuthService);
  readonly summary = signal<HomeSummary | null>(null);
  readonly accesses = signal<PagedAccessResponse | null>(null);
  readonly loading = signal(true);
  readonly online = signal(false);
  readonly error = signal<string | null>(null);
  readonly page = signal(1);
  readonly pageSize = PAGE_SIZE;

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      summary: this.accessService.summary(),
      accesses: this.accessService.today({ page: this.page(), pageSize: PAGE_SIZE }),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ summary, accesses }) => {
          this.summary.set(summary);
          this.accesses.set(accesses);
          this.online.set(true);
          this.loading.set(false);
        },
        error: () => {
          this.online.set(false);
          this.loading.set(false);
          this.error.set('No fue posible cargar la operación de la caseta.');
        },
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > (this.accesses()?.totalPages ?? 1)) return;
    this.page.set(page);
    this.load();
  }

  firstName(): string {
    return this.auth.profile()?.name?.split(' ')[0] ?? 'guardia';
  }

  formatTime(value: string): string {
    return new Intl.DateTimeFormat('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: environment.universityTimeZone,
    }).format(new Date(value));
  }
}
