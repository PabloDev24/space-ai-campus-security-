export interface ApiUser {
  id: string;
  name: string;
  email: string;
  folio: string | null;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: ApiUser;
}

export interface Gate {
  id: string;
  name: string;
  code: string;
  location: string;
  status: string;
}

export interface GateProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastAccess: string | null;
  mustChangePassword: boolean;
  gate: Gate | null;
}

export interface GateAccess {
  id: string;
  studentId: string;
  studentNumber: string;
  fullName: string;
  group: string | null;
  gateName: string;
  guardName: string;
  accessTime: string;
  status: string;
  code: string;
}

export interface GateScanResult {
  success: boolean;
  status: 'authorized' | 'denied' | 'duplicate' | 'pending';
  code: string;
  message: string;
  access: GateAccess | null;
}

export interface AccessListItem {
  id: string;
  studentNumber: string;
  fullName: string;
  group: string | null;
  accessTime: string;
  gateName: string;
  guardName: string;
  status: string;
  code: string;
}

export interface PagedAccessResponse {
  items: AccessListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  localDate: string;
  timeZone: string;
}

export interface HomeSummary {
  accessesToday: number;
  accessesLastHour: number;
  deniedToday: number;
  serverTimeUtc: string;
  timeZone: string;
}

export interface DashboardPoint {
  label: string;
  value: number;
}

export interface DashboardHourPoint {
  hour: number;
  count: number;
}

export interface DashboardDayPoint {
  date: string;
  count: number;
}

export interface GateDashboard {
  from: string;
  to: string;
  timeZone: string;
  generatedAtUtc: string;
  rangeTotal: number;
  totalToday: number;
  totalWeek: number;
  averageDaily: number;
  busiestHour: number | null;
  busiestDay: string | null;
  dayComparisonPercent: number;
  weekComparisonPercent: number;
  periodComparisonPercent: number;
  trend: 'up' | 'down' | 'stable';
  byHour: DashboardHourPoint[];
  byDay: DashboardDayPoint[];
  byWeekday: DashboardPoint[];
  byGate: DashboardPoint[];
  byGroup: DashboardPoint[];
}
