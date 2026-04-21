/**
 * Token Storage Service
 * Single Responsibility: Persist / retrieve / clear auth tokens.
 * Uses SecureStore on native, AsyncStorage on web.
 */
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// ── Platform-agnostic helpers ────────────────────────────────
const setItem = async (key, value) => {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getItem = async (key) => {
  if (Platform.OS === "web") {
    return await AsyncStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
};

const deleteItem = async (key) => {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

// ── Public API ───────────────────────────────────────────────
export const getAccessToken = () => getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => getItem(REFRESH_TOKEN_KEY);

export const setTokens = async (accessToken, refreshToken) => {
  if (accessToken) await setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) await setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = async () => {
  await deleteItem(ACCESS_TOKEN_KEY);
  await deleteItem(REFRESH_TOKEN_KEY);
};
