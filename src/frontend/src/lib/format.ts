/**
 * Shared formatting helpers for backend values.
 *
 * Motoko `Time.now()` values arrive as nanosecond `bigint`s, so every
 * timestamp must pass through `timestampToDate` before any JavaScript
 * `Date` operation.
 */

const dateTimeFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("es-MX", {
  hour: "2-digit",
  minute: "2-digit",
});

/** Convert a backend nanosecond timestamp into a `Date`, or `null` if invalid. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "12 mar 2026, 14:05" — falls back to a dash for invalid timestamps. */
export function formatDateTime(timestamp: bigint | undefined | null): string {
  if (timestamp === undefined || timestamp === null) return "—";
  const date = timestampToDate(timestamp);
  return date ? dateTimeFormatter.format(date) : "—";
}

/** "12 de marzo de 2026" */
export function formatDate(timestamp: bigint | undefined | null): string {
  if (timestamp === undefined || timestamp === null) return "—";
  const date = timestampToDate(timestamp);
  return date ? dateFormatter.format(date) : "—";
}

/** "14:05" */
export function formatTime(timestamp: bigint | undefined | null): string {
  if (timestamp === undefined || timestamp === null) return "—";
  const date = timestampToDate(timestamp);
  return date ? timeFormatter.format(date) : "—";
}

/** Relative Spanish label such as "hace 5 min" or "hace 2 h". */
export function formatRelative(timestamp: bigint | undefined | null): string {
  if (timestamp === undefined || timestamp === null) return "Sin lecturas";
  const date = timestampToDate(timestamp);
  if (!date) return "Sin lecturas";

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return "Ahora mismo";

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Ahora mismo";
  if (minutes < 60) return `Hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `Hace ${days} d`;

  return formatDate(timestamp);
}

/** Coordinates as decimal degrees with a hemisphere suffix, e.g. "19.43261° N". */
export function formatCoordinate(value: number, axis: "lat" | "lng"): string {
  if (!Number.isFinite(value)) return "—";
  const hemisphere =
    axis === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "O";
  return `${Math.abs(value).toFixed(5)}° ${hemisphere}`;
}

/** "19.43261, -99.13321" — compact pair for tables and cards. */
export function formatCoordinates(latitude: number, longitude: number): string {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return "—";
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

/** Numeric reading with a unit, e.g. "23.4 °C". */
export function formatReading(
  value: number | undefined | null,
  unit: string,
): string {
  if (value === undefined || value === null || !Number.isFinite(value)) {
    return "—";
  }
  const rounded = Number.isInteger(value) ? value.toString() : value.toFixed(1);
  return unit ? `${rounded} ${unit}` : rounded;
}

/** Shorten a long QR payload for display without losing its identity. */
export function truncateMiddle(value: string, max = 28): string {
  if (value.length <= max) return value;
  const half = Math.floor((max - 1) / 2);
  return `${value.slice(0, half)}…${value.slice(-half)}`;
}
