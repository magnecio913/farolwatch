import { SensorType } from "@/backend";
import { SensorQrScanner } from "@/components/SensorQrScanner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddSensor, useFaroles } from "@/hooks/useBackend";
import {
  SENSOR_TYPE_META,
  SENSOR_TYPE_ORDER,
  sensorTypeLabel,
} from "@/lib/sensorTypes";
import { Loader2, Plus, QrCode, TriangleAlert } from "lucide-react";
import { useState } from "react";

const NO_FAROL = "none";

interface AddSensorDialogProps {
  /** Optional farol preselected when opened from a farol context. */
  defaultFarolId?: bigint;
}

/**
 * Adds a sensor manually or from its own QR code. Scanning the QR pre-fills
 * the code field; the user still confirms name, type, farol and range.
 */
export function AddSensorDialog({ defaultFarolId }: AddSensorDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [sensorType, setSensorType] = useState<SensorType>(
    SensorType.temperature,
  );
  const [farolId, setFarolId] = useState<string>(
    defaultFarolId ? defaultFarolId.toString() : NO_FAROL,
  );
  const [unit, setUnit] = useState(
    SENSOR_TYPE_META[SensorType.temperature].defaultUnit,
  );
  const [minValue, setMinValue] = useState("0");
  const [maxValue, setMaxValue] = useState("40");
  const [showScanner, setShowScanner] = useState(false);

  const { data: faroles } = useFaroles();
  const addSensor = useAddSensor();

  const parsedMin = Number(minValue);
  const parsedMax = Number(maxValue);
  const rangeValid =
    minValue.trim() !== "" &&
    maxValue.trim() !== "" &&
    Number.isFinite(parsedMin) &&
    Number.isFinite(parsedMax) &&
    parsedMin < parsedMax;
  const canSubmit =
    name.trim() !== "" &&
    qrCode.trim() !== "" &&
    rangeValid &&
    !addSensor.isPending;

  function resetDraft() {
    setName("");
    setQrCode("");
    setSensorType(SensorType.temperature);
    setFarolId(defaultFarolId ? defaultFarolId.toString() : NO_FAROL);
    setUnit(SENSOR_TYPE_META[SensorType.temperature].defaultUnit);
    setMinValue("0");
    setMaxValue("40");
    setShowScanner(false);
  }

  function handleTypeChange(value: string) {
    const next = value as SensorType;
    setSensorType(next);
    setUnit(SENSOR_TYPE_META[next].defaultUnit);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    addSensor.mutate(
      {
        name: name.trim(),
        qrCode: qrCode.trim(),
        sensorType: sensorType as never,
        farolId: farolId === NO_FAROL ? null : BigInt(farolId),
        unit: unit.trim() || SENSOR_TYPE_META[sensorType].defaultUnit,
        minValue: parsedMin,
        maxValue: parsedMax,
      },
      {
        onSuccess: () => {
          resetDraft();
          setOpen(false);
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setShowScanner(false);
      }}
    >
      <DialogTrigger asChild>
        <Button
          data-ocid="sensor.open_modal_button"
          type="button"
          className="rounded-lg"
        >
          <Plus aria-hidden="true" />
          Agregar sensor
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display">Agregar sensor</DialogTitle>
          <DialogDescription>
            Regístralo manualmente o escanea el código QR propio del sensor.
          </DialogDescription>
        </DialogHeader>

        <form
          data-ocid="sensor.add_form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="sensor-name">Nombre</Label>
            <Input
              id="sensor-name"
              data-ocid="sensor.name.input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Sensor de temperatura norte"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sensor-qr">Código QR del sensor</Label>
            <div className="flex gap-2">
              <Input
                id="sensor-qr"
                data-ocid="sensor.qr.input"
                value={qrCode}
                onChange={(event) => setQrCode(event.target.value)}
                placeholder="FARO-SENSOR-0001"
                autoComplete="off"
                className="text-data"
              />
              <Button
                data-ocid="sensor.qr_scan_button"
                type="button"
                variant="outline"
                className="shrink-0 rounded-lg"
                onClick={() => setShowScanner((current) => !current)}
              >
                <QrCode aria-hidden="true" />
                {showScanner ? "Ocultar" : "Escanear"}
              </Button>
            </div>
          </div>

          {showScanner && (
            <SensorQrScanner
              onDetected={(data) => {
                setQrCode(data);
                setShowScanner(false);
              }}
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sensor-type">Tipo</Label>
              <Select value={sensorType} onValueChange={handleTypeChange}>
                <SelectTrigger
                  id="sensor-type"
                  data-ocid="sensor.type.select"
                  className="w-full"
                >
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {SENSOR_TYPE_ORDER.map((type) => (
                    <SelectItem key={type} value={type}>
                      {sensorTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sensor-farol">Farol asociado</Label>
              <Select value={farolId} onValueChange={setFarolId}>
                <SelectTrigger
                  id="sensor-farol"
                  data-ocid="sensor.farol.select"
                  className="w-full"
                >
                  <SelectValue placeholder="Sin farol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_FAROL}>Sin farol asociado</SelectItem>
                  {(faroles ?? []).map((farol) => (
                    <SelectItem
                      key={farol.id.toString()}
                      value={farol.id.toString()}
                    >
                      {farol.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="sensor-unit">Unidad</Label>
              <Input
                id="sensor-unit"
                data-ocid="sensor.unit.input"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                placeholder="°C"
                autoComplete="off"
                className="text-data"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sensor-min">Mínimo</Label>
              <Input
                id="sensor-min"
                data-ocid="sensor.min.input"
                type="number"
                inputMode="decimal"
                step="any"
                value={minValue}
                onChange={(event) => setMinValue(event.target.value)}
                className="text-data"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sensor-max">Máximo</Label>
              <Input
                id="sensor-max"
                data-ocid="sensor.max.input"
                type="number"
                inputMode="decimal"
                step="any"
                value={maxValue}
                onChange={(event) => setMaxValue(event.target.value)}
                className="text-data"
              />
            </div>
          </div>

          {!rangeValid && minValue.trim() !== "" && maxValue.trim() !== "" && (
            <p
              data-ocid="sensor.add_error"
              className="flex items-center gap-2 text-sm text-destructive"
            >
              <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
              El mínimo debe ser menor que el máximo.
            </p>
          )}

          {addSensor.isError && (
            <p
              data-ocid="sensor.add_error"
              className="flex items-center gap-2 text-sm text-destructive"
            >
              <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
              No se pudo registrar el sensor. Revisa el código QR e inténtalo de
              nuevo.
            </p>
          )}

          <DialogFooter>
            <Button
              data-ocid="sensor.cancel_button"
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              data-ocid="sensor.submit_button"
              type="submit"
              className="rounded-lg"
              disabled={!canSubmit}
            >
              {addSensor.isPending && (
                <Loader2 className="animate-spin" aria-hidden="true" />
              )}
              Registrar sensor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
