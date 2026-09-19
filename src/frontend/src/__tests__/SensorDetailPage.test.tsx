import { createActorMock } from "@/__tests__/helpers";
import { renderWithRouter } from "@/__tests__/router";
import {
  AlertReason,
  type AlertView,
  SensorStatus,
  SensorType,
  type SensorView,
} from "@/backend";
import { SensorDetailPage } from "@/pages/SensorDetailPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
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
  lastValue: 22,
  lastReadingAt: 1_700_000_000_000_000_000n,
  status: SensorStatus.normal,
};

const aboveMaxAlert: AlertView = {
  id: 99n,
  sensorId: 5n,
  reason: AlertReason.aboveMax,
  value: 55,
  message:
    "Temperatura norte: valor por encima del máximo (55 °C, máximo 40 °C)",
  createdAt: 1_700_000_500_000_000_000n,
  read: false,
};

function renderDetail() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return renderWithRouter(
    () => (
      <QueryClientProvider client={queryClient}>
        <SensorDetailPage />
      </QueryClientProvider>
    ),
    { path: "/sensores/$sensorId", initialPath: "/sensores/5" },
  );
}

describe("SensorDetailPage — configurable range and automatic alerts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actor.getSensor.mockResolvedValue(sensor);
    actor.listFaroles.mockResolvedValue([]);
    actor.updateSensorRange.mockResolvedValue({
      ...sensor,
      minValue: 5,
      maxValue: 30,
    });
    actor.recordReading.mockResolvedValue([aboveMaxAlert]);
  });

  it("saves a new min/max range through the backend", async () => {
    const user = userEvent.setup();
    renderDetail();

    const minInput = await screen.findByTestId("sensor.range_min.input");
    const maxInput = screen.getByTestId("sensor.range_max.input");

    await user.clear(minInput);
    await user.type(minInput, "5");
    await user.clear(maxInput);
    await user.type(maxInput, "30");
    await user.click(screen.getByTestId("sensor.range_save_button"));

    await waitFor(() => {
      expect(actor.updateSensorRange).toHaveBeenCalledWith(5n, 5, 30);
    });
    expect(
      await screen.findByTestId("sensor.range_success_state"),
    ).toBeInTheDocument();
  });

  it("rejects a range whose minimum is not below the maximum", async () => {
    const user = userEvent.setup();
    renderDetail();

    const minInput = await screen.findByTestId("sensor.range_min.input");
    const maxInput = screen.getByTestId("sensor.range_max.input");

    await user.clear(minInput);
    await user.type(minInput, "50");
    await user.clear(maxInput);
    await user.type(maxInput, "10");

    expect(screen.getByTestId("sensor.range_error")).toHaveTextContent(
      "El mínimo debe ser menor que el máximo.",
    );
    expect(screen.getByTestId("sensor.range_save_button")).toBeDisabled();
    expect(actor.updateSensorRange).not.toHaveBeenCalled();
  });

  it("records a reading and reports the automatically generated alert", async () => {
    const user = userEvent.setup();
    renderDetail();

    const input = await screen.findByTestId("sensor.reading.input");
    await user.type(input, "55");
    await user.click(screen.getByTestId("sensor.reading_submit_button"));

    await waitFor(() => {
      expect(actor.recordReading).toHaveBeenCalledWith(5n, 55);
    });
    expect(
      await screen.findByTestId("sensor.reading_success_state"),
    ).toHaveTextContent("Se generaron 1 alerta(s).");
  });

  it("reports a reading inside the range without generating alerts", async () => {
    const user = userEvent.setup();
    actor.recordReading.mockResolvedValue([]);
    renderDetail();

    const input = await screen.findByTestId("sensor.reading.input");
    await user.type(input, "22");
    await user.click(screen.getByTestId("sensor.reading_submit_button"));

    expect(
      await screen.findByTestId("sensor.reading_success_state"),
    ).toHaveTextContent("Lectura registrada dentro del rango configurado.");
  });
});
