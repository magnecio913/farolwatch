import { SensorStatus } from "@/backend";
import { FarolCard } from "@/components/FarolCard";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlerts } from "@/hooks/useAlerts";
import { useFaroles, useSensors } from "@/hooks/useBackend";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  QrCode,
  Thermometer,
} from "lucide-react";

/** Panel — KPI summary, farol list and the primary QR scan call to action. */
export function DashboardPage() {
  const { data: faroles, isLoading: farolesLoading } = useFaroles();
  const { data: sensors, isLoading: sensorsLoading } = useSensors(
    null,
    null,
    "",
  );
  const { unreadCount, isLoading: alertsLoading } = useAlerts();

  const farolList = faroles ?? [];
  const sensorList = sensors ?? [];
  const outOfRange = sensorList.filter(
    (sensor) => sensor.status === SensorStatus.outOfRange,
  ).length;

  return (
    <div data-ocid="dashboard.page" className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps">Centro de monitoreo</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
            Panel
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Estado de los faroles registrados y sus sensores en tiempo real.
          </p>
        </div>
        <Button
          data-ocid="dashboard.escanear_button"
          type="button"
          asChild
          size="lg"
          className="rounded-full"
        >
          <Link to="/escanear">
            <QrCode aria-hidden="true" />
            Escanear QR
          </Link>
        </Button>
      </header>

      <section
        data-ocid="dashboard.kpi.section"
        aria-label="Resumen de indicadores"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          ocid="dashboard.kpi.faroles"
          label="Faroles registrados"
          value={farolesLoading ? "—" : farolList.length}
          hint="Puntos con QR registrado"
          icon={Lightbulb}
          tone="primary"
        />
        <StatCard
          ocid="dashboard.kpi.sensores"
          label="Sensores activos"
          value={sensorsLoading ? "—" : sensorList.length}
          hint="Movimiento, humedad, temperatura y batería"
          icon={Thermometer}
          tone="success"
        />
        <StatCard
          ocid="dashboard.kpi.fuera_rango"
          label="Sensores fuera de rango"
          value={sensorsLoading ? "—" : outOfRange}
          hint="Requieren revisión"
          icon={AlertTriangle}
          tone="warning"
          pulse={outOfRange > 0}
        />
        <StatCard
          ocid="dashboard.kpi.alertas"
          label="Alertas sin leer"
          value={alertsLoading ? "—" : unreadCount}
          hint="Notificaciones dentro de la app"
          icon={AlertTriangle}
          tone="destructive"
          pulse={unreadCount > 0}
        />
      </section>

      <section data-ocid="dashboard.faroles.section" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              Faroles
            </h2>
            <p className="text-sm text-muted-foreground">
              Selecciona un farol para ver su historial de posiciones.
            </p>
          </div>
          <Button
            data-ocid="dashboard.ver_faroles_button"
            type="button"
            variant="outline"
            size="sm"
            asChild
            className="rounded-full"
          >
            <Link to="/faroles">
              Ver todos
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {farolesLoading ? (
          <ul data-ocid="dashboard.faroles.loading_state" className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => `farol-skeleton-${i}`).map(
              (id) => (
                <li key={id}>
                  <Skeleton className="h-24 w-full rounded-xl" />
                </li>
              ),
            )}
          </ul>
        ) : farolList.length === 0 ? (
          <Card
            data-ocid="dashboard.faroles.empty_state"
            className="items-center gap-3 rounded-xl border-dashed py-12 text-center shadow-none"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <QrCode className="size-6" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="font-display text-lg font-semibold text-foreground">
                Aún no hay faroles registrados
              </p>
              <p className="mx-auto max-w-md text-sm text-muted-foreground">
                Escanea el QR de un farol para registrarlo y capturar su
                ubicación con el GPS del dispositivo.
              </p>
            </div>
            <Button
              data-ocid="dashboard.empty.escanear_button"
              type="button"
              asChild
              className="rounded-full"
            >
              <Link to="/escanear">
                <QrCode aria-hidden="true" />
                Escanear QR
              </Link>
            </Button>
          </Card>
        ) : (
          <ul data-ocid="dashboard.faroles.list" className="space-y-3">
            {farolList.map((farol, index) => (
              <li key={farol.id.toString()}>
                <FarolCard farol={farol} index={index} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
