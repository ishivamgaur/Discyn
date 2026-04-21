/**
 * Auth Store (Zustand)
 * Manages authentication state + async actions.
 * Screens never touch API or token storage directly — they call store actions.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as tokenStorage from "../services/tokenStorage";
import * as authApi from "../services/authApi";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ────────────────────────────────────────────
      isLoggedIn: false,
      user: null,

      // ── Actions ──────────────────────────────────────────
      login: async ({ email, password }) => {
        const { accessToken, refreshToken, user } = await authApi.loginUser({
          email,
          password,
        });
        await tokenStorage.setTokens(accessToken, refreshToken);
        set({ isLoggedIn: true, user });
      },

      register: async ({ name, email, password }) => {
        const { accessToken, refreshToken, user } =
          await authApi.registerUser({ name, email, password });
        await tokenStorage.setTokens(accessToken, refreshToken);
        set({ isLoggedIn: true, user });
      },

      logout: async () => {
        await tokenStorage.clearTokens();
        set({ isLoggedIn: false, user: null });
      },

      /** Called by the API interceptor on refresh failure */
      forceLogout: () => {
        tokenStorage.clearTokens();
        set({ isLoggedIn: false, user: null });
      },

      /** Called on app boot to hydrate from stored tokens */
      loadSession: async () => {
        const token = await tokenStorage.getAccessToken();
        if (token) {
          set({ isLoggedIn: true });
          return true;
        }
        return false;
      },
    }),
    {
      name: "discyn-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
      }),
    },
  ),
);
