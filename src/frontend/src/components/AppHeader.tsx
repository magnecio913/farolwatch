import { AlertBadge } from "@/components/AlertBadge";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";
import { Bell, LogOut, Menu, QrCode, Radio } from "lucide-react";
import { useState } from "react";

interface AppHeaderProps {
  unreadCount: number;
}

/** Sticky application header: brand, mobile nav, alert bell and session. */
export function AppHeader({ unreadCount }: AppHeaderProps) {
  const { principal, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const principalText = principal?.toText() ?? "";
  const shortPrincipal =
    principalText.length > 12
      ? `${principalText.slice(0, 5)}…${principalText.slice(-4)}`
      : principalText;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card shadow-subtle">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button
              data-ocid="nav.menu_button"
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Abrir menú de navegación"
            >
              <Menu aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-sidebar p-0">
            <SheetTitle className="sr-only">Navegación principal</SheetTitle>
            <AppSidebar
              unreadCount={unreadCount}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <Link
          to="/"
          data-ocid="nav.brand.link"
          className="flex items-center gap-2.5 rounded-lg transition-smooth hover:opacity-90"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
            <Radio className="size-4.5" aria-hidden="true" />
          </span>
          <span className="hidden font-display text-lg font-semibold tracking-tight text-foreground sm:inline">
            Faro<span className="text-primary">Link</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Button
            data-ocid="nav.escanear_button"
            type="button"
            asChild
            size="sm"
            className="hidden rounded-full sm:inline-flex"
          >
            <Link to="/escanear">
              <QrCode aria-hidden="true" />
              Escanear QR
            </Link>
          </Button>

          <Button
            data-ocid="nav.alertas_button"
            type="button"
            variant="ghost"
            size="icon"
            asChild
            className="relative"
            aria-label={
              unreadCount > 0
                ? `Alertas, ${unreadCount} sin leer`
                : "Alertas, sin alertas nuevas"
            }
          >
            <Link to="/alertas">
              <Bell aria-hidden="true" />
              <AlertBadge count={unreadCount} />
            </Link>
          </Button>

          <div className="hidden items-center gap-2 rounded-full border border-border bg-secondary/50 py-1 pl-3 pr-1 md:flex">
            <span className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full bg-success"
                aria-hidden="true"
              />
              <span className="text-xs font-medium text-muted-foreground">
                Sesión activa
              </span>
            </span>
            {shortPrincipal && (
              <span
                data-ocid="session.principal"
                className="text-data text-xs text-foreground"
                title={principalText}
              >
                {shortPrincipal}
              </span>
            )}
          </div>

          <Button
            data-ocid="session.logout_button"
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={logout}
          >
            <LogOut aria-hidden="true" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
