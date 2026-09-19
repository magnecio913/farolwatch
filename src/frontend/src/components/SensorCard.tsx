import type { SensorView } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { formatReading, formatRelative } from "@/lib/format";
import {
  SENSOR_STATUS_META,
  SENSOR_TYPE_META,
  STATUS_STRIPE_COLOR,
  STATUS_TEXT_CLASS,
  sensorStatusLabel,
  sensorTypeLabel,
} from "@/lib/sensorTypes";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Lightbulb, Radio } from "lucide-react";

interface SensorCardProps {
  sensor: SensorView;
  /** Name of the associated farol, resolved by the page. */
  farolName?: string;
  /** 1-based position used for deterministic test markers. */
  index: number;
}

/** Status-driven pill shown on cards and detail views. */
export function SensorStatusPill({
  status,
  className,
}: {
  status: SensorView["status"];
  className?: string;
}) {
  const meta = SENSOR_STATUS_META[status];
  const isCritical = meta.tone === "destructive";

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full border-transparent px-2.5 py-1 text-xs font-semibold",
        meta.tone === "success" && "bg-success/12 text-success",
        meta.tone === "destructive" && "bg-destructive/12 text-destructive",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          meta.tone === "success" ? "bg-success" : "bg-destructive",
          isCritical && "animate-status-pulse",
        )}
        aria-hidden="true"
      />
      {sensorStatusLabel(status)}
    </Badge>
  );
}

/**
 * Sensor summary card: a colored left status stripe, the sensor identity,
 * its associated farol and the latest reading with unit.
 */
export function SensorCard({ sensor, farolName, index }: SensorCardProps) {
  const typeMeta = SENSOR_TYPE_META[sensor.sensorType];
  const unit = sensor.unit || typeMeta.defaultUnit;
  const hasReading = sensor.lastValue !== undefined;

  return (
    <Link
      to="/sensores/$sensorId"
      params={{ sensorId: sensor.id.toString() }}
      data-ocid={`sensor.item.${index}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <article
        style={
          {
            "--status-color": STATUS_STRIPE_COLOR[sensor.status],
          } as React.CSSProperties
        }
        className="status-stripe flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-subtle transition-smooth group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-elevated"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="label-caps">{typeMeta.label}</p>
            <h3 className="mt-1 truncate font-display text-base font-semibold text-foreground">
              {sensor.name}
            </h3>
          </div>
          <SensorStatusPill status={sensor.status} />
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="label-caps">Última lectura</p>
            <p
              className={cn(
                "text-data mt-1 text-2xl font-semibold",
                hasReading
                  ? STATUS_TEXT_CLASS[sensor.status]
                  : "text-muted-foreground",
              )}
            >
              {formatReading(sensor.lastValue, unit)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatRelative(sensor.lastReadingAt)}
            </p>
          </div>

          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/60 text-muted-foreground transition-smooth group-hover:border-primary/40 group-hover:text-primary"
            aria-hidden="true"
          >
            <ChevronRight className="size-4" />
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1.5">
            <Lightbulb className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {farolName ?? "Sin farol asociado"}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <Radio className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="text-data">
              {formatReading(sensor.minValue, unit)} –{" "}
              {formatReading(sensor.maxValue, unit)}
            </span>
          </span>
        </div>
      </article>
    </Link>
  );
}
