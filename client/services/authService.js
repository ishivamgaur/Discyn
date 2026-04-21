/**
 * Auth Service — Backward Compatibility Layer
 * Re-exports from the new modular services.
 * Existing imports like `import api from "../services/authService"` still work.
 */
import api from "./api";
import * as tokenStorage from "./tokenStorage";

// Re-export the axios instance as default (backward compat)
export default api;

// Re-export token functions for anything that still imports them
export const setAuthToken = tokenStorage.setTokens;
export const getAccessToken = tokenStorage.getAccessToken;
export const logout = async () => {
  await tokenStorage.clearTokens();
};
export const loadUser = async () => {
  const token = await tokenStorage.getAccessToken();
  return !!token;
};
