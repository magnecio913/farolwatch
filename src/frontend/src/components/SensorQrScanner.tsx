import { Button } from "@/components/ui/button";
import { useQRScanner } from "@caffeineai/qr-code";
import { Camera, CameraOff, RefreshCw, ScanLine } from "lucide-react";
import { useEffect } from "react";

interface SensorQrScannerProps {
  /** Called once with the decoded payload of the first successful scan. */
  onDetected: (data: string) => void;
}

const isMobileDevice = () =>
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );

/**
 * Camera-based QR reader for a sensor's own code. The decoded payload is
 * handed to the parent dialog, which fills the QR field.
 */
export function SensorQrScanner({ onDetected }: SensorQrScannerProps) {
  const {
    qrResults,
    isScanning,
    isActive,
    isSupported,
    error,
    isLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    switchCamera,
    retry,
    videoRef,
    canvasRef,
  } = useQRScanner({ facingMode: "environment", scanInterval: 120 });

  const latest = qrResults[0];

  useEffect(() => {
    if (latest) onDetected(latest.data);
  }, [latest, onDetected]);

  if (isSupported === false) {
    return (
      <div
        data-ocid="sensor.qr_scanner.error_state"
        className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground"
      >
        Este navegador no permite usar la cámara. Escribe el código QR del
        sensor manualmente.
      </div>
    );
  }

  return (
    <div data-ocid="sensor.qr_scanner" className="space-y-3">
      <div className="relative aspect-video w-full min-h-48 overflow-hidden rounded-xl border border-border bg-foreground/90">
        <video
          ref={videoRef}
          className="size-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-background/80">
            <ScanLine className="size-7" aria-hidden="true" />
            <p className="px-6 text-xs">
              Activa la cámara y apunta al código QR del sensor.
            </p>
          </div>
        )}

        {isScanning && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-foreground">
            <span
              className="size-1.5 animate-status-pulse rounded-full bg-destructive"
              aria-hidden="true"
            />
            Escaneando
          </span>
        )}
      </div>

      {error && (
        <p
          data-ocid="sensor.qr_scanner.error_state"
          className="text-sm text-destructive"
        >
          {error.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          data-ocid="sensor.qr_start_button"
          type="button"
          size="sm"
          className="rounded-lg"
          onClick={() => void startScanning()}
          disabled={!canStartScanning || isActive}
        >
          <Camera aria-hidden="true" />
          Activar cámara
        </Button>

        <Button
          data-ocid="sensor.qr_stop_button"
          type="button"
          size="sm"
          variant="outline"
          className="rounded-lg"
          onClick={() => void stopScanning()}
          disabled={isLoading || !isActive}
        >
          <CameraOff aria-hidden="true" />
          Detener
        </Button>

        {isMobileDevice() && (
          <Button
            data-ocid="sensor.qr_switch_button"
            type="button"
            size="sm"
            variant="outline"
            className="rounded-lg"
            onClick={() => void switchCamera()}
            disabled={isLoading || !isActive}
          >
            <RefreshCw aria-hidden="true" />
            Cambiar cámara
          </Button>
        )}

        {error && (
          <Button
            data-ocid="sensor.qr_retry_button"
            type="button"
            size="sm"
            variant="outline"
            className="rounded-lg"
            onClick={() => void retry()}
            disabled={isLoading}
          >
            <RefreshCw aria-hidden="true" />
            Reintentar
          </Button>
        )}
      </div>

      {latest && (
        <p
          data-ocid="sensor.qr_scanner.success_state"
          className="text-xs text-success"
        >
          Código detectado y aplicado al formulario.
        </p>
      )}
    </div>
  );
}
