/**
 * Todo API Service
 * Pure API call functions for todo CRUD operations.
 */
import api from "./api";

export const fetchTodos = async () => {
  const { data } = await api.get("/todos");
  return data;
};

export const createTodo = async (payload) => {
  const { data } = await api.post("/todos", payload);
  return data;
};

export const updateTodo = async (id, payload) => {
  const { data } = await api.put(`/todos/${id}`, payload);
  return data;
};

export const deleteTodo = async (id) => {
  await api.delete(`/todos/${id}`);
  return id;
};

export const fetchStats = async (range) => {
  const { data } = await api.get(`/todos/stats?range=${range}`);
  return data;
};

export const fetchHistory = async (date) => {
  const { data } = await api.get("/todos/history", {
    params: { date },
  });
  return data;
};
