import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, switchMap, tap } from 'rxjs';
import { GateProfile, LoginResponse } from '../models/api.models';
import { ApiClient } from './api-client';
import { SessionStore } from './session-store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClient);
  private readonly session = inject(SessionStore);
  private readonly profileState = signal<GateProfile | null>(null);
  private readonly loadingState = signal(false);

  readonly profile = this.profileState.asReadonly();
  readonly loading = this.loadingState.asReadonly();

  login(email: string, password: string): Observable<GateProfile> {
    this.loadingState.set(true);
    return this.api
      .post<LoginResponse>('gate-auth/login', { email, password })
      .pipe(
        tap((response) => this.session.setToken(response.accessToken)),
        switchMap(() => this.loadProfile()),
        finalize(() => this.loadingState.set(false)),
      );
  }

  loadProfile(): Observable<GateProfile> {
    return this.api
      .get<GateProfile>('gate-auth/me')
      .pipe(tap((profile) => this.profileState.set(profile)));
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.api.post<void>('gate-auth/change-password', { currentPassword, newPassword });
  }

  logout(): void {
    this.session.clear();
    this.profileState.set(null);
  }
}
