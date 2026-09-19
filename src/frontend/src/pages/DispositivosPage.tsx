import type { LinkedDeviceView } from "@/backend";
import { DeviceCard } from "@/components/DeviceCard";
import { LinkDeviceDialog } from "@/components/LinkDeviceDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDevices, useUnlinkDevice } from "@/hooks/useBackend";
import {
  AlertTriangle,
  BellRing,
  Loader2,
  Plus,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { useState } from "react";

const SKELETON_IDS = Array.from(
  { length: 3 },
  (_, i) => `device-skeleton-${i}`,
);

const DELIVERY_POINTS = [
  {
    title: "Notificaciones",
    description: "Avisos dentro de la app cuando ocurre algo relevante.",
  },
  {
    title: "Alertas",
    description: "Las alertas de sensores llegan al dispositivo vinculado.",
  },
  {
    title: "Actualizaciones",
    description: "Cambios de estado de faroles y sensores en tiempo real.",
  },
  {
    title: "Recordatorios",
    description: "Pendientes y tareas de mantenimiento del sistema.",
  },
];

/**
 * Linked devices: explains what a linked phone receives inside the app,
 * lists every device with its link date, and allows linking or unlinking.
 */
export function DispositivosPage() {
  const devicesQuery = useDevices();
  const unlinkDevice = useUnlinkDevice();
  const [linkOpen, setLinkOpen] = useState(false);
  const [pendingUnlink, setPendingUnlink] = useState<LinkedDeviceView | null>(
    null,
  );

  const devices = devicesQuery.data ?? [];

  const handleConfirmUnlink = () => {
    if (!pendingUnlink) return;
    unlinkDevice.mutate(pendingUnlink.id, {
      onSuccess: () => setPendingUnlink(null),
    });
  };

  return (
    <section data-ocid="dispositivos.page" className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="label-caps">Monitoreo</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Dispositivos
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Vincula un celular como dispositivo registrado para que reciba las
            notificaciones, alertas, actualizaciones y recordatorios dentro de
            la app.
          </p>
        </div>

        <Button
          data-ocid="dispositivos.link_button"
          type="button"
          className="rounded-full"
          onClick={() => setLinkOpen(true)}
        >
          <Plus aria-hidden="true" />
          Vincular celular
        </Button>
      </header>

      <div
        data-ocid="dispositivos.delivery_panel"
        className="rounded-lg border border-border bg-card p-5 shadow-subtle"
      >
        <div className="flex items-center gap-2">
          <BellRing className="size-4 text-primary" aria-hidden="true" />
          <h2 className="font-display text-sm font-semibold">
            Qué recibe un dispositivo vinculado
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Todo llega como aviso dentro de la app: no se envían mensajes SMS ni
          notificaciones push.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {DELIVERY_POINTS.map((point) => (
            <li
              key={point.title}
              className="rounded-lg border border-border bg-background p-3"
            >
              <p className="text-sm font-medium text-foreground">
                {point.title}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {point.description}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {devicesQuery.isLoading && (
        <div data-ocid="dispositivos.loading_state" className="space-y-3">
          {SKELETON_IDS.map((id) => (
            <Skeleton key={id} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      )}

      {devicesQuery.isError && !devicesQuery.isLoading && (
        <div
          data-ocid="dispositivos.error_state"
          className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center"
        >
          <AlertTriangle
            className="size-6 text-destructive"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <h2 className="font-display text-base font-semibold">
              No se pudieron cargar los dispositivos
            </h2>
            <p className="text-sm text-muted-foreground">
              Revisa tu conexión e inténtalo de nuevo.
            </p>
          </div>
          <Button
            data-ocid="dispositivos.retry_button"
            type="button"
            className="rounded-full"
            onClick={() => void devicesQuery.refetch()}
          >
            <RefreshCw aria-hidden="true" />
            Reintentar
          </Button>
        </div>
      )}

      {!devicesQuery.isLoading &&
        !devicesQuery.isError &&
        devices.length === 0 && (
          <div
            data-ocid="dispositivos.empty_state"
            className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card p-12 text-center"
          >
            <span
              className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <Smartphone className="size-6" />
            </span>
            <div className="space-y-1">
              <h2 className="font-display text-base font-semibold">
                Aún no hay dispositivos vinculados
              </h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Vincula un celular para que reciba las notificaciones y alertas
                dentro de la app.
              </p>
            </div>
            <Button
              data-ocid="dispositivos.empty_link_button"
              type="button"
              className="rounded-full"
              onClick={() => setLinkOpen(true)}
            >
              <Plus aria-hidden="true" />
              Vincular celular
            </Button>
          </div>
        )}

      {!devicesQuery.isLoading &&
        !devicesQuery.isError &&
        devices.length > 0 && (
          <ul data-ocid="dispositivos.list" className="space-y-3">
            {devices.map((device, index) => (
              <li key={device.id.toString()} className="animate-fade-up">
                <DeviceCard
                  device={device}
                  index={index}
                  onUnlink={setPendingUnlink}
                />
              </li>
            ))}
          </ul>
        )}

      <LinkDeviceDialog open={linkOpen} onOpenChange={setLinkOpen} />

      <AlertDialog
        open={pendingUnlink !== null}
        onOpenChange={(open) => {
          if (!open) setPendingUnlink(null);
        }}
      >
        <AlertDialogContent data-ocid="device.unlink.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              ¿Desvincular este dispositivo?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingUnlink
                ? `“${pendingUnlink.name}” dejará de recibir las notificaciones, alertas, actualizaciones y recordatorios dentro de la app.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="device.unlink.cancel_button"
              className="rounded-full"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="device.unlink.confirm_button"
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={unlinkDevice.isPending}
              onClick={(event) => {
                event.preventDefault();
                handleConfirmUnlink();
              }}
            >
              {unlinkDevice.isPending && (
                <Loader2 className="animate-spin" aria-hidden="true" />
              )}
              Desvincular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
