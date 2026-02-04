import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

// Handle API_URL for Web vs Native
const getApiUrl = () => {
  if (Platform.OS === "web") {
    return "http://localhost:3000"; // Web uses localhost
  }
  return "http://192.168.1.160:3000"; // LAN IP for physical device
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
});

// Helper for storage based on Platform
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
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const deleteItem = async (key) => {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

// Set Token
export const setAuthToken = async (accessToken, refreshToken) => {
  try {
    if (accessToken) {
      await setItem("accessToken", accessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    }
    if (refreshToken) {
      await setItem("refreshToken", refreshToken);
    }
  } catch (error) {
    console.error("Error setting auth token:", error);
  }
};

// Get Token
export const getAccessToken = async () => {
  return await getItem("accessToken");
};

// ... (exports)

let onLogout = null;

export const setLogoutCallback = (callback) => {
  onLogout = callback;
};

// Clear Token
export const logout = async () => {
  try {
    await deleteItem("accessToken");
    await deleteItem("refreshToken");
    delete api.defaults.headers.common["Authorization"];

    if (onLogout) {
      onLogout();
    }
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
// ... (rest of file)

// Axios Interceptor for Refreshing Token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(`${API_URL}/api/users/refresh`, {
          refreshToken,
        });

        await setAuthToken(data.accessToken);

        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        await logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

// Initial Load
export const loadUser = async () => {
  const token = await getAccessToken();
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return true;
  }
  return false;
};

export default api;
