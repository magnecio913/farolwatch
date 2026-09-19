import { SensorStatusPill } from "@/components/SensorCard";
import { SensorRangeForm } from "@/components/SensorRangeForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useFaroles, useRecordReading, useSensor } from "@/hooks/useBackend";
import {
  formatDateTime,
  formatReading,
  formatRelative,
  truncateMiddle,
} from "@/lib/format";
import { SENSOR_TYPE_META, STATUS_TEXT_CLASS } from "@/lib/sensorTypes";
import { cn } from "@/lib/utils";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Gauge,
  Lightbulb,
  Loader2,
  QrCode,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";

/** Sensor detail: operating data, range editing and reading capture. */
export function SensorDetailPage() {
  const { sensorId } = useParams({ from: "/_app/sensores/$sensorId" });
  const parsedId = /^\d+$/.test(sensorId) ? BigInt(sensorId) : null;

  const { data: sensor, isLoading, isError, refetch } = useSensor(parsedId);
  const { data: faroles } = useFaroles();

  if (parsedId === null) {
    return <NotFoundState />;
  }

  if (isLoading) {
    return (
      <section data-ocid="sensor.detail.loading_state" className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </section>
    );
  }

  if (isError) {
    return (
      <section
        data-ocid="sensor.detail.error_state"
        className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center"
      >
        <TriangleAlert className="size-6 text-destructive" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          No se pudo cargar el sensor.
        </p>
        <Button
          data-ocid="sensor.detail.retry_button"
          type="button"
          variant="outline"
          className="rounded-lg"
          onClick={() => void refetch()}
        >
          Reintentar
        </Button>
      </section>
    );
  }

  if (!sensor) {
    return <NotFoundState />;
  }

  const typeMeta = SENSOR_TYPE_META[sensor.sensorType];
  const unit = sensor.unit || typeMeta.defaultUnit;
  const farolName =
    sensor.farolId !== undefined
      ? faroles?.find((farol) => farol.id === sensor.farolId)?.name
      : undefined;

  return (
    <section data-ocid="sensor.detail.page" className="space-y-6">
      <div>
        <Button
          data-ocid="sensor.detail.back_button"
          type="button"
          variant="ghost"
          size="sm"
          asChild
          className="-ml-2 rounded-lg text-muted-foreground"
        >
          <Link to="/sensores">
            <ArrowLeft aria-hidden="true" />
            Volver a sensores
          </Link>
        </Button>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="label-caps">{typeMeta.label}</p>
          <h1 className="mt-1 truncate font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {sensor.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {typeMeta.description}
          </p>
        </div>
        <SensorStatusPill status={sensor.status} className="mt-1" />
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-5 shadow-subtle lg:col-span-2">
          <p className="label-caps">Última lectura</p>
          <p
            className={cn(
              "text-data mt-2 text-4xl font-semibold",
              sensor.lastValue !== undefined
                ? STATUS_TEXT_CLASS[sensor.status]
                : "text-muted-foreground",
            )}
          >
            {formatReading(sensor.lastValue, unit)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatRelative(sensor.lastReadingAt)}
            {sensor.lastReadingAt !== undefined && (
              <span className="text-data">
                {" "}
                · {formatDateTime(sensor.lastReadingAt)}
              </span>
            )}
          </p>
        </article>

        <article className="rounded-xl border border-border bg-card p-5 shadow-subtle">
          <p className="label-caps">Rango configurado</p>
          <p className="text-data mt-2 text-2xl font-semibold text-foreground">
            {formatReading(sensor.minValue, unit)} –{" "}
            {formatReading(sensor.maxValue, unit)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Las lecturas fuera de este rango generan alertas automáticas.
          </p>
        </article>
      </div>

      <article className="rounded-xl border border-border bg-card p-5 shadow-subtle">
        <h2 className="font-display text-lg font-semibold">
          Datos de funcionamiento
        </h2>
        <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <DataRow icon={Gauge} label="Tipo de sensor" value={typeMeta.label} />
          <DataRow icon={Gauge} label="Unidad" value={unit} mono />
          <DataRow
            icon={Lightbulb}
            label="Farol asociado"
            value={farolName ?? "Sin farol asociado"}
          />
          <DataRow
            icon={QrCode}
            label="Código QR"
            value={truncateMiddle(sensor.qrCode)}
            mono
            title={sensor.qrCode}
          />
        </dl>
      </article>

      <article className="rounded-xl border border-border bg-card p-5 shadow-subtle">
        <h2 className="font-display text-lg font-semibold">
          Editar rango mín/máx
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ajusta los límites del sensor. Al guardar, las próximas lecturas se
          evalúan contra el nuevo rango.
        </p>
        <div className="mt-4">
          <SensorRangeForm sensor={sensor} />
        </div>
      </article>

      <RecordReadingPanel sensorId={sensor.id} unit={unit} />
    </section>
  );
}

function DataRow({
  icon: Icon,
  label,
  value,
  mono,
  title,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  mono?: boolean;
  title?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="label-caps">{label}</dt>
        <dd
          className={cn(
            "mt-0.5 truncate text-sm text-foreground",
            mono && "text-data",
          )}
          title={title}
        >
          {value}
        </dd>
      </div>
    </div>
  );
}

function RecordReadingPanel({
  sensorId,
  unit,
}: {
  sensorId: bigint;
  unit: string;
}) {
  const [value, setValue] = useState("");
  const recordReading = useRecordReading();

  const parsed = Number(value);
  const canSubmit =
    value.trim() !== "" && Number.isFinite(parsed) && !recordReading.isPending;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    const captured = value;
    setValue("");
    recordReading.mutate(
      { sensorId, value: parsed },
      {
        onError: () =>
          setValue((current) => (current === "" ? captured : current)),
      },
    );
  }

  const createdAlerts = recordReading.data ?? [];

  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-subtle">
      <h2 className="font-display text-lg font-semibold">Registrar lectura</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ingresa un valor para simular una lectura del sensor. Si sale del rango
        configurado, la alerta se genera automáticamente.
      </p>

      <form
        data-ocid="sensor.reading_form"
        onSubmit={handleSubmit}
        className="mt-4 flex flex-wrap items-end gap-3"
      >
        <div className="min-w-40 flex-1 space-y-2">
          <Label htmlFor="sensor-reading">Valor de la lectura</Label>
          <Input
            id="sensor-reading"
            data-ocid="sensor.reading.input"
            type="number"
            inputMode="decimal"
            step="any"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={unit ? `Valor en ${unit}` : "Valor"}
            className="text-data"
          />
        </div>
        <Button
          data-ocid="sensor.reading_submit_button"
          type="submit"
          className="rounded-lg"
          disabled={!canSubmit}
        >
          {recordReading.isPending && (
            <Loader2 className="animate-spin" aria-hidden="true" />
          )}
          Registrar lectura
        </Button>
      </form>

      {recordReading.isError && (
        <p
          data-ocid="sensor.reading_error"
          className="mt-3 flex items-center gap-2 text-sm text-destructive"
        >
          <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
          No se pudo registrar la lectura. Inténtalo de nuevo.
        </p>
      )}

      {recordReading.isSuccess && (
        <p
          data-ocid="sensor.reading_success_state"
          className="mt-3 text-sm font-medium text-success"
        >
          {createdAlerts.length > 0
            ? `Lectura registrada. Se generaron ${createdAlerts.length} alerta(s).`
            : "Lectura registrada dentro del rango configurado."}
        </p>
      )}
    </article>
  );
}

function NotFoundState() {
  return (
    <section
      data-ocid="sensor.detail.empty_state"
      className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-10 text-center"
    >
      <TriangleAlert
        className="size-6 text-muted-foreground"
        aria-hidden="true"
      />
      <h1 className="font-display text-lg font-semibold">
        Sensor no encontrado
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        El sensor solicitado no existe o fue eliminado.
      </p>
      <Button
        data-ocid="sensor.detail.back_button"
        type="button"
        variant="outline"
        asChild
        className="rounded-lg"
      >
        <Link to="/sensores">
          <ArrowLeft aria-hidden="true" />
          Volver a sensores
        </Link>
      </Button>
    </section>
  );
}
