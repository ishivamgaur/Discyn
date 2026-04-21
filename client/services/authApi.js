/**
 * Auth API Service
 * Pure API call functions — no state, no side-effects.
 * Each function returns the server response data.
 */
import api from "./api";

export const loginUser = async ({ email, password }) => {
  const { data } = await api.post("/api/users/login", { email, password });
  return data; // { accessToken, refreshToken, user }
};

export const registerUser = async ({ name, email, password }) => {
  const { data } = await api.post("/api/users/register", {
    name,
    email,
    password,
  });
  return data; // { accessToken, refreshToken, user }
};
