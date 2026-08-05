import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { GateDashboard } from '../models/api.models';
import { ApiClient } from './api-client';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiClient);

  overview(period: string, from?: string, to?: string, group?: string): Observable<GateDashboard> {
    let params = new HttpParams().set('period', period);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    if (group) params = params.set('group', group);
    return this.api.get<GateDashboard>('gate-dashboard/overview', params);
  }
}
