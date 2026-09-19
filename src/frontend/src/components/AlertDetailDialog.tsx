import type { AlertView, SensorView } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useMarkAlertRead } from "@/hooks/useAlerts";
import { formatDateTime, formatReading } from "@/lib/format";
import {
  ALERT_REASON_META,
  ALERT_STRIPE_COLOR,
  sensorTypeLabel,
} from "@/lib/sensorTypes";
import { AlertTriangle, Check, Loader2 } from "lucide-react";

interface AlertDetailDialogProps {
  alert: AlertView | null;
  sensor?: SensorView;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DetailRowProps {
  label: string;
  value: string;
  mono?: boolean;
}

function DetailRow({ label, value, mono = false }: DetailRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={
          mono
            ? "text-data text-right text-sm font-medium text-foreground"
            : "text-right text-sm font-medium text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  );
}

/**
 * Explains why an alert fired: which sensor, which reason, the value that
 * triggered it and the configured range, plus a "mark as read" action.
 */
export function AlertDetailDialog({
  alert,
  sensor,
  open,
  onOpenChange,
}: AlertDetailDialogProps) {
  const markRead = useMarkAlertRead();

  if (!alert) return null;

  const meta = ALERT_REASON_META[alert.reason];
  const unit = sensor?.unit ?? "";
  const sensorName = sensor?.name ?? `Sensor #${alert.sensorId.toString()}`;
  const sensorKind = sensor ? sensorTypeLabel(sensor.sensorType) : "Sensor";
  const rangeText = sensor
    ? `${formatReading(sensor.minValue, unit)} — ${formatReading(sensor.maxValue, unit)}`
    : "Rango no disponible";

  const handleMarkRead = () => {
    markRead.mutate(alert.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="alert.detail.dialog"
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
      >
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: `color-mix(in oklch, ${ALERT_STRIPE_COLOR[alert.reason]} 14%, transparent)`,
                color: ALERT_STRIPE_COLOR[alert.reason],
              }}
              aria-hidden="true"
            >
              <AlertTriangle className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <DialogTitle className="font-display text-lg">
                {meta.label}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {meta.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={alert.read ? "secondary" : "destructive"}
            className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider"
          >
            {alert.read ? "Leída" : "Sin leer"}
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium"
          >
            {sensorKind}
          </Badge>
        </div>

        <Separator />

        <dl className="divide-y divide-border">
          <DetailRow label="Sensor" value={sensorName} />
          <DetailRow label="Motivo" value={meta.label} />
          <DetailRow
            label="Valor registrado"
            value={formatReading(alert.value, unit)}
            mono
          />
          <DetailRow label="Rango configurado" value={rangeText} mono />
          <DetailRow
            label="Fecha y hora"
            value={formatDateTime(alert.createdAt)}
            mono
          />
        </dl>

        {alert.message && (
          <p className="rounded-lg border border-border bg-muted/50 p-3 text-sm leading-relaxed text-muted-foreground">
            {alert.message}
          </p>
        )}

        <DialogFooter>
          <Button
            data-ocid="alert.detail.close_button"
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
          <Button
            data-ocid="alert.detail.mark_read_button"
            type="button"
            className="rounded-full"
            disabled={alert.read || markRead.isPending}
            onClick={handleMarkRead}
          >
            {markRead.isPending ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Check aria-hidden="true" />
            )}
            {alert.read ? "Ya marcada como leída" : "Marcar como leída"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
