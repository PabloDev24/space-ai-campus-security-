import { ChangeDetectionStrategy, Component, Injectable, inject, signal } from '@angular/core';
import { AppIcon } from './app-icon';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  tone?: 'primary' | 'destructive';
}

interface PendingConfirm extends ConfirmRequest {
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly pending = signal<PendingConfirm | null>(null);
  readonly current = this.pending.asReadonly();

  ask(request: ConfirmRequest): Promise<boolean> {
    return new Promise((resolve) => this.pending.set({ ...request, resolve }));
  }

  answer(value: boolean): void {
    const pending = this.pending();
    if (!pending) return;
    this.pending.set(null);
    pending.resolve(value);
  }
}

@Component({
  selector: 'app-confirm-host',
  imports: [AppIcon],
  template: `
    @if (service.current(); as request) {
      <button
        class="backdrop"
        type="button"
        aria-label="Cancelar y cerrar"
        (click)="service.answer(false)"
      ></button>
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div class="dialog__head">
          <span class="ui-icon-chip" [class.ui-icon-chip--danger]="request.tone === 'destructive'">
            <app-icon [name]="request.tone === 'destructive' ? 'alert' : 'shield'" />
          </span>
          <h2 id="confirm-title">{{ request.title }}</h2>
        </div>
        <p>{{ request.message }}</p>
        <div class="dialog__actions">
          <button class="ui-btn ui-btn--outline" type="button" (click)="service.answer(false)">
            Cancelar
          </button>
          <button
            class="ui-btn"
            [class.ui-btn--destructive]="request.tone === 'destructive'"
            type="button"
            (click)="service.answer(true)"
          >
            {{ request.confirmLabel }}
          </button>
        </div>
      </div>
    }
  `,
  styles: `
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 100;
      width: 100%;
      border: none;
      background: oklch(0.2 0.02 221.7 / 45%);
      backdrop-filter: blur(2px);
    }
    .dialog {
      position: fixed;
      z-index: 101;
      top: 50%;
      left: 50%;
      display: flex;
      flex-direction: column;
      gap: 14px;
      width: min(420px, calc(100vw - 32px));
      padding: 20px;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-lg);
      transform: translate(-50%, -50%);
      animation: dialog-in 0.16s ease-out;
    }
    .dialog__head {
      display: flex;
      align-items: center;
      gap: 11px;
    }
    .dialog__head h2 {
      font-size: 1rem;
    }
    .dialog p {
      color: var(--muted-foreground);
      font-size: 0.8125rem;
    }
    .dialog__actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    @keyframes dialog-in {
      from {
        opacity: 0;
        transform: translate(-50%, calc(-50% + 8px));
      }
    }
    @media (min-width: 480px) {
      .dialog__actions {
        display: flex;
        justify-content: flex-end;
      }
    }
  `,
  host: { '(document:keydown.escape)': 'onEscape()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmHost {
  readonly service = inject(ConfirmService);

  onEscape(): void {
    if (this.service.current()) this.service.answer(false);
  }
}
