import type { AlertView, SensorView } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { formatReading, formatRelative } from "@/lib/format";
import {
  ALERT_REASON_META,
  ALERT_STRIPE_COLOR,
  sensorTypeLabel,
} from "@/lib/sensorTypes";
import { cn } from "@/lib/utils";
import { AlertTriangle, ChevronRight, Circle } from "lucide-react";

interface AlertCardProps {
  alert: AlertView;
  sensor?: SensorView;
  index: number;
  onOpen: (alert: AlertView) => void;
}

/**
 * One alert row. Unread alerts get a tinted surface, a pulsing warning dot
 * and a heavier title so they stand out from the already-read history.
 */
export function AlertCard({ alert, sensor, index, onOpen }: AlertCardProps) {
  const meta = ALERT_REASON_META[alert.reason];
  const isUnread = !alert.read;
  const unit = sensor?.unit ?? "";
  const sensorName = sensor?.name ?? `Sensor #${alert.sensorId.toString()}`;
  const sensorKind = sensor ? sensorTypeLabel(sensor.sensorType) : "Sensor";

  return (
    <button
      type="button"
      data-ocid={`alert.item.${index + 1}`}
      onClick={() => onOpen(alert)}
      aria-label={`Ver detalle de la alerta: ${meta.label} en ${sensorName}`}
      className={cn(
        "status-stripe group flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-smooth",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isUnread
          ? "border-destructive/30 bg-destructive/[0.04] shadow-subtle hover:border-destructive/50"
          : "border-border bg-card hover:border-primary/40 hover:shadow-subtle",
      )}
      style={
        {
          "--status-color": ALERT_STRIPE_COLOR[alert.reason],
        } as React.CSSProperties
      }
    >
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
          isUnread
            ? "bg-destructive/12 text-destructive"
            : "bg-muted text-muted-foreground",
        )}
        aria-hidden="true"
      >
        <AlertTriangle className="size-4.5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "truncate text-sm",
              isUnread
                ? "font-semibold text-foreground"
                : "font-medium text-muted-foreground",
            )}
          >
            {meta.label}
          </span>
          {isUnread ? (
            <Badge
              variant="destructive"
              className="gap-1 rounded-full px-2 py-0 text-[0.65rem] font-semibold uppercase tracking-wider"
            >
              <Circle
                className="size-1.5 animate-status-pulse fill-current"
                aria-hidden="true"
              />
              Sin leer
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="rounded-full px-2 py-0 text-[0.65rem] font-medium uppercase tracking-wider"
            >
              Leída
            </Badge>
          )}
        </span>

        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {sensorName} · {sensorKind}
        </span>

        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-data text-sm font-semibold text-foreground">
            {formatReading(alert.value, unit)}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatRelative(alert.createdAt)}
          </span>
        </span>
      </span>

      <ChevronRight
        className="mt-2 size-4 shrink-0 text-muted-foreground transition-smooth group-hover:translate-x-0.5 group-hover:text-primary"
        aria-hidden="true"
      />
    </button>
  );
}
