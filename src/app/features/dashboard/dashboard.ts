import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { environment } from '../../../environments/environment';
import { GateDashboard } from '../../core/models/api.models';
import { ThemeService } from '../../core/services/theme.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { AppIcon } from '../../shared/ui/app-icon';

type Period = 'today' | '7d' | '30d';
type ChartView = 'day' | 'hour';

interface Insight {
  showWeekday: boolean;
  weekdayLabel: string;
  weekdayCount: number;
  hourLabel: string;
  hourCount: number;
  dayLabel: string;
  dayCount: number;
}

/* Chart.js pinta sobre canvas, así que no puede leer las variables CSS del tema.
   Estos valores son el equivalente sRGB de --primary en claro y oscuro. */
const PALETTE = {
  light: { bar: '#0e8fb0', barMuted: '#bcd9e2', tick: '#6b7f86', grid: 'rgba(107,127,134,.16)' },
  dark: { bar: '#3fd0ee', barMuted: '#2b4d58', tick: '#93a7ae', grid: 'rgba(147,167,174,.16)' },
} as const;

const WEEKDAY_PLURAL: Record<string, string> = {
  Lunes: 'los lunes',
  Martes: 'los martes',
  Miércoles: 'los miércoles',
  Jueves: 'los jueves',
  Viernes: 'los viernes',
  Sábado: 'los sábados',
  Domingo: 'los domingos',
};

@Component({
  selector: 'app-dashboard',
  imports: [BaseChartDirective, AppIcon],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly service = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly theme = inject(ThemeService);

  readonly data = signal<GateDashboard | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly period = signal<Period>('7d');
  readonly view = signal<ChartView>('day');

  readonly periods: { id: Period; label: string }[] = [
    { id: 'today', label: 'Hoy' },
    { id: '7d', label: '7 días' },
    { id: '30d', label: '30 días' },
  ];

  private readonly palette = computed(() =>
    this.theme.mode() === 'dark' ? PALETTE.dark : PALETTE.light,
  );

  readonly insight = computed<Insight | null>(() => {
    const dashboard = this.data();
    if (!dashboard || dashboard.rangeTotal === 0) return null;

    const weekday = [...dashboard.byWeekday].sort((a, b) => b.value - a.value)[0];
    const hour = [...dashboard.byHour].sort((a, b) => b.count - a.count)[0];
    const day = [...dashboard.byDay].sort((a, b) => b.count - a.count)[0];
    if (!weekday || !hour || !day) return null;

    return {
      // Con una semana o menos cada día de la semana aparece una sola vez:
      // hablar de "los lunes" repetiría el dato del día pico.
      showWeekday: dashboard.byDay.length > 7,
      weekdayLabel: WEEKDAY_PLURAL[weekday.label] ?? weekday.label.toLowerCase(),
      weekdayCount: weekday.value,
      hourLabel: this.hourLabel(hour.hour),
      hourCount: hour.count,
      dayLabel: this.longDate(day.date),
      dayCount: day.count,
    };
  });

  readonly chartData = computed<ChartData<'bar'>>(() => {
    const dashboard = this.data();
    const colors = this.palette();
    const isDay = this.view() === 'day';

    const labels = isDay
      ? (dashboard?.byDay.map((point) => this.shortDate(point.date)) ?? [])
      : (dashboard?.byHour.map((point) => this.hourLabel(point.hour)) ?? []);
    const values = isDay
      ? (dashboard?.byDay.map((point) => point.count) ?? [])
      : (dashboard?.byHour.map((point) => point.count) ?? []);
    const max = Math.max(...values, 0);

    return {
      labels,
      datasets: [
        {
          label: 'Accesos',
          data: values,
          // El pico se resalta para responder de un vistazo "¿cuál fue el día/hora con más accesos?".
          backgroundColor: values.map((value) =>
            value === max && max > 0 ? colors.bar : colors.barMuted,
          ),
          hoverBackgroundColor: colors.bar,
          borderRadius: 6,
          maxBarThickness: 46,
        },
      ],
    };
  });

  readonly chartOptions = computed<ChartOptions<'bar'>>(() => {
    const colors = this.palette();
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 320 },
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (context) => `${context.parsed.y} accesos`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: colors.tick, maxRotation: 0, autoSkipPadding: 12 },
        },
        y: {
          beginAtZero: true,
          border: { display: false },
          grid: { color: colors.grid },
          ticks: { color: colors.tick, precision: 0, maxTicksLimit: 6 },
        },
      },
    };
  });

  constructor() {
    this.load();
  }

  setPeriod(period: Period): void {
    if (this.period() === period) return;
    this.period.set(period);
    // Con un solo día el desglose diario no aporta nada: se muestra por hora.
    this.view.set(period === 'today' ? 'hour' : 'day');
    this.load();
  }

  setView(view: ChartView): void {
    this.view.set(view);
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service
      .overview(this.period())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.data.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('No fue posible cargar las estadísticas de accesos.');
        },
      });
  }

  hourLabel(hour: number): string {
    return `${String(hour).padStart(2, '0')}:00`;
  }

  shortDate(value: string): string {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      timeZone: 'UTC',
    }).format(new Date(`${value}T00:00:00Z`));
  }

  longDate(value: string): string {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    }).format(new Date(`${value}T00:00:00Z`));
  }

  rangeLabel(): string {
    const dashboard = this.data();
    if (!dashboard) return '';
    return dashboard.from === dashboard.to
      ? this.longDate(dashboard.from)
      : `${this.shortDate(dashboard.from)} — ${this.shortDate(dashboard.to)}`;
  }

  timeZone(): string {
    return this.data()?.timeZone ?? environment.universityTimeZone;
  }
}
