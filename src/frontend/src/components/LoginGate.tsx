import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, Loader2, Radio, ShieldCheck } from "lucide-react";

/**
 * Full-screen gate shown whenever no Internet Identity session is active.
 * Every protected route renders this instead of app content.
 */
export function LoginGate() {
  const { login, isLoggingIn, isLoginError, loginError } = useAuth();

  return (
    <div
      data-ocid="login.page"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-subtle"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-elevated">
            <Radio className="size-7" aria-hidden="true" />
          </div>
          <p className="label-caps mb-2">Consola de faroles</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            Faro<span className="text-primary">Link</span>
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Monitorea faroles, sensores y alertas en tiempo real. Inicia sesión
            para acceder al panel compartido del equipo.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-subtle">
          <div className="mb-5 flex items-start gap-3 rounded-xl bg-secondary/60 p-3">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Acceso seguro con Internet Identity. No compartimos tu identidad
              con terceros.
            </p>
          </div>

          <Button
            data-ocid="login.submit_button"
            type="button"
            size="lg"
            className="w-full rounded-full"
            onClick={() => login()}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Iniciando sesión…
              </>
            ) : (
              "Iniciar sesión con Internet Identity"
            )}
          </Button>

          {isLoginError && (
            <p
              data-ocid="login.error_state"
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs leading-relaxed text-destructive"
            >
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>
                No se pudo iniciar sesión
                {loginError?.message ? `: ${loginError.message}` : "."} Vuelve a
                intentarlo.
              </span>
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Los datos de faroles, sensores y alertas son compartidos entre todos
          los usuarios autenticados.
        </p>
      </div>
    </div>
  );
}
