import { AlertReason, SensorStatus, SensorType } from "@/backend";

/** Spanish label, unit and icon key for each sensor type. */
export interface SensorTypeMeta {
  label: string;
  shortLabel: string;
  defaultUnit: string;
  description: string;
}

export const SENSOR_TYPE_META: Record<SensorType, SensorTypeMeta> = {
  [SensorType.temperature]: {
    label: "Temperatura",
    shortLabel: "Temp.",
    defaultUnit: "°C",
    description: "Mide la temperatura ambiente del entorno.",
  },
  [SensorType.humidity]: {
    label: "Humedad",
    shortLabel: "Humedad",
    defaultUnit: "%",
    description: "Mide la humedad relativa del aire.",
  },
  [SensorType.movement]: {
    label: "Movimiento",
    shortLabel: "Mov.",
    defaultUnit: "evt",
    description: "Detecta actividad o desplazamiento del farol.",
  },
  [SensorType.battery]: {
    label: "Batería",
    shortLabel: "Bat.",
    defaultUnit: "%",
    description: "Reporta el nivel de carga de la batería.",
  },
};

export const SENSOR_TYPE_ORDER: SensorType[] = [
  SensorType.temperature,
  SensorType.humidity,
  SensorType.movement,
  SensorType.battery,
];

export function sensorTypeLabel(type: SensorType): string {
  return SENSOR_TYPE_META[type]?.label ?? "Sensor";
}

export function sensorTypeUnit(type: SensorType): string {
  return SENSOR_TYPE_META[type]?.defaultUnit ?? "";
}

/** Spanish label and semantic tone for each sensor status. */
export interface SensorStatusMeta {
  label: string;
  tone: "success" | "warning" | "destructive";
  description: string;
}

export const SENSOR_STATUS_META: Record<SensorStatus, SensorStatusMeta> = {
  [SensorStatus.normal]: {
    label: "Normal",
    tone: "success",
    description: "La última lectura está dentro del rango configurado.",
  },
  [SensorStatus.outOfRange]: {
    label: "Fuera de rango",
    tone: "destructive",
    description: "La última lectura salió del rango mínimo y máximo.",
  },
};

export function sensorStatusLabel(status: SensorStatus): string {
  return SENSOR_STATUS_META[status]?.label ?? "Desconocido";
}

/** Spanish label and warning copy for each alert reason. */
export interface AlertReasonMeta {
  label: string;
  description: string;
  tone: "warning" | "destructive";
}

export const ALERT_REASON_META: Record<AlertReason, AlertReasonMeta> = {
  [AlertReason.aboveMax]: {
    label: "Por encima del máximo",
    description:
      "La lectura superó el valor máximo configurado para el sensor.",
    tone: "destructive",
  },
  [AlertReason.belowMin]: {
    label: "Por debajo del mínimo",
    description: "La lectura cayó por debajo del valor mínimo configurado.",
    tone: "warning",
  },
  [AlertReason.movementDetected]: {
    label: "Movimiento detectado",
    description: "El sensor de movimiento registró actividad en el farol.",
    tone: "warning",
  },
};

export function alertReasonLabel(reason: AlertReason): string {
  return ALERT_REASON_META[reason]?.label ?? "Alerta";
}

export function alertReasonDescription(reason: AlertReason): string {
  return ALERT_REASON_META[reason]?.description ?? "";
}

/** Tailwind class fragments for status-driven surfaces. */
export const STATUS_TEXT_CLASS: Record<SensorStatus, string> = {
  [SensorStatus.normal]: "text-success",
  [SensorStatus.outOfRange]: "text-destructive",
};

export const STATUS_BG_CLASS: Record<SensorStatus, string> = {
  [SensorStatus.normal]: "bg-success",
  [SensorStatus.outOfRange]: "bg-destructive",
};

export const STATUS_STRIPE_COLOR: Record<SensorStatus, string> = {
  [SensorStatus.normal]: "oklch(0.52 0.13 152)",
  [SensorStatus.outOfRange]: "oklch(0.53 0.2 27)",
};

export const ALERT_STRIPE_COLOR: Record<AlertReason, string> = {
  [AlertReason.aboveMax]: "oklch(0.53 0.2 27)",
  [AlertReason.belowMin]: "oklch(0.7 0.15 78)",
  [AlertReason.movementDetected]: "oklch(0.7 0.15 78)",
};
