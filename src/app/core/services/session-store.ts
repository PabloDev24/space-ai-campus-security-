import { Injectable, computed, signal } from '@angular/core';

interface JwtPayload {
  exp?: number;
  sub?: string;
  email?: string;
  name?: string;
  role?: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
}

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly storageKey = 'spaceia.caseta.accessToken';
  private readonly tokenState = signal<string | null>(sessionStorage.getItem(this.storageKey));

  readonly token = this.tokenState.asReadonly();
  readonly payload = computed(() => this.decode(this.tokenState()));
  readonly role = computed(
    () =>
      this.payload()?.role ??
      this.payload()?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
      null,
  );
  readonly isValid = computed(() => {
    const exp = this.payload()?.exp;
    return !!this.tokenState() && !!exp && exp * 1000 > Date.now();
  });

  setToken(token: string): void {
    sessionStorage.setItem(this.storageKey, token);
    this.tokenState.set(token);
  }

  clear(): void {
    sessionStorage.removeItem(this.storageKey);
    this.tokenState.set(null);
  }

  private decode(token: string | null): JwtPayload | null {
    if (!token) return null;
    try {
      const part = token.split('.')[1];
      const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const decoded = atob(padded);
      const bytes = Uint8Array.from(decoded, (character) => character.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes)) as JwtPayload;
    } catch {
      return null;
    }
  }
}
