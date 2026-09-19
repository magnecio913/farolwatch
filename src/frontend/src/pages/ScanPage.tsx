import type { FarolView } from "@/backend";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterFarol } from "@/hooks/useBackend";
import { formatCoordinates } from "@/lib/format";
import { useQRScanner } from "@caffeineai/qr-code";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Crosshair,
  Loader2,
  MapPin,
  QrCode,
  RefreshCw,
  ScanLine,
  SwitchCamera,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type GeoState = "idle" | "locating" | "ready" | "error";

interface CapturedLocation {
  latitude: number;
  longitude: number;
}

/** Escanear QR — camera scan, GPS capture and farol registration. */
export function ScanPage() {
  const {
    qrResults,
    isScanning,
    isActive,
    isSupported,
    error: cameraError,
    isLoading: cameraLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    switchCamera,
    clearResults,
    retry,
    videoRef,
    canvasRef,
  } = useQRScanner({ facingMode: "environment", scanInterval: 150 });

  const registerFarol = useRegisterFarol();

  const [name, setName] = useState("");
  const [location, setLocation] = useState<CapturedLocation | null>(null);
  const [geoState, setGeoState] = useState<GeoState>("idle");
  const [geoError, setGeoError] = useState<string | null>(null);
  const [registered, setRegistered] = useState<FarolView | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const latestScan = qrResults[0];
  const scannedCode = latestScan?.data ?? null;
  const handledScanRef = useRef<string | null>(null);

  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  // Capture the device GPS position once per newly scanned code.
  useEffect(() => {
    if (!scannedCode || handledScanRef.current === scannedCode) return;
    handledScanRef.current = scannedCode;

    setRegistered(null);
    setSubmitError(null);
    setLocation(null);

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("error");
      setGeoError(
        "Este dispositivo no permite obtener la ubicación. Registra el farol desde un teléfono con GPS.",
      );
      return;
    }

    setGeoState("locating");
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGeoState("ready");
      },
      (error) => {
        setGeoState("error");
        setGeoError(geolocationErrorMessage(error));
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  }, [scannedCode]);

  const canSubmit =
    scannedCode !== null &&
    location !== null &&
    geoState === "ready" &&
    !registerFarol.isPending;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scannedCode || !location) return;

    const trimmedName = name.trim();
    const fallbackName = `Farol ${scannedCode.slice(-6)}`;
    setSubmitError(null);

    registerFarol.mutate(
      {
        qrCode: scannedCode,
        name: trimmedName === "" ? fallbackName : trimmedName,
        latitude: location.latitude,
        longitude: location.longitude,
      },
      {
        onSuccess: (farol) => {
          setRegistered(farol);
          setName("");
          clearResults();
          handledScanRef.current = null;
        },
        onError: () => {
          setSubmitError(
            "No se pudo registrar el farol. Revisa tu conexión e inténtalo de nuevo.",
          );
        },
      },
    );
  }

  function handleScanAgain() {
    setRegistered(null);
    setSubmitError(null);
    setLocation(null);
    setGeoState("idle");
    setGeoError(null);
    handledScanRef.current = null;
    clearResults();
  }

  return (
    <div data-ocid="escanear.page" className="space-y-6">
      <header>
        <p className="label-caps">Registro en campo</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
          Escanear QR
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Apunta la cámara al código QR del farol. Al detectarlo se captura la
          ubicación GPS del dispositivo y se registra el punto.
        </p>
      </header>

      {registered && (
        <Card
          data-ocid="escanear.success_state"
          className="gap-4 rounded-xl border-success/40 bg-success/5 py-5 shadow-subtle"
        >
          <div className="flex items-start gap-3 px-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-semibold text-foreground">
                Farol registrado
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {registered.name} quedó guardado con la ubicación capturada.
              </p>
              <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="min-w-0">
                  <dt className="label-caps">Ubicación capturada</dt>
                  <dd className="text-data mt-1 truncate text-sm text-foreground">
                    {formatCoordinates(
                      registered.latitude,
                      registered.longitude,
                    )}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="label-caps">Código QR</dt>
                  <dd className="text-data mt-1 truncate text-sm text-foreground">
                    {registered.qrCode}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 px-5">
            <Button
              data-ocid="escanear.again_button"
              type="button"
              className="rounded-full"
              onClick={handleScanAgain}
            >
              <ScanLine aria-hidden="true" />
              Escanear otro farol
            </Button>
            <Button
              data-ocid="escanear.ver_farol_button"
              type="button"
              variant="outline"
              asChild
              className="rounded-full"
            >
              <Link
                to="/faroles/$farolId"
                params={{ farolId: registered.id.toString() }}
              >
                Ver historial
              </Link>
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="gap-4 rounded-xl py-5 shadow-subtle">
          <div className="flex items-center justify-between gap-3 px-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">
                Cámara
              </h2>
              <p className="text-xs text-muted-foreground">
                {isScanning
                  ? "Buscando un código QR…"
                  : "Inicia la cámara para escanear."}
              </p>
            </div>
            <span
              className={
                isScanning
                  ? "flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
                  : "flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
              }
            >
              <span
                className={
                  isScanning
                    ? "size-2 animate-status-pulse rounded-full bg-success"
                    : "size-2 rounded-full bg-muted-foreground"
                }
                aria-hidden="true"
              />
              {isScanning ? "Activa" : "Inactiva"}
            </span>
          </div>

          <div className="px-5">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-foreground/90">
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {!isActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-foreground/80 px-6 text-center">
                  <Camera
                    className="size-7 text-background/80"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-background/90">
                    La vista de la cámara aparecerá aquí.
                  </p>
                </div>
              )}

              {isScanning && (
                <div
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <div className="relative size-40 rounded-xl border-2 border-background/80">
                    <span className="absolute -left-0.5 -top-0.5 size-5 rounded-tl-lg border-l-4 border-t-4 border-primary" />
                    <span className="absolute -right-0.5 -top-0.5 size-5 rounded-tr-lg border-r-4 border-t-4 border-primary" />
                    <span className="absolute -bottom-0.5 -left-0.5 size-5 rounded-bl-lg border-b-4 border-l-4 border-primary" />
                    <span className="absolute -bottom-0.5 -right-0.5 size-5 rounded-br-lg border-b-4 border-r-4 border-primary" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {isSupported === false && (
            <div className="px-5">
              <div
                data-ocid="escanear.camera.error_state"
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
              >
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0 text-destructive"
                  aria-hidden="true"
                />
                <p className="text-sm text-foreground">
                  Este navegador no soporta el acceso a la cámara. Usa un
                  navegador actualizado en un dispositivo con cámara.
                </p>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="px-5">
              <div
                data-ocid="escanear.camera.error_state"
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
              >
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0 text-destructive"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {cameraErrorMessage(cameraError.type)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {cameraError.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 px-5">
            <Button
              data-ocid="escanear.start_button"
              type="button"
              className="rounded-full"
              onClick={() => void startScanning()}
              disabled={!canStartScanning || isScanning}
            >
              {cameraLoading ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Camera aria-hidden="true" />
              )}
              Iniciar cámara
            </Button>
            <Button
              data-ocid="escanear.stop_button"
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => void stopScanning()}
              disabled={cameraLoading || !isActive}
            >
              <X aria-hidden="true" />
              Detener
            </Button>
            {isMobile && (
              <Button
                data-ocid="escanear.switch_button"
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => void switchCamera()}
                disabled={cameraLoading || !isActive}
              >
                <SwitchCamera aria-hidden="true" />
                Cambiar cámara
              </Button>
            )}
            {cameraError && (
              <Button
                data-ocid="escanear.retry_button"
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => void retry()}
                disabled={cameraLoading}
              >
                <RefreshCw aria-hidden="true" />
                Reintentar
              </Button>
            )}
          </div>
        </Card>

        <Card className="gap-4 rounded-xl py-5 shadow-subtle">
          <div className="px-5">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Registro del farol
            </h2>
            <p className="text-xs text-muted-foreground">
              El QR identifica el punto; la ubicación proviene del GPS del
              dispositivo.
            </p>
          </div>

          <form className="space-y-4 px-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="farol-qr">Código QR detectado</Label>
              <div className="flex items-center gap-2 rounded-lg border border-input bg-muted/40 px-3 py-2">
                <QrCode
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span
                  data-ocid="escanear.qr_value"
                  className="text-data min-w-0 flex-1 truncate text-sm text-foreground"
                >
                  {scannedCode ?? "Esperando lectura…"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="farol-name">Nombre del farol</Label>
              <Input
                id="farol-name"
                data-ocid="escanear.name_input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej. Farol Parque Central"
                maxLength={60}
                className="h-10 rounded-lg"
              />
              <p className="text-xs text-muted-foreground">
                Opcional. Si lo dejas vacío se usará un nombre derivado del
                código.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-sm font-medium text-foreground">
                Ubicación GPS
              </span>
              <div
                data-ocid="escanear.location_state"
                className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3"
              >
                {geoState === "locating" ? (
                  <Loader2
                    className="mt-0.5 size-4 shrink-0 animate-spin text-primary"
                    aria-hidden="true"
                  />
                ) : geoState === "ready" ? (
                  <Crosshair
                    className="mt-0.5 size-4 shrink-0 text-success"
                    aria-hidden="true"
                  />
                ) : (
                  <MapPin
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
                <div className="min-w-0">
                  {geoState === "ready" && location ? (
                    <>
                      <p className="text-data text-sm text-foreground">
                        {formatCoordinates(
                          location.latitude,
                          location.longitude,
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Ubicación capturada correctamente.
                      </p>
                    </>
                  ) : geoState === "locating" ? (
                    <p className="text-sm text-foreground">
                      Obteniendo la ubicación del dispositivo…
                    </p>
                  ) : geoState === "error" ? (
                    <p className="text-sm text-foreground">
                      {geoError ?? "No se pudo obtener la ubicación."}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Escanea un QR para capturar la ubicación actual.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {submitError && (
              <div
                data-ocid="escanear.submit.error_state"
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
              >
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0 text-destructive"
                  aria-hidden="true"
                />
                <p className="text-sm text-foreground">{submitError}</p>
              </div>
            )}

            <Button
              data-ocid="escanear.submit_button"
              type="submit"
              className="w-full rounded-full"
              disabled={!canSubmit}
            >
              {registerFarol.isPending ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircle2 aria-hidden="true" />
              )}
              Registrar farol
            </Button>

            {!canSubmit && !registerFarol.isPending && (
              <p className="text-center text-xs text-muted-foreground">
                {scannedCode === null
                  ? "Escanea un código QR para continuar."
                  : geoState === "locating"
                    ? "Esperando la ubicación GPS…"
                    : geoState === "error"
                      ? "Necesitas permitir el acceso a la ubicación para registrar el farol."
                      : "Completa los datos para registrar el farol."}
              </p>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}

function cameraErrorMessage(type: string): string {
  switch (type) {
    case "permission":
      return "Permiso de cámara denegado";
    case "not-found":
      return "No se encontró ninguna cámara";
    case "not-supported":
      return "Cámara no soportada";
    case "timeout":
      return "La cámara tardó demasiado en responder";
    default:
      return "No se pudo iniciar la cámara";
  }
}

function geolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Permiso de ubicación denegado. Habilítalo en el navegador para registrar la posición del farol.";
    case error.POSITION_UNAVAILABLE:
      return "La ubicación no está disponible en este momento. Intenta de nuevo en un lugar abierto.";
    case error.TIMEOUT:
      return "Se agotó el tiempo para obtener la ubicación. Intenta de nuevo.";
    default:
      return "No se pudo obtener la ubicación del dispositivo.";
  }
}
