import App from "@/App";
import { createAuthContext } from "@/__tests__/helpers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useInternetIdentity = vi.fn();

vi.mock("@caffeineai/core-infrastructure", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@caffeineai/core-infrastructure")>();
  return {
    ...actual,
    useInternetIdentity: () => useInternetIdentity(),
    useActor: () => ({ actor: null, isFetching: false }),
  };
});

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

describe("App auth gate", () => {
  beforeEach(() => {
    useInternetIdentity.mockReset();
  });

  it("shows the Internet Identity login screen when there is no session", () => {
    useInternetIdentity.mockReturnValue(
      createAuthContext({
        identity: undefined,
        isAuthenticated: false,
        loginStatus: "idle",
        isLoginIdle: true,
        isLoginSuccess: false,
      }),
    );

    renderApp();

    expect(screen.getByTestId("login.page")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Iniciar sesión con Internet Identity",
      }),
    ).toBeInTheDocument();
    // No protected content leaks through the gate.
    expect(screen.queryByTestId("app.main")).not.toBeInTheDocument();
  });

  it("shows a neutral splash while the stored identity is still loading", () => {
    useInternetIdentity.mockReturnValue(
      createAuthContext({
        identity: undefined,
        isAuthenticated: false,
        loginStatus: "initializing",
        isInitializing: true,
        isLoginSuccess: false,
      }),
    );

    renderApp();

    expect(screen.getByTestId("app.loading_state")).toBeInTheDocument();
    expect(screen.getByText("Verificando sesión…")).toBeInTheDocument();
    expect(screen.queryByTestId("login.page")).not.toBeInTheDocument();
  });

  it("renders the authenticated shell once a session exists", async () => {
    useInternetIdentity.mockReturnValue(createAuthContext());

    renderApp();

    expect(await screen.findByTestId("app.main")).toBeInTheDocument();
    expect(screen.queryByTestId("login.page")).not.toBeInTheDocument();
  });
});
