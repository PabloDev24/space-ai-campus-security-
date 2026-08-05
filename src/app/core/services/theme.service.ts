import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'spaceia.caseta.theme';
  private readonly initial = this.resolveInitial();
  private readonly modeState = signal<ThemeMode>(this.initial);
  readonly mode = this.modeState.asReadonly();

  constructor() { this.apply(this.initial); }

  toggle(): void {
    const next = this.modeState() === 'dark' ? 'light' : 'dark';
    localStorage.setItem(this.storageKey, next);
    this.modeState.set(next);
    this.apply(next);
  }

  private resolveInitial(): ThemeMode {
    const stored = localStorage.getItem(this.storageKey);
    if (stored === 'dark' || stored === 'light') return stored;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private apply(mode: ThemeMode): void {
    this.document.documentElement.dataset['theme'] = mode;
  }
}
