import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BrowserCodeReader, BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import { Result } from '@zxing/library';
import { finalize } from 'rxjs';
import { GateScanResult } from '../../core/models/api.models';
import { AuthService } from '../../core/services/auth.service';
import { GateAccessService } from '../../core/services/gate-access.service';
import { AppIcon } from '../../shared/ui/app-icon';

type ScannerState = 'starting' | 'scanning' | 'processing' | 'result' | 'error' | 'stopped';

@Component({
  selector: 'app-qr-scanner',
  imports: [DatePipe, AppIcon],
  templateUrl: './qr-scanner.html',
  styleUrl: './qr-scanner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrScanner {
  @ViewChild('preview', { static: true }) private preview!: ElementRef<HTMLVideoElement>;
  private readonly reader = new BrowserQRCodeReader(undefined, { delayBetweenScanAttempts: 250 });
  private readonly accessService = inject(GateAccessService);
  private readonly destroyRef = inject(DestroyRef);
  private controls: IScannerControls | null = null;
  private lastToken = '';
  private lastReadAt = 0;
  private resumeAfterVisibility = false;

  readonly auth = inject(AuthService);
  readonly state = signal<ScannerState>('starting');
  readonly cameras = signal<MediaDeviceInfo[]>([]);
  readonly selectedCameraId = signal('');
  readonly soundEnabled = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly result = signal<GateScanResult | null>(null);
  readonly decisionLoading = signal(false);
  private pendingToken = '';

  /**
   * Un único AudioContext para toda la sesión. Crear uno por tono dejaba el audio
   * mudo: el navegador arranca cada contexto en estado "suspended" hasta que hay un
   * gesto del usuario, y el tono sonaba justo después de un escaneo automático, sin
   * gesto que lo desbloqueara. Este se reanuda desde el primer toque del guardia.
   */
  private audioContext: AudioContext | null = null;

  constructor() {
    queueMicrotask(() => void this.initializeCamera());

    // La política de autoplay exige un gesto del usuario antes de dejar sonar nada.
    // Se aprovecha el primero que ocurra en la vista, sea cual sea, y luego se retira.
    const unlockAudio = () => void this.resumeAudio();
    document.addEventListener('pointerdown', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });

    const visibilityHandler = () => {
      if (document.hidden && this.state() === 'scanning') {
        this.resumeAfterVisibility = true;
        this.stopCamera();
      } else if (!document.hidden && this.resumeAfterVisibility) {
        this.resumeAfterVisibility = false;
        void this.startDecode(this.selectedCameraId() || undefined);
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);
    this.destroyRef.onDestroy(() => {
      document.removeEventListener('visibilitychange', visibilityHandler);
      document.removeEventListener('pointerdown', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
      void this.audioContext?.close();
      this.audioContext = null;
      this.stopCamera();
    });
  }

  async initializeCamera(): Promise<void> {
    this.result.set(null); this.errorMessage.set(null); this.state.set('starting');
    if (!window.isSecureContext && location.hostname !== 'localhost') {
      this.fail('La cámara requiere HTTPS. Abre el portal con una conexión segura o usa localhost.');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      this.fail('Este navegador no ofrece acceso compatible a la cámara. Prueba con Chrome o Edge actualizados.');
      return;
    }

    try {
      const permissionStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }, audio: false,
      });
      const preferredId = permissionStream.getVideoTracks()[0]?.getSettings().deviceId;
      permissionStream.getTracks().forEach((track) => track.stop());
      const devices = await BrowserCodeReader.listVideoInputDevices();
      this.cameras.set(devices);
      const rear = devices.find((device) => /back|rear|environment|trasera/i.test(device.label));
      const chosen = rear?.deviceId ?? preferredId ?? devices.at(-1)?.deviceId;
      this.selectedCameraId.set(chosen ?? '');
      await this.startDecode(chosen);
    } catch (error: unknown) {
      this.fail(this.cameraError(error));
    }
  }

  async changeCamera(event: Event): Promise<void> {
    const deviceId = (event.target as HTMLSelectElement).value;
    this.selectedCameraId.set(deviceId);
    await this.startDecode(deviceId);
  }

  async cycleCamera(): Promise<void> {
    const devices = this.cameras();
    if (devices.length < 2) return;
    const currentIndex = devices.findIndex((camera) => camera.deviceId === this.selectedCameraId());
    const next = devices[(currentIndex + 1) % devices.length];
    if (!next) return;
    this.selectedCameraId.set(next.deviceId);
    await this.startDecode(next.deviceId);
  }

  toggleSound(): void {
    const enabled = !this.soundEnabled();
    this.soundEnabled.set(enabled);
    // Pulsar el botón es un gesto válido: se aprovecha para desbloquear el audio y
    // además se emite un tono de prueba, para que el guardia oiga que quedó activo.
    if (enabled) void this.resumeAudio().then(() => this.playTone(true));
  }

  scanNext(): void {
    this.result.set(null); this.lastToken = ''; this.pendingToken = ''; this.errorMessage.set(null);
    void this.startDecode(this.selectedCameraId() || undefined);
  }

  decide(authorize: boolean): void {
    const token = this.pendingToken;
    if (!token || this.decisionLoading()) return;
    this.decisionLoading.set(true);
    this.accessService.decide(token, authorize)
      .pipe(finalize(() => this.decisionLoading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.result.set(result);
          this.playTone(result.status === 'authorized');
          if (result.status === 'authorized' && 'vibrate' in navigator) navigator.vibrate([80, 60, 80]);
        },
        error: () => {
          this.result.set({
            success: false,
            status: 'denied',
            code: 'SERVER_ERROR',
            message: 'No fue posible registrar la decisión. Intenta nuevamente.',
            access: null,
          });
        },
      });
  }

  retryCamera(): void { void this.initializeCamera(); }

  private async startDecode(deviceId?: string): Promise<void> {
    this.stopCamera(); this.errorMessage.set(null); this.state.set('starting');
    try {
      this.controls = await this.reader.decodeFromVideoDevice(
        deviceId,
        this.preview.nativeElement,
        (result) => this.onDecode(result),
      );
      this.state.set('scanning');
    } catch (error: unknown) {
      this.fail(this.cameraError(error));
    }
  }

  private onDecode(result: Result | undefined): void {
    if (!result || this.state() !== 'scanning') return;
    const token = result.getText().trim();
    const now = Date.now();
    if (!token || (token === this.lastToken && now - this.lastReadAt < 5000)) return;
    this.lastToken = token; this.lastReadAt = now;
    this.processToken(token);
  }

  private processToken(token: string): void {
    this.stopCamera(); this.state.set('processing'); this.result.set(null); this.pendingToken = token;
    if ('vibrate' in navigator) navigator.vibrate(55);
    this.accessService.preview(token)
      .pipe(finalize(() => this.state.set('result')), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.result.set(result);
          this.playTone(result.status === 'pending');
        },
        error: () => {
          this.playTone(false);
          this.result.set({
            success: false,
            status: 'denied',
            code: navigator.onLine ? 'SERVER_ERROR' : 'OFFLINE',
            message: navigator.onLine
              ? 'No fue posible validar el QR. Intenta nuevamente.'
              : 'No hay conexión. Reconecta el dispositivo antes de registrar el acceso.',
            access: null,
          });
        },
      });
  }

  /**
   * Reanuda (o crea) el contexto de audio. Debe invocarse desde un gesto del usuario:
   * el navegador solo levanta la suspensión en ese momento.
   */
  private async resumeAudio(): Promise<void> {
    if (typeof AudioContext === 'undefined') return;
    try {
      this.audioContext ??= new AudioContext();
      if (this.audioContext.state === 'suspended') await this.audioContext.resume();
    } catch {
      // Sin audio se sigue operando: el resultado también se ve y se vibra.
    }
  }

  /**
   * Tono corto de confirmación (agudo ascendente) o de rechazo (grave).
   *
   * Antes creaba un AudioContext por tono y nunca sonaba: cada contexto nuevo nace
   * suspendido hasta que hay un gesto del usuario, y aquí el tono llega justo después
   * de un escaneo automático. Ahora reutiliza el contexto ya desbloqueado.
   */
  private playTone(success: boolean): void {
    if (!this.soundEnabled()) return;
    const context = this.audioContext;
    if (!context || context.state !== 'running') {
      // Todavía sin gesto que desbloquee el audio: se intenta dejarlo listo para el
      // siguiente escaneo en lugar de perder el tono actual en un error.
      void this.resumeAudio();
      return;
    }

    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(success ? 720 : 240, context.currentTime);
      if (success) oscillator.frequency.exponentialRampToValueAtTime(920, context.currentTime + 0.12);
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.start(); oscillator.stop(context.currentTime + 0.19);
      // El contexto es compartido: solo se sueltan los nodos, no se cierra.
      oscillator.addEventListener('ended', () => { oscillator.disconnect(); gain.disconnect(); }, { once: true });
    } catch {
      // El feedback auditivo es opcional y nunca debe bloquear una validación.
    }
  }

  private stopCamera(): void {
    this.controls?.stop(); this.controls = null;
    const stream = this.preview?.nativeElement.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());
    if (this.preview?.nativeElement) this.preview.nativeElement.srcObject = null;
    if (this.state() === 'scanning') this.state.set('stopped');
  }

  private fail(message: string): void { this.stopCamera(); this.errorMessage.set(message); this.state.set('error'); }

  private cameraError(error: unknown): string {
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError' || error.name === 'SecurityError') return 'No hay permiso para usar la cámara. Habilítalo en la configuración del navegador.';
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') return 'No se encontró una cámara disponible en este dispositivo.';
      if (error.name === 'NotReadableError' || error.name === 'TrackStartError') return 'La cámara está siendo utilizada por otra aplicación o pestaña.';
    }
    return 'No fue posible iniciar la cámara. Revisa los permisos y vuelve a intentarlo.';
  }
}
