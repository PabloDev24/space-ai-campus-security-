import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideCalendarDays,
  lucideCamera,
  lucideChartNoAxesColumn,
  lucideCheck,
  lucideChevronDown,
  lucideChevronLeft,
  lucideChevronRight,
  lucideClock,
  lucideDoorOpen,
  lucideEye,
  lucideEyeOff,
  lucideFunnel,
  lucideHistory,
  lucideHouse,
  lucideInfo,
  lucideKeyRound,
  lucideLockKeyhole,
  lucideLogOut,
  lucideMapPin,
  lucideMenu,
  lucideMoon,
  lucideRefreshCw,
  lucideScanQrCode,
  lucideSearch,
  lucideShieldCheck,
  lucideSun,
  lucideSwitchCamera,
  lucideTrendingDown,
  lucideTrendingUp,
  lucideTriangleAlert,
  lucideUserRound,
  lucideUsers,
  lucideVolume2,
  lucideVolumeX,
  lucideWifi,
  lucideX,
} from '@ng-icons/lucide';

export type IconName =
  | 'activity'
  | 'alert'
  | 'arrow'
  | 'arrow-left'
  | 'calendar'
  | 'camera'
  | 'chart'
  | 'check'
  | 'chevron-down'
  | 'clock'
  | 'close'
  | 'eye'
  | 'eye-off'
  | 'filter'
  | 'gate'
  | 'history'
  | 'home'
  | 'info'
  | 'key'
  | 'location'
  | 'lock'
  | 'logout'
  | 'menu'
  | 'moon'
  | 'refresh'
  | 'scan'
  | 'search'
  | 'shield'
  | 'sound-off'
  | 'sound-on'
  | 'sun'
  | 'switch-camera'
  | 'trend-down'
  | 'trend-up'
  | 'user'
  | 'users'
  | 'wifi';

const ICONS: Record<IconName, string> = {
  activity: 'lucideActivity',
  alert: 'lucideTriangleAlert',
  arrow: 'lucideChevronRight',
  'arrow-left': 'lucideChevronLeft',
  calendar: 'lucideCalendarDays',
  camera: 'lucideCamera',
  chart: 'lucideChartNoAxesColumn',
  check: 'lucideCheck',
  'chevron-down': 'lucideChevronDown',
  clock: 'lucideClock',
  close: 'lucideX',
  eye: 'lucideEye',
  'eye-off': 'lucideEyeOff',
  filter: 'lucideFunnel',
  gate: 'lucideDoorOpen',
  history: 'lucideHistory',
  home: 'lucideHouse',
  info: 'lucideInfo',
  key: 'lucideKeyRound',
  location: 'lucideMapPin',
  lock: 'lucideLockKeyhole',
  logout: 'lucideLogOut',
  menu: 'lucideMenu',
  moon: 'lucideMoon',
  refresh: 'lucideRefreshCw',
  scan: 'lucideScanQrCode',
  search: 'lucideSearch',
  shield: 'lucideShieldCheck',
  'sound-off': 'lucideVolumeX',
  'sound-on': 'lucideVolume2',
  sun: 'lucideSun',
  'switch-camera': 'lucideSwitchCamera',
  'trend-down': 'lucideTrendingDown',
  'trend-up': 'lucideTrendingUp',
  user: 'lucideUserRound',
  users: 'lucideUsers',
  wifi: 'lucideWifi',
};

@Component({
  selector: 'app-icon',
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideActivity,
      lucideCalendarDays,
      lucideCamera,
      lucideChartNoAxesColumn,
      lucideCheck,
      lucideChevronDown,
      lucideChevronLeft,
      lucideChevronRight,
      lucideClock,
      lucideDoorOpen,
      lucideEye,
      lucideEyeOff,
      lucideFunnel,
      lucideHistory,
      lucideHouse,
      lucideInfo,
      lucideKeyRound,
      lucideLockKeyhole,
      lucideLogOut,
      lucideMapPin,
      lucideMenu,
      lucideMoon,
      lucideRefreshCw,
      lucideScanQrCode,
      lucideSearch,
      lucideShieldCheck,
      lucideSun,
      lucideSwitchCamera,
      lucideTrendingDown,
      lucideTrendingUp,
      lucideTriangleAlert,
      lucideUserRound,
      lucideUsers,
      lucideVolume2,
      lucideVolumeX,
      lucideWifi,
      lucideX,
    }),
  ],
  template: '<ng-icon [name]="icon()" aria-hidden="true" />',
  styles: `
    :host {
      display: inline-flex;
      width: 1.125rem;
      height: 1.125rem;
      flex: 0 0 auto;
    }
    ng-icon {
      width: 100%;
      height: 100%;
      font-size: inherit;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppIcon {
  readonly name = input.required<IconName>();
  readonly icon = computed(() => ICONS[this.name()]);
}
