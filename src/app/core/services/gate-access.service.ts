import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AccessListItem,
  GateScanResult,
  HomeSummary,
  PagedAccessResponse,
} from '../models/api.models';
import { ApiClient } from './api-client';

export interface AccessFilters {
  page: number;
  pageSize: number;
  /** Fechas en formato ISO (yyyy-MM-dd). Sin ellas el backend devuelve el día en curso. */
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class GateAccessService {
  private readonly api = inject(ApiClient);

  scan(qrToken: string): Observable<GateScanResult> {
    return this.api.post<GateScanResult>('gate-access/scan', { qrToken });
  }

  preview(qrToken: string): Observable<GateScanResult> {
    return this.api.post<GateScanResult>('gate-access/preview', { qrToken });
  }

  decide(qrToken: string, authorize: boolean): Observable<GateScanResult> {
    return this.api.post<GateScanResult>('gate-access/decision', { qrToken, authorize });
  }

  today(filters: AccessFilters): Observable<PagedAccessResponse> {
    let params = new HttpParams()
      .set('page', filters.page)
      .set('pageSize', filters.pageSize)
      .set('sortBy', filters.sortBy ?? 'accessTime')
      .set('sortDirection', filters.sortDirection ?? 'desc');
    for (const key of ['fromDate', 'toDate'] as const) {
      if (filters[key]) params = params.set(key, filters[key]);
    }
    return this.api.get<PagedAccessResponse>('gate-access/today', params);
  }

  recent(limit = 5): Observable<AccessListItem[]> {
    return this.api.get<AccessListItem[]>(
      'gate-access/recent',
      new HttpParams().set('limit', limit),
    );
  }

  summary(): Observable<HomeSummary> {
    return this.api.get<HomeSummary>('gate-access/summary');
  }
}
