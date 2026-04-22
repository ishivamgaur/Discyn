/**
 * Todo Hooks (React Query)
 * Server-state management for todos.
 * Uses todoApi service for data fetching — never calls axios directly.
 */
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import * as todoApi from "../services/todoApi";
import haptics from "../services/hapticsService";

export const useTodos = () => {
  return useQuery({
    queryKey: ["todos"],
    queryFn: todoApi.fetchTodos,
    staleTime: 1000 * 60 * 5,
  });
};

export const useToggleComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todo) => {
      const newStatus = !todo.isCompleted;
      const data = await todoApi.updateTodo(todo._id, {
        isCompleted: newStatus,
      });
      return { ...data, oldStatus: todo.isCompleted };
    },
    onMutate: async (todo) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousTodos = queryClient.getQueryData(["todos"]);

      const newStatus = !todo.isCompleted;
      if (newStatus) {
        haptics.success();
      } else {
        haptics.light();
      }

      queryClient.setQueryData(["todos"], (old) =>
        old?.map((t) =>
          t._id === todo._id ? { ...t, isCompleted: newStatus } : t,
        ),
      );

      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["todos"], context.previousTodos);
      haptics.error();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export const useAddTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todoApi.createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => todoApi.updateTodo(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todoApi.deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export const useStats = (range, year) => {
  return useQuery({
    queryKey: ["stats", range, year],
    queryFn: () => todoApi.fetchStats(range, year),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
};

export const useHistory = (date) => {
  return useQuery({
    queryKey: ["history", date],
    queryFn: () => todoApi.fetchHistory(date),
  });
};
