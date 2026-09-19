import type { backendInterface } from "@/backend";
import type { InternetIdentityContext } from "@caffeineai/core-infrastructure";
import { vi } from "vitest";

/**
 * Typed local actor mock. Every method the app's hooks call is present, so a
 * test that forgets to stub one fails loudly instead of silently returning
 * `undefined`. Tests override only the methods they exercise.
 */
export type ActorMock = {
  [K in keyof backendInterface]: ReturnType<typeof vi.fn>;
};

export function createActorMock(
  overrides: Partial<Record<keyof backendInterface, unknown>> = {},
): ActorMock {
  const base: Record<string, ReturnType<typeof vi.fn>> = {
    addSensor: vi.fn(),
    assignCallerUserRole: vi.fn(),
    execute: vi.fn(),
    getAlert: vi.fn(),
    getApiDoc: vi.fn(),
    getCallerUserRole: vi.fn(),
    getFarol: vi.fn(),
    getSensor: vi.fn(),
    isCallerAdmin: vi.fn(),
    linkDevice: vi.fn(),
    listAlerts: vi.fn().mockResolvedValue([]),
    listDevices: vi.fn().mockResolvedValue([]),
    listFaroles: vi.fn().mockResolvedValue([]),
    listPositions: vi.fn().mockResolvedValue([]),
    listSensors: vi.fn().mockResolvedValue([]),
    markAlertRead: vi.fn(),
    recordReading: vi.fn().mockResolvedValue([]),
    registerFarol: vi.fn(),
    schema: vi.fn(),
    unlinkDevice: vi.fn(),
    updateSensorRange: vi.fn(),
  };

  for (const [key, value] of Object.entries(overrides)) {
    base[key] = vi.fn().mockResolvedValue(value);
  }

  return base as unknown as ActorMock;
}

/**
 * Builds a full `InternetIdentityContext` for the auth seam. Defaults to an
 * authenticated, non-initializing session so tests can render protected UI
 * directly; pass overrides to exercise the login gate.
 */
export function createAuthContext(
  overrides: Partial<InternetIdentityContext> = {},
): InternetIdentityContext {
  const identity = {
    getPrincipal: () => ({
      toText: () => "aaaaa-aa",
      isAnonymous: () => false,
    }),
  } as unknown as InternetIdentityContext["identity"];

  return {
    identity,
    login: vi.fn(),
    clear: vi.fn(),
    loginStatus: "success",
    isInitializing: false,
    isLoginIdle: false,
    isLoggingIn: false,
    isLoginSuccess: true,
    isLoginError: false,
    isAuthenticated: true,
    loginError: undefined,
    ...overrides,
  };
}
