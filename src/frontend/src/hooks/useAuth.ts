import { useInternetIdentity } from "@caffeineai/core-infrastructure";

/**
 * Thin wrapper over the Internet Identity provider so components never
 * import the provider hook directly. `isAuthenticated` covers both an
 * interactive login and a session restored on page reload.
 */
export function useAuth() {
  const {
    identity,
    login,
    clear,
    loginStatus,
    isInitializing,
    isLoggingIn,
    isLoginError,
    isAuthenticated,
    loginError,
  } = useInternetIdentity();

  return {
    identity,
    principal: identity?.getPrincipal(),
    login,
    logout: clear,
    loginStatus,
    isInitializing,
    isLoggingIn,
    isLoginError,
    isAuthenticated,
    loginError,
  };
}
