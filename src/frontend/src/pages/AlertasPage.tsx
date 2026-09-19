import type { AlertView, SensorView } from "@/backend";
import { AlertCard } from "@/components/AlertCard";
import { AlertDetailDialog } from "@/components/AlertDetailDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlerts } from "@/hooks/useAlerts";
import { useSensors } from "@/hooks/useBackend";
import { AlertTriangle, BellOff, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

const SKELETON_IDS = Array.from({ length: 4 }, (_, i) => `alert-skeleton-${i}`);

/**
 * Alert history for every authenticated user, newest first. Unread alerts
 * are visually prominent and each row opens a detail dialog explaining why
 * the alert fired.
 */
export function AlertasPage() {
  const { alerts, unreadCount, isLoading, isError, refetch, isFetching } =
    useAlerts();
  const sensorsQuery = useSensors(null, null, "");
  const [selected, setSelected] = useState<AlertView | null>(null);

  const sensorsById = useMemo(() => {
    const map = new Map<string, SensorView>();
    for (const sensor of sensorsQuery.data ?? []) {
      map.set(sensor.id.toString(), sensor);
    }
    return map;
  }, [sensorsQuery.data]);

  const selectedSensor = selected
    ? sensorsById.get(selected.sensorId.toString())
    : undefined;

  return (
    <section data-ocid="alertas.page" className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="label-caps">Monitoreo</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Alertas
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Avisos generados automáticamente cuando un sensor sale de su rango
            configurado o detecta movimiento inusual. Son visibles para todos
            los usuarios autenticados.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-border bg-card px-4 py-2 text-center shadow-subtle">
            <p className="text-data text-xl font-semibold text-destructive">
              {unreadCount}
            </p>
            <p className="label-caps">Sin leer</p>
          </div>
          <Button
            data-ocid="alertas.refresh_button"
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={isFetching ? "animate-spin" : undefined}
              aria-hidden="true"
            />
            Actualizar
          </Button>
        </div>
      </header>

      {isLoading && (
        <div data-ocid="alertas.loading_state" className="space-y-3">
          {SKELETON_IDS.map((id) => (
            <Skeleton key={id} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div
          data-ocid="alertas.error_state"
          className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center"
        >
          <AlertTriangle
            className="size-6 text-destructive"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <h2 className="font-display text-base font-semibold">
              No se pudieron cargar las alertas
            </h2>
            <p className="text-sm text-muted-foreground">
              Revisa tu conexión e inténtalo de nuevo.
            </p>
          </div>
          <Button
            data-ocid="alertas.retry_button"
            type="button"
            className="rounded-full"
            onClick={() => void refetch()}
          >
            Reintentar
          </Button>
        </div>
      )}

      {!isLoading && !isError && alerts.length === 0 && (
        <div
          data-ocid="alertas.empty_state"
          className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card p-12 text-center"
        >
          <span
            className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success"
            aria-hidden="true"
          >
            <BellOff className="size-6" />
          </span>
          <div className="space-y-1">
            <h2 className="font-display text-base font-semibold">
              Todo en orden
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              No hay alertas registradas. Cuando un sensor salga de su rango o
              detecte movimiento, aparecerá aquí.
            </p>
          </div>
        </div>
      )}

      {!isLoading && !isError && alerts.length > 0 && (
        <ul data-ocid="alertas.list" className="space-y-3">
          {alerts.map((alert, index) => (
            <li key={alert.id.toString()} className="animate-fade-up">
              <AlertCard
                alert={alert}
                sensor={sensorsById.get(alert.sensorId.toString())}
                index={index}
                onOpen={setSelected}
              />
            </li>
          ))}
        </ul>
      )}

      <AlertDetailDialog
        alert={selected}
        sensor={selectedSensor}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </section>
  );
}
