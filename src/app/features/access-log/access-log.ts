import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AccessListItem, PagedAccessResponse } from '../../core/models/api.models';
import { AuthService } from '../../core/services/auth.service';
import { GateAccessService } from '../../core/services/gate-access.service';
import { AppIcon } from '../../shared/ui/app-icon';

@Component({
  selector: 'app-access-log',
  imports: [ReactiveFormsModule, AppIcon],
  templateUrl: './access-log.html',
  styleUrl: './access-log.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessLog {
  private readonly service = inject(GateAccessService);
  private readonly destroyRef = inject(DestroyRef);
  readonly auth = inject(AuthService);
  readonly data = signal<PagedAccessResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly filtersOpen = signal(false);

  readonly filters = new FormGroup({
    search: new FormControl('', { nonNullable: true }),
    group: new FormControl('', { nonNullable: true }),
    fromTime: new FormControl('', { nonNullable: true }),
    toTime: new FormControl('', { nonNullable: true }),
    sortBy: new FormControl('accessTime', { nonNullable: true }),
    sortDirection: new FormControl<'asc' | 'desc'>('desc', { nonNullable: true }),
  });

  constructor() {
    this.load();
  }

  applyFilters(): void {
    this.page.set(1);
    this.load();
  }

  clearFilters(): void {
    this.filters.reset({
      search: '',
      group: '',
      fromTime: '',
      toTime: '',
      sortBy: 'accessTime',
      sortDirection: 'desc',
    });
    this.page.set(1);
    this.load();
  }

  goToPage(page: number): void {
    if (page < 1 || page > (this.data()?.totalPages ?? 1)) return;
    this.page.set(page);
    this.load();
  }

  changePageSize(event: Event): void {
    this.pageSize.set(Number((event.target as HTMLSelectElement).value));
    this.page.set(1);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const filters = this.filters.getRawValue();
    this.service
      .today({ page: this.page(), pageSize: this.pageSize(), ...filters })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.data.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('No fue posible consultar los accesos del día.');
        },
      });
  }

  formatTime(item: AccessListItem): string {
    return new Intl.DateTimeFormat('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: environment.universityTimeZone,
    }).format(new Date(item.accessTime));
  }
}
