import { Layout } from "@/components/Layout";
import { LoginGate } from "@/components/LoginGate";
import { useAuth } from "@/hooks/useAuth";
import { AlertasPage } from "@/pages/AlertasPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DispositivosPage } from "@/pages/DispositivosPage";
import { FarolDetailPage } from "@/pages/FarolDetailPage";
import { FarolesPage } from "@/pages/FarolesPage";
import { ScanPage } from "@/pages/ScanPage";
import { SensorDetailPage } from "@/pages/SensorDetailPage";
import { SensoresPage } from "@/pages/SensoresPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_app",
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/",
  component: DashboardPage,
});

const farolesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/faroles",
  component: FarolesPage,
});

const farolDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/faroles/$farolId",
  component: FarolDetailPage,
});

const sensoresRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/sensores",
  component: SensoresPage,
});

const sensorDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/sensores/$sensorId",
  component: SensorDetailPage,
});

const alertasRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/alertas",
  component: AlertasPage,
});

const dispositivosRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/dispositivos",
  component: DispositivosPage,
});

const escanearRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/escanear",
  component: ScanPage,
});

const routeTree = rootRoute.addChildren([
  appRoute.addChildren([
    indexRoute,
    farolesRoute,
    farolDetailRoute,
    sensoresRoute,
    sensorDetailRoute,
    alertasRoute,
    dispositivosRoute,
    escanearRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

/**
 * Blocks every route until an Internet Identity session exists. While the
 * stored identity is still loading we show a neutral splash instead of
 * flashing the login screen.
 */
function AuthGate() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div
        data-ocid="app.loading_state"
        className="flex min-h-screen items-center justify-center bg-background"
      >
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2
            className="size-6 animate-spin text-primary"
            aria-hidden="true"
          />
          <p className="text-sm">Verificando sesión…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginGate />;
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return <AuthGate />;
}
