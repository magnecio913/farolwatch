import { createActorMock } from "@/__tests__/helpers";
import { renderWithRouter } from "@/__tests__/router";
import type { FarolView } from "@/backend";
import { ScanPage } from "@/pages/ScanPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const actor = createActorMock();
const qrResults: { data: string; timestamp: number }[] = [];

vi.mock("@caffeineai/core-infrastructure", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@caffeineai/core-infrastructure")>();
  return {
    ...actual,
    useActor: () => ({ actor, isFetching: false }),
  };
});

vi.mock("@caffeineai/qr-code", () => ({
  useQRScanner: () => ({
    qrResults,
    isScanning: false,
    isActive: false,
    isSupported: true,
    error: null,
    isLoading: false,
    canStartScanning: true,
    startScanning: vi.fn(),
    stopScanning: vi.fn(),
    switchCamera: vi.fn(),
    clearResults: vi.fn(),
    retry: vi.fn(),
    videoRef: { current: null },
    canvasRef: { current: null },
  }),
}));

function renderScanPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return renderWithRouter(
    () => (
      <QueryClientProvider client={queryClient}>
        <ScanPage />
      </QueryClientProvider>
    ),
    { path: "/escanear" },
  );
}

const registeredFarol: FarolView = {
  id: 7n,
  name: "Farol Parque Central",
  qrCode: "FARO-ABC123",
  latitude: 19.43261,
  longitude: -99.13321,
  registeredAt: 1_700_000_000_000_000_000n,
};

describe("ScanPage — QR scan captures GPS and registers the farol", () => {
  beforeEach(() => {
    qrResults.length = 0;
    vi.clearAllMocks();
    actor.registerFarol.mockResolvedValue(registeredFarol);
    Object.defineProperty(globalThis.navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (
          success: (position: GeolocationPosition) => void,
        ) => {
          success({
            coords: {
              latitude: 19.43261,
              longitude: -99.13321,
            },
          } as GeolocationPosition);
        },
      },
    });
  });

  it("captures the device position and submits it with the scanned code", async () => {
    const user = userEvent.setup();
    qrResults.push({ data: "FARO-ABC123", timestamp: Date.now() });

    renderScanPage();

    // The scanned payload is shown and the GPS capture resolves to a ready state.
    expect(await screen.findByText("FARO-ABC123")).toBeInTheDocument();
    expect(
      await screen.findByText("Ubicación capturada correctamente."),
    ).toBeInTheDocument();

    await user.type(
      screen.getByTestId("escanear.name_input"),
      "Farol Parque Central",
    );
    await user.click(screen.getByTestId("escanear.submit_button"));

    await waitFor(() => {
      expect(actor.registerFarol).toHaveBeenCalledWith(
        "FARO-ABC123",
        "Farol Parque Central",
        19.43261,
        -99.13321,
      );
    });

    // Success state confirms the captured location and the QR code.
    expect(
      await screen.findByTestId("escanear.success_state"),
    ).toBeInTheDocument();
    expect(screen.getByText("Farol registrado")).toBeInTheDocument();
    expect(screen.getAllByText("19.43261, -99.13321").length).toBeGreaterThan(
      0,
    );
  });

  it("keeps the submit disabled until a code and a location are available", async () => {
    renderScanPage();

    expect(await screen.findByTestId("escanear.submit_button")).toBeDisabled();
    expect(
      screen.getByText("Escanea un código QR para continuar."),
    ).toBeInTheDocument();
  });

  it("surfaces a geolocation error instead of registering without a position", async () => {
    Object.defineProperty(globalThis.navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (
          _success: unknown,
          error: (err: GeolocationPositionError) => void,
        ) => {
          error({
            code: 1,
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
            message: "denied",
          } as GeolocationPositionError);
        },
      },
    });
    qrResults.push({ data: "FARO-DENIED", timestamp: Date.now() });

    renderScanPage();

    expect(
      await screen.findByText(/Permiso de ubicación denegado/),
    ).toBeInTheDocument();
    expect(screen.getByTestId("escanear.submit_button")).toBeDisabled();
    expect(actor.registerFarol).not.toHaveBeenCalled();
  });
});
