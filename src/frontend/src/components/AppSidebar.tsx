import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  LayoutDashboard,
  Lightbulb,
  QrCode,
  Smartphone,
  Thermometer,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Panel", icon: LayoutDashboard },
  { to: "/faroles", label: "Faroles", icon: Lightbulb },
  { to: "/sensores", label: "Sensores", icon: Thermometer },
  { to: "/alertas", label: "Alertas", icon: Bell },
  { to: "/dispositivos", label: "Dispositivos", icon: Smartphone },
];

interface AppSidebarProps {
  unreadCount: number;
  onNavigate?: () => void;
}

/** Primary navigation rail. Rendered in the desktop shell and mobile sheet. */
export function AppSidebar({ unreadCount, onNavigate }: AppSidebarProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <nav
      data-ocid="nav.sidebar"
      aria-label="Navegación principal"
      className="flex h-full flex-col gap-1 p-3"
    >
      <p className="label-caps px-3 pb-2 pt-3">Monitoreo</p>

      {NAV_ITEMS.map((item) => {
        const isActive =
          item.to === "/"
            ? pathname === "/"
            : pathname === item.to || pathname.startsWith(`${item.to}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            data-ocid={`nav.${item.label.toLowerCase()}.link`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0 transition-smooth",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-foreground",
              )}
              aria-hidden="true"
            />
            <span className="flex-1 truncate">{item.label}</span>
            {item.to === "/alertas" && unreadCount > 0 && (
              <span
                data-ocid="nav.alertas.count"
                className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[0.65rem] font-semibold text-destructive-foreground"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        );
      })}

      <div className="mt-auto rounded-xl border border-sidebar-border bg-card p-3">
        <div className="mb-2 flex items-center gap-2">
          <QrCode className="size-4 text-primary" aria-hidden="true" />
          <p className="text-xs font-semibold text-foreground">
            Registro rápido
          </p>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          Escanea el QR de un farol para registrarlo con su ubicación.
        </p>
        <Link
          to="/escanear"
          onClick={onNavigate}
          data-ocid="nav.escanear.link"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-smooth hover:bg-primary/90"
        >
          <QrCode className="size-3.5" aria-hidden="true" />
          Escanear QR
        </Link>
      </div>
    </nav>
  );
}
