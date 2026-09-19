import type { SensorView } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateSensorRange } from "@/hooks/useBackend";
import { formatReading } from "@/lib/format";
import { Check, Loader2, TriangleAlert } from "lucide-react";
import { useState } from "react";

interface SensorRangeFormProps {
  sensor: SensorView;
}

/**
 * Edits the configured minimum and maximum of a sensor. The draft lives in
 * local state and is only reset by the user's own submit flow.
 */
export function SensorRangeForm({ sensor }: SensorRangeFormProps) {
  const updateRange = useUpdateSensorRange();
  const [minValue, setMinValue] = useState(String(sensor.minValue));
  const [maxValue, setMaxValue] = useState(String(sensor.maxValue));
  const [saved, setSaved] = useState(false);

  const parsedMin = Number(minValue);
  const parsedMax = Number(maxValue);
  const minValid = minValue.trim() !== "" && Number.isFinite(parsedMin);
  const maxValid = maxValue.trim() !== "" && Number.isFinite(parsedMax);
  const rangeValid = minValid && maxValid && parsedMin < parsedMax;
  const canSubmit = rangeValid && !updateRange.isPending;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setSaved(false);
    updateRange.mutate(
      { id: sensor.id, minValue: parsedMin, maxValue: parsedMax },
      {
        onSuccess: () => setSaved(true),
        onError: () => setSaved(false),
      },
    );
  }

  return (
    <form
      data-ocid="sensor.range_form"
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sensor-range-min">Mínimo</Label>
          <Input
            id="sensor-range-min"
            data-ocid="sensor.range_min.input"
            type="number"
            inputMode="decimal"
            step="any"
            value={minValue}
            onChange={(event) => {
              setMinValue(event.target.value);
              setSaved(false);
            }}
            aria-invalid={minValue.trim() !== "" && !minValid}
            className="text-data"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sensor-range-max">Máximo</Label>
          <Input
            id="sensor-range-max"
            data-ocid="sensor.range_max.input"
            type="number"
            inputMode="decimal"
            step="any"
            value={maxValue}
            onChange={(event) => {
              setMaxValue(event.target.value);
              setSaved(false);
            }}
            aria-invalid={maxValue.trim() !== "" && !maxValid}
            className="text-data"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Rango actual:{" "}
        <span className="text-data text-foreground">
          {formatReading(sensor.minValue, sensor.unit)} –{" "}
          {formatReading(sensor.maxValue, sensor.unit)}
        </span>
        . Las lecturas fuera de este rango generan una alerta automática.
      </p>

      {!rangeValid && minValid && maxValid && (
        <p
          data-ocid="sensor.range_error"
          className="flex items-center gap-2 text-sm text-destructive"
        >
          <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
          El mínimo debe ser menor que el máximo.
        </p>
      )}

      {updateRange.isError && (
        <p
          data-ocid="sensor.range_error"
          className="flex items-center gap-2 text-sm text-destructive"
        >
          <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
          No se pudo guardar el rango. Inténtalo de nuevo.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          data-ocid="sensor.range_save_button"
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg"
        >
          {updateRange.isPending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Check aria-hidden="true" />
          )}
          Guardar rango
        </Button>

        {saved && !updateRange.isPending && (
          <span
            data-ocid="sensor.range_success_state"
            className="text-sm font-medium text-success"
          >
            Rango actualizado
          </span>
        )}
      </div>
    </form>
  );
}
