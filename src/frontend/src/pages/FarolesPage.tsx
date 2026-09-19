import { FarolCard } from "@/components/FarolCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useFaroles } from "@/hooks/useBackend";
import { Link } from "@tanstack/react-router";
import { Lightbulb, QrCode, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

/** Faroles — searchable list of every registered farol. */
export function FarolesPage() {
  const { data: faroles, isLoading } = useFaroles();
  const [search, setSearch] = useState("");

  const farolList = faroles ?? [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term === "") return farolList;
    return farolList.filter(
      (farol) =>
        farol.name.toLowerCase().includes(term) ||
        farol.qrCode.toLowerCase().includes(term) ||
        farol.id.toString().includes(term),
    );
  }, [farolList, search]);

  return (
    <div data-ocid="faroles.page" className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps">Inventario</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
            Faroles
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading
              ? "Cargando faroles registrados…"
              : `${farolList.length} ${farolList.length === 1 ? "farol registrado" : "faroles registrados"}`}
          </p>
        </div>
        <Button
          data-ocid="faroles.escanear_button"
          type="button"
          asChild
          className="rounded-full"
        >
          <Link to="/escanear">
            <QrCode aria-hidden="true" />
            Escanear QR
          </Link>
        </Button>
      </header>

      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          data-ocid="faroles.search_input"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, QR o número"
          aria-label="Buscar faroles"
          className="h-10 rounded-lg pl-9 pr-9"
        />
        {search !== "" && (
          <button
            data-ocid="faroles.search_clear_button"
            type="button"
            onClick={() => setSearch("")}
            aria-label="Limpiar búsqueda"
            className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {isLoading ? (
        <ul data-ocid="faroles.loading_state" className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => `farol-skeleton-${i}`).map(
            (id) => (
              <li key={id}>
                <Skeleton className="h-24 w-full rounded-xl" />
              </li>
            ),
          )}
        </ul>
      ) : filtered.length === 0 ? (
        <Card
          data-ocid="faroles.empty_state"
          className="items-center gap-3 rounded-xl border-dashed py-12 text-center shadow-none"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {farolList.length === 0 ? (
              <Lightbulb className="size-6" aria-hidden="true" />
            ) : (
              <Search className="size-6" aria-hidden="true" />
            )}
          </span>
          <div className="space-y-1">
            <p className="font-display text-lg font-semibold text-foreground">
              {farolList.length === 0
                ? "Aún no hay faroles registrados"
                : "Sin resultados"}
            </p>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">
              {farolList.length === 0
                ? "Escanea el QR de un farol para registrarlo con su ubicación GPS."
                : "Ningún farol coincide con la búsqueda. Prueba con otro nombre o código."}
            </p>
          </div>
          {farolList.length === 0 ? (
            <Button
              data-ocid="faroles.empty.escanear_button"
              type="button"
              asChild
              className="rounded-full"
            >
              <Link to="/escanear">
                <QrCode aria-hidden="true" />
                Escanear QR
              </Link>
            </Button>
          ) : (
            <Button
              data-ocid="faroles.empty.clear_button"
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setSearch("")}
            >
              Limpiar búsqueda
            </Button>
          )}
        </Card>
      ) : (
        <ul data-ocid="faroles.list" className="space-y-3">
          {filtered.map((farol, index) => (
            <li key={farol.id.toString()}>
              <FarolCard farol={farol} index={index} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
