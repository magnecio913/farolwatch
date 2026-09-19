import type { PositionEntryView } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatTime } from "@/lib/format";
import { Clock, MapPin } from "lucide-react";

interface PositionHistoryListProps {
  positions: PositionEntryView[];
  isLoading?: boolean;
}

/** Newest-first position history for a single farol. */
export function PositionHistoryList({
  positions,
  isLoading = false,
}: PositionHistoryListProps) {
  if (isLoading) {
    return (
      <ul data-ocid="positions.loading_state" className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => `position-skeleton-${i}`).map(
          (id) => (
            <li key={id}>
              <Skeleton className="h-20 w-full rounded-xl" />
            </li>
          ),
        )}
      </ul>
    );
  }

  if (positions.length === 0) {
    return (
      <div
        data-ocid="positions.empty_state"
        className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center"
      >
        <MapPin className="size-6 text-muted-foreground" aria-hidden="true" />
        <p className="font-display text-base font-semibold text-foreground">
          Sin posiciones registradas
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Escanea el QR de este farol para capturar su primera ubicación con el
          GPS del dispositivo.
        </p>
      </div>
    );
  }

  return (
    <ol data-ocid="positions.list" className="space-y-3">
      {positions.map((position, index) => (
        <li
          key={position.id.toString()}
          data-ocid={`positions.item.${index + 1}`}
          className="status-stripe rounded-xl border border-border bg-card p-4 shadow-subtle transition-smooth hover:shadow-elevated"
          style={{ ["--status-color" as string]: "oklch(0.44 0.085 195)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="size-3.5" aria-hidden="true" />
              </span>
              <span className="font-display text-sm font-semibold text-foreground">
                {formatDate(position.recordedAt)}
              </span>
            </div>
            {index === 0 ? (
              <Badge
                variant="secondary"
                className="rounded-full border-transparent bg-primary/10 text-primary"
              >
                Más reciente
              </Badge>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" aria-hidden="true" />
                {formatTime(position.recordedAt)}
              </span>
            )}
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <dt className="label-caps">Latitud</dt>
              <dd className="text-data mt-1 truncate text-sm text-foreground">
                {position.latitude.toFixed(5)}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="label-caps">Longitud</dt>
              <dd className="text-data mt-1 truncate text-sm text-foreground">
                {position.longitude.toFixed(5)}
              </dd>
            </div>
          </dl>

          <p className="text-data mt-3 text-xs text-muted-foreground">
            {formatTime(position.recordedAt)} · {position.latitude.toFixed(5)},{" "}
            {position.longitude.toFixed(5)}
          </p>
        </li>
      ))}
    </ol>
  );
}
