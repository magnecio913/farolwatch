import { createActorMock } from "@/__tests__/helpers";
import { renderWithRouter } from "@/__tests__/router";
import {
  AlertReason,
  type AlertView,
  SensorStatus,
  SensorType,
  type SensorView,
} from "@/backend";
import { AlertasPage } from "@/pages/AlertasPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

const sensor: SensorView = {
  id: 5n,
  name: "Temperatura norte",
  qrCode: "SENSOR-TEMP-1",
  sensorType: SensorType.temperature,
  farolId: 3n,
  unit: "°C",
  minValue: 0,
  maxValue: 40,
  lastValue: 55,
  lastReadingAt: 1_700_000_500_000_000_000n,
  status: SensorStatus.outOfRange,
};

const unreadAlert: AlertView = {
  id: 99n,
  sensorId: 5n,
  reason: AlertReason.aboveMax,
  value: 55,
  message:
    "Temperatura norte: valor por encima del máximo (55 °C, máximo 40 °C)",
  createdAt: 1_700_000_500_000_000_000n,
  read: false,
};

const readAlert: AlertView = {
  id: 98n,
  sensorId: 5n,
  reason: AlertReason.belowMin,
  value: -3,
  message:
    "Temperatura norte: valor por debajo del mínimo (-3 °C, mínimo 0 °C)",
  createdAt: 1_700_000_400_000_000_000n,
  read: true,
};

function renderAlerts() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return renderWithRouter(
    () => (
      <QueryClientProvider client={queryClient}>
        <AlertasPage />
      </QueryClientProvider>
    ),
    { path: "/alertas" },
  );
}

describe("AlertasPage — alert history and detail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actor.listAlerts.mockResolvedValue([unreadAlert, readAlert]);
    actor.listSensors.mockResolvedValue([sensor]);
    actor.markAlertRead.mockResolvedValue(undefined);
  });

  it("lists alerts newest first and counts only the unread ones", async () => {
    renderAlerts();

    const list = await screen.findByTestId("alertas.list");
    const items = list.querySelectorAll("[data-ocid^='alert.item.']");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Sin leer");
    expect(items[1]).toHaveTextContent("Leída");

    // Exactly one row carries the unread badge, and the header counter shows 1.
    expect(within(list).getAllByText("Sin leer")).toHaveLength(1);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("opens the detail dialog explaining which sensor and value triggered the alert", async () => {
    const user = userEvent.setup();
    renderAlerts();

    await user.click(await screen.findByTestId("alert.item.1"));

    const dialog = await screen.findByTestId("alert.detail.dialog");
    expect(within(dialog).getByText("Temperatura norte")).toBeInTheDocument();
    expect(within(dialog).getByText("55 °C")).toBeInTheDocument();
    expect(within(dialog).getByText("0 °C — 40 °C")).toBeInTheDocument();
    expect(
      within(dialog).getByText(/valor por encima del máximo/),
    ).toBeInTheDocument();
  });

  it("marks an unread alert as read through the backend", async () => {
    const user = userEvent.setup();
    renderAlerts();

    await user.click(await screen.findByTestId("alert.item.1"));
    await user.click(
      await screen.findByTestId("alert.detail.mark_read_button"),
    );

    await waitFor(() => {
      expect(actor.markAlertRead).toHaveBeenCalledWith(99n);
    });
  });

  it("shows the empty state when there are no alerts", async () => {
    actor.listAlerts.mockResolvedValue([]);
    renderAlerts();

    expect(
      await screen.findByTestId("alertas.empty_state"),
    ).toBeInTheDocument();
    expect(screen.getByText("Todo en orden")).toBeInTheDocument();
  });
});
