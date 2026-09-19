import { createActorMock } from "@/__tests__/helpers";
import { renderWithRouter } from "@/__tests__/router";
import type { LinkedDeviceView } from "@/backend";
import { DispositivosPage } from "@/pages/DispositivosPage";
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

const devices: LinkedDeviceView[] = [
  { id: 1n, name: "Celular de guardia", linkedAt: 1_700_000_000_000_000_000n },
  {
    id: 2n,
    name: "Teléfono de la caseta",
    linkedAt: 1_700_000_100_000_000_000n,
  },
];

function renderDevices() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return renderWithRouter(
    () => (
      <QueryClientProvider client={queryClient}>
        <DispositivosPage />
      </QueryClientProvider>
    ),
    { path: "/dispositivos" },
  );
}

describe("DispositivosPage — linked devices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actor.listDevices.mockResolvedValue(devices);
    actor.linkDevice.mockResolvedValue(undefined);
    actor.unlinkDevice.mockResolvedValue(undefined);
  });

  it("lists every linked device with its name", async () => {
    renderDevices();

    const list = await screen.findByTestId("dispositivos.list");
    const items = list.querySelectorAll("[data-ocid^='device.item.']");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Celular de guardia");
    expect(items[1]).toHaveTextContent("Teléfono de la caseta");
  });

  it("links a new device by name through the backend", async () => {
    const user = userEvent.setup();
    renderDevices();

    await user.click(await screen.findByTestId("dispositivos.link_button"));
    const dialog = await screen.findByTestId("device.link.dialog");
    await user.type(
      within(dialog).getByTestId("device.link.name_input"),
      "Tablet de monitoreo",
    );
    await user.click(within(dialog).getByTestId("device.link.submit_button"));

    await waitFor(() => {
      expect(actor.linkDevice).toHaveBeenCalledWith("Tablet de monitoreo");
    });
  });

  it("unlinks a device only after the confirmation dialog is accepted", async () => {
    const user = userEvent.setup();
    renderDevices();

    await user.click(await screen.findByTestId("device.unlink_button.1"));
    const dialog = await screen.findByTestId("device.unlink.dialog");
    expect(actor.unlinkDevice).not.toHaveBeenCalled();

    await user.click(
      within(dialog).getByTestId("device.unlink.confirm_button"),
    );

    await waitFor(() => {
      expect(actor.unlinkDevice).toHaveBeenCalledWith(1n);
    });
  });

  it("shows the empty state when no device is linked", async () => {
    actor.listDevices.mockResolvedValue([]);
    renderDevices();

    expect(
      await screen.findByTestId("dispositivos.empty_state"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Aún no hay dispositivos vinculados"),
    ).toBeInTheDocument();
  });
});
