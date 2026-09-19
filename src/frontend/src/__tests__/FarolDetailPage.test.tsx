import { createActorMock } from "@/__tests__/helpers";
import { renderWithRouter } from "@/__tests__/router";
import type { FarolView, PositionEntryView } from "@/backend";
import { FarolDetailPage } from "@/pages/FarolDetailPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const actor = createActorMock();

vi.mock("@caffeineai/core-infrastructure", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@caffeineai/core-infrastructure")>();
  return {
    ...actual,
    useActor: () => ({ actor, isFetching: false }),
  };
});

const farol: FarolView = {
  id: 3n,
  name: "Farol Norte",
  qrCode: "FARO-NORTE",
  latitude: 19.4,
  longitude: -99.1,
  registeredAt: 1_700_000_000_000_000_000n,
};

// The backend contract is newest-first; the page must preserve that order.
const positions: PositionEntryView[] = [
  {
    id: 12n,
    farolId: 3n,
    latitude: 19.43261,
    longitude: -99.13321,
    recordedAt: 1_700_000_300_000_000_000n,
  },
  {
    id: 11n,
    farolId: 3n,
    latitude: 19.4325,
    longitude: -99.133,
    recordedAt: 1_700_000_200_000_000_000n,
  },
  {
    id: 10n,
    farolId: 3n,
    latitude: 19.4324,
    longitude: -99.1329,
    recordedAt: 1_700_000_100_000_000_000n,
  },
];

function renderDetail() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return renderWithRouter(
    () => (
      <QueryClientProvider client={queryClient}>
        <FarolDetailPage />
      </QueryClientProvider>
    ),
    { path: "/faroles/$farolId", initialPath: "/faroles/3" },
  );
}

describe("FarolDetailPage — position history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actor.getFarol.mockResolvedValue(farol);
    actor.listPositions.mockResolvedValue(positions);
  });

  it("lists every position entry newest first", async () => {
    renderDetail();

    const list = await screen.findByTestId("positions.list");
    const items = list.querySelectorAll("[data-ocid^='positions.item.']");
    expect(items).toHaveLength(3);

    // The first rendered entry is the most recent one and is badged as such.
    expect(items[0]).toHaveAttribute("data-ocid", "positions.item.1");
    expect(items[0]).toHaveTextContent("19.43261");
    expect(items[0]).toHaveTextContent("Más reciente");

    // The remaining entries keep the backend's newest-first ordering.
    expect(items[1]).toHaveTextContent("19.43250");
    expect(items[2]).toHaveTextContent("19.43240");
  });

  it("shows the empty state when the farol has no recorded positions", async () => {
    actor.listPositions.mockResolvedValue([]);
    renderDetail();

    expect(
      await screen.findByTestId("positions.empty_state"),
    ).toBeInTheDocument();
    expect(screen.getByText("Sin posiciones registradas")).toBeInTheDocument();
  });

  it("shows a not-found state when the farol does not exist", async () => {
    actor.getFarol.mockResolvedValue(null);
    renderDetail();

    expect(await screen.findByTestId("farol.empty_state")).toBeInTheDocument();
    expect(screen.getByText("Farol no encontrado")).toBeInTheDocument();
  });
});
