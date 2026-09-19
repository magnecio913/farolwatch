import { SensorStatus, type SensorType } from "@/backend";
import { AddSensorDialog } from "@/components/AddSensorDialog";
import { SensorCard } from "@/components/SensorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useFaroles, useSensors } from "@/hooks/useBackend";
import { SENSOR_TYPE_ORDER, sensorTypeLabel } from "@/lib/sensorTypes";
import { cn } from "@/lib/utils";
import { Search, Thermometer, TriangleAlert, X } from "lucide-react";
import { useMemo, useState } from "react";

type TypeFilter = SensorType | "all";
type StatusFilter = SensorStatus | "all";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: SensorStatus.normal, label: "Normal" },
  { value: SensorStatus.outOfRange, label: "Fuera de rango" },
];

const SKELETON_IDS = Array.from(
  { length: 6 },
  (_, i) => `sensor-skeleton-${i}`,
);

/** Sensor inventory: search, type/status filters and the sensor grid. */
export function SensoresPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const {
    data: sensors,
    isLoading,
    isError,
    refetch,
  } = useSensors(
    typeFilter === "all" ? null : typeFilter,
    statusFilter === "all" ? null : statusFilter,
    search,
  );
  const { data: faroles } = useFaroles();

  const farolNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const farol of faroles ?? []) {
      map.set(farol.id.toString(), farol.name);
    }
    return map;
  }, [faroles]);

  const list = sensors ?? [];
  const hasFilters =
    search.trim() !== "" || typeFilter !== "all" || statusFilter !== "all";

  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
  }

  return (
    <section data-ocid="sensores.page" className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps">Monitoreo</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Sensores
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Inventario de sensores de los faroles, con su última lectura y su
            estado frente al rango configurado.
          </p>
        </div>
        <AddSensorDialog />
      </header>

      <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-subtle">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            data-ocid="sensor.search_input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o código QR"
            aria-label="Buscar sensores"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="label-caps mr-1">Tipo</span>
          <FilterChip
            active={typeFilter === "all"}
            onClick={() => setTypeFilter("all")}
            ocid="sensor.filter.type.all"
          >
            Todos
          </FilterChip>
          {SENSOR_TYPE_ORDER.map((type) => (
            <FilterChip
              key={type}
              active={typeFilter === type}
              onClick={() => setTypeFilter(type)}
              ocid={`sensor.filter.type.${type}`}
            >
              {sensorTypeLabel(type)}
            </FilterChip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="label-caps mr-1">Estado</span>
          {STATUS_FILTERS.map((filter) => (
            <FilterChip
              key={filter.value}
              active={statusFilter === filter.value}
              onClick={() => setStatusFilter(filter.value)}
              ocid={`sensor.filter.status.${filter.value}`}
            >
              {filter.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {isLoading && (
        <div
          data-ocid="sensor.loading_state"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {SKELETON_IDS.map((id) => (
            <Skeleton key={id} className="h-44 rounded-xl" />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div
          data-ocid="sensor.error_state"
          className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center"
        >
          <TriangleAlert
            className="size-6 text-destructive"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">
            No se pudieron cargar los sensores.
          </p>
          <Button
            data-ocid="sensor.retry_button"
            type="button"
            variant="outline"
            className="rounded-lg"
            onClick={() => void refetch()}
          >
            Reintentar
          </Button>
        </div>
      )}

      {!isLoading && !isError && list.length === 0 && (
        <div
          data-ocid="sensor.empty_state"
          className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-10 text-center"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
            <Thermometer className="size-5" aria-hidden="true" />
          </span>
          <h2 className="font-display text-lg font-semibold">
            {hasFilters ? "Sin resultados" : "Aún no hay sensores"}
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {hasFilters
              ? "Ningún sensor coincide con la búsqueda y los filtros seleccionados."
              : "Registra el primer sensor manualmente o escaneando su código QR para empezar a monitorear."}
          </p>
          {hasFilters ? (
            <Button
              data-ocid="sensor.clear_filters_button"
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={clearFilters}
            >
              <X aria-hidden="true" />
              Limpiar filtros
            </Button>
          ) : (
            <AddSensorDialog />
          )}
        </div>
      )}

      {!isLoading && !isError && list.length > 0 && (
        <div
          data-ocid="sensor.list"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {list.map((sensor, index) => (
            <div
              key={sensor.id.toString()}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <SensorCard
                sensor={sensor}
                index={index + 1}
                farolName={
                  sensor.farolId !== undefined
                    ? farolNames.get(sensor.farolId.toString())
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  ocid: string;
  children: React.ReactNode;
}

function FilterChip({ active, onClick, ocid, children }: FilterChipProps) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-smooth",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
