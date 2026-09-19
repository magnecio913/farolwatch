import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface StaticMapProps {
  latitude: number;
  longitude: number;
  label?: string;
  className?: string;
  ocid?: string;
}

/**
 * Static map tile marking a single coordinate. Uses the OpenStreetMap tile
 * service directly as an image — no interactive map library is loaded.
 */
export function StaticMap({
  latitude,
  longitude,
  label,
  className,
  ocid = "map.static",
}: StaticMapProps) {
  const hasCoords = Number.isFinite(latitude) && Number.isFinite(longitude);
  const zoom = 16;
  const tileUrl = hasCoords
    ? `https://tile.openstreetmap.org/${zoom}/${lonToTileX(longitude, zoom)}/${latToTileY(latitude, zoom)}.png`
    : "";

  return (
    <figure
      data-ocid={ocid}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-muted",
        className,
      )}
    >
      {hasCoords ? (
        <img
          src={tileUrl}
          alt={
            label
              ? `Mapa de la ubicación registrada de ${label}`
              : "Mapa de la ubicación registrada"
          }
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Ubicación no disponible
          </p>
        </div>
      )}

      {hasCoords && (
        <span
          data-ocid="map.marker"
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center"
        >
          <span className="flex size-8 items-center justify-center rounded-full border-2 border-card bg-destructive text-destructive-foreground shadow-elevated">
            <MapPin className="size-4" aria-hidden="true" />
          </span>
          <span
            className="mt-0.5 h-2 w-0.5 bg-destructive"
            aria-hidden="true"
          />
        </span>
      )}

      <figcaption className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 bg-card/90 px-3 py-2 backdrop-blur-sm">
        <span className="truncate text-xs font-medium text-foreground">
          {label ?? "Ubicación registrada"}
        </span>
        <span className="text-data shrink-0 text-xs text-muted-foreground">
          {hasCoords ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : "—"}
        </span>
      </figcaption>
    </figure>
  );
}

function lonToTileX(longitude: number, zoom: number): number {
  return Math.floor(((longitude + 180) / 360) * 2 ** zoom);
}

function latToTileY(latitude: number, zoom: number): number {
  const rad = (latitude * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
      2 ** zoom,
  );
}
