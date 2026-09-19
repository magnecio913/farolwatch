import { PositionHistoryList } from "@/components/PositionHistoryList";
import { StaticMap } from "@/components/StaticMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFarol, usePositions } from "@/hooks/useBackend";
import {
  formatCoordinates,
  formatDateTime,
  formatRelative,
} from "@/lib/format";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Clock, Lightbulb, MapPin, QrCode } from "lucide-react";

/** Farol detail — current position, static map and full position history. */
export function FarolDetailPage() {
  const { farolId } = useParams({ from: "/_app/faroles/$farolId" });
  const parsedId = parseFarolId(farolId);

  const { data: farol, isLoading: farolLoading } = useFarol(parsedId);
  const { data: positions, isLoading: positionsLoading } =
    usePositions(parsedId);

  const positionList = positions ?? [];
  const latest = positionList[0];

  if (parsedId === null) {
    return (
      <div data-ocid="farol.error_state" className="space-y-4">
        <p className="font-display text-lg font-semibold text-foreground">
          Identificador de farol inválido
        </p>
        <Button
          type="button"
          variant="outline"
          asChild
          className="rounded-full"
        >
          <Link to="/faroles">
            <ArrowLeft aria-hidden="true" />
            Volver a faroles
          </Link>
        </Button>
      </div>
    );
  }

  if (farolLoading) {
    return (
      <div data-ocid="farol.loading_state" className="space-y-6">
        <Skeleton className="h-9 w-56 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!farol) {
    return (
      <Card
        data-ocid="farol.empty_state"
        className="items-center gap-3 rounded-xl border-dashed py-12 text-center shadow-none"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Lightbulb className="size-6" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <p className="font-display text-lg font-semibold text-foreground">
            Farol no encontrado
          </p>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            Este farol no existe o fue eliminado. Vuelve a la lista para elegir
            otro.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          asChild
          className="rounded-full"
        >
          <Link to="/faroles">
            <ArrowLeft aria-hidden="true" />
            Volver a faroles
          </Link>
        </Button>
      </Card>
    );
  }

  const currentLatitude = latest?.latitude ?? farol.latitude;
  const currentLongitude = latest?.longitude ?? farol.longitude;

  return (
    <div data-ocid="farol.page" className="space-y-8">
      <div>
        <Button
          data-ocid="farol.back_button"
          type="button"
          variant="ghost"
          size="sm"
          asChild
          className="rounded-full"
        >
          <Link to="/faroles">
            <ArrowLeft aria-hidden="true" />
            Faroles
          </Link>
        </Button>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="label-caps">Detalle del farol</p>
          <h1 className="mt-1 flex items-center gap-3 font-display text-3xl font-bold tracking-tight text-foreground">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Lightbulb className="size-5" aria-hidden="true" />
            </span>
            <span className="truncate">{farol.name}</span>
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-full border-border text-muted-foreground"
            >
              #{farol.id.toString()}
            </Badge>
            <span className="text-data truncate text-xs text-muted-foreground">
              QR {farol.qrCode}
            </span>
          </div>
        </div>
        <Button
          data-ocid="farol.escanear_button"
          type="button"
          asChild
          className="rounded-full"
        >
          <Link to="/escanear">
            <QrCode aria-hidden="true" />
            Escanear QR
          </Link>
        </Button>
      </header>

      <section
        data-ocid="farol.ubicacion.section"
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <Card className="gap-4 rounded-xl py-5 shadow-subtle">
          <div className="px-5">
            <p className="label-caps">Ubicación actual</p>
            <p className="text-data mt-2 text-lg font-semibold text-foreground">
              {formatCoordinates(currentLatitude, currentLongitude)}
            </p>
            <dl className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4" aria-hidden="true" />
                  Registrado
                </dt>
                <dd className="text-data text-sm text-foreground">
                  {formatDateTime(farol.registeredAt)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4" aria-hidden="true" />
                  Último escaneo
                </dt>
                <dd className="text-sm text-foreground">
                  {latest ? formatRelative(latest.recordedAt) : "Sin escaneos"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-sm text-muted-foreground">
                  Entradas de historial
                </dt>
                <dd className="text-data text-sm text-foreground">
                  {positionList.length}
                </dd>
              </div>
            </dl>
          </div>
        </Card>

        <StaticMap
          latitude={currentLatitude}
          longitude={currentLongitude}
          label={farol.name}
          ocid="farol.map"
          className="min-h-[16rem]"
        />
      </section>

      <section data-ocid="farol.historial.section" className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
            Historial de posiciones
          </h2>
          <p className="text-sm text-muted-foreground">
            Cada escaneo agrega una entrada con la ubicación capturada, de más
            reciente a más antigua.
          </p>
        </div>
        <PositionHistoryList
          positions={positionList}
          isLoading={positionsLoading}
        />
      </section>
    </div>
  );
}

function parseFarolId(raw: string): bigint | null {
  try {
    return BigInt(raw);
  } catch {
    return null;
  }
}
