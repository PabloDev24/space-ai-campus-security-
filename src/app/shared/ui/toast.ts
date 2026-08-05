import { ChangeDetectionStrategy, Component, Injectable, inject, signal } from '@angular/core';
import { AppIcon, IconName } from './app-icon';

export type ToastTone = 'info' | 'success' | 'danger';

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

const ICON_BY_TONE: Record<ToastTone, IconName> = {
  info: 'info',
  success: 'check',
  danger: 'alert',
};

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly items = signal<Toast[]>([]);
  readonly toasts = this.items.asReadonly();

  show(message: string, tone: ToastTone = 'info', durationMs = 4500): void {
    const id = ++this.nextId;
    this.items.update((current) => [...current, { id, message, tone }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  dismiss(id: number): void {
    this.items.update((current) => current.filter((toast) => toast.id !== id));
  }
}

@Component({
  selector: 'app-toast-host',
  imports: [AppIcon],
  template: `
    <div class="toast-stack" role="status" aria-live="polite">
      @for (toast of service.toasts(); track toast.id) {
        <div class="toast" [class]="'toast--' + toast.tone">
          <app-icon [name]="iconFor(toast.tone)" />
          <span>{{ toast.message }}</span>
          <button type="button" (click)="service.dismiss(toast.id)" aria-label="Cerrar aviso">
            <app-icon name="close" />
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-stack {
      position: fixed;
      z-index: 90;
      top: calc(var(--topbar-height) + 12px);
      right: 16px;
      left: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-end;
      pointer-events: none;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      width: min(100%, 380px);
      padding: 11px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--card);
      color: var(--foreground);
      box-shadow: var(--shadow-lg);
      font-size: 0.8125rem;
      pointer-events: auto;
      animation: toast-in 0.18s ease-out;
    }
    .toast span {
      flex: 1;
      min-width: 0;
    }
    .toast button {
      display: grid;
      place-items: center;
      width: 26px;
      height: 26px;
      border: none;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--muted-foreground);
    }
    .toast button:hover {
      background: var(--accent);
    }
    .toast--success app-icon:first-child {
      color: var(--success);
    }
    .toast--danger app-icon:first-child {
      color: var(--destructive);
    }
    .toast--info app-icon:first-child {
      color: var(--primary);
    }
    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
    }
    @media (min-width: 640px) {
      .toast-stack {
        left: auto;
        top: 16px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastHost {
  readonly service = inject(ToastService);
  iconFor(tone: ToastTone): IconName {
    return ICON_BY_TONE[tone];
  }
}
