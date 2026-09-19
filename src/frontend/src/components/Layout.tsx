import { AppHeader } from "@/components/AppHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { useAlerts } from "@/hooks/useAlerts";
import { Outlet } from "@tanstack/react-router";

/**
 * Authenticated application shell: fixed sidebar on desktop, sticky header
 * with a mobile nav sheet, and the routed page body.
 */
export function Layout() {
  const { unreadCount } = useAlerts();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <AppSidebar unreadCount={unreadCount} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader unreadCount={unreadCount} />

        <main
          data-ocid="app.main"
          className="flex-1 bg-background px-4 py-6 sm:px-6 lg:px-8"
        >
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-border bg-card px-4 py-4 sm:px-6 lg:px-8">
          <p className="mx-auto max-w-6xl text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
