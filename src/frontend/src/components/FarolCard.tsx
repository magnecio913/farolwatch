import type { FarolView } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { formatCoordinates, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Lightbulb, MapPin } from "lucide-react";

interface FarolCardProps {
  farol: FarolView;
  index: number;
  positionCount?: number;
  lastRecordedAt?: bigint;
}

/** Farol summary card with a status stripe and a link to its detail view. */
export function FarolCard({
  farol,
  index,
  positionCount,
  lastRecordedAt,
}: FarolCardProps) {
  return (
    <Link
      to="/faroles/$farolId"
      params={{ farolId: farol.id.toString() }}
      data-ocid={`faroles.item.${index + 1}`}
      className={cn(
        "status-stripe group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-subtle transition-smooth",
        "hover:border-primary/40 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
      style={{ ["--status-color" as string]: "oklch(0.44 0.085 195)" }}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Lightbulb className="size-5" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-display text-base font-semibold text-foreground">
            {farol.name}
          </h3>
          <Badge
            variant="outline"
            className="shrink-0 rounded-full border-border text-muted-foreground"
          >
            #{farol.id.toString()}
          </Badge>
        </div>

        <p className="text-data mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          {formatCoordinates(farol.latitude, farol.longitude)}
        </p>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          {positionCount !== undefined
            ? `${positionCount} ${positionCount === 1 ? "posición" : "posiciones"}`
            : "Historial de posiciones"}
          {lastRecordedAt !== undefined &&
            ` · ${formatRelative(lastRecordedAt)}`}
        </p>
      </div>

      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground transition-smooth group-hover:translate-x-0.5 group-hover:text-primary"
        aria-hidden="true"
      />
    </Link>
  );
}
