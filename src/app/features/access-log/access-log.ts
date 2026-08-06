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

  /** Hoy en formato ISO local: el <input type="date"> lo usa como tope superior. */
  readonly today = this.localIsoDate(new Date());

  readonly filters = new FormGroup({
    fromDate: new FormControl(this.today, { nonNullable: true }),
    toDate: new FormControl(this.today, { nonNullable: true }),
  });

  /** Mensaje del rango consultado, para que la cabecera no siga diciendo "hoy" sin más. */
  readonly rangeLabel = signal('');

  constructor() {
    this.load();
  }

  applyFilters(): void {
    this.page.set(1);
    this.load();
  }

  clearFilters(): void {
    this.filters.reset({ fromDate: this.today, toDate: this.today });
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

    // Si el rango viene invertido se intercambia antes de consultar, en lugar de pedir
    // al backend un periodo imposible y mostrar una lista vacía sin explicación.
    let { fromDate, toDate } = this.filters.getRawValue();
    if (fromDate && toDate && toDate < fromDate) {
      [fromDate, toDate] = [toDate, fromDate];
      this.filters.setValue({ fromDate, toDate }, { emitEvent: false });
    }

    this.rangeLabel.set(this.describeRange(fromDate, toDate));

    this.service
      .today({ page: this.page(), pageSize: this.pageSize(), fromDate, toDate })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.data.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('No fue posible consultar los accesos de estas fechas.');
        },
      });
  }

  /** "6 de agosto de 2026" o "del 1 al 6 de agosto de 2026". */
  private describeRange(fromDate: string, toDate: string): string {
    if (!fromDate && !toDate) return 'Hoy';
    const desde = fromDate || toDate;
    const hasta = toDate || fromDate;
    return desde === hasta
      ? this.formatDate(desde)
      : `${this.formatDate(desde)} — ${this.formatDate(hasta)}`;
  }

  private formatDate(iso: string): string {
    // Se construye con partes locales: `new Date('2026-08-06')` se interpreta en UTC y
    // en México retrocede al día anterior.
    const [year, month, day] = iso.split('-').map(Number);
    if (!year || !month || !day) return iso;
    return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
      .format(new Date(year, month - 1, day));
  }

  private localIsoDate(date: Date): string {
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
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

  /**
   * Día del registro, solo cuando el rango abarca más de una fecha: con un único día
   * la columna repetiría el mismo valor en todas las filas.
   */
  formatDay(item: AccessListItem): string | null {
    if (!this.isMultiDay()) return null;
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: '2-digit',
      timeZone: environment.universityTimeZone,
    }).format(new Date(item.accessTime));
  }

  isMultiDay(): boolean {
    const { fromDate, toDate } = this.filters.getRawValue();
    return !!fromDate && !!toDate && fromDate !== toDate;
  }
}
