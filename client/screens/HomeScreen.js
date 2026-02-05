import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Platform,
  UIManager,
  LayoutAnimation,
  ActivityIndicator,
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../services/authService";
import { useTheme } from "../context/ThemeContext";
import haptics from "../services/hapticsService";
import CustomAlert from "../components/CustomAlert";
import { useCustomAlert } from "../hooks/useCustomAlert";
import DailyTimeline from "../components/DailyTimeline";

// Enable LayoutAnimation
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen({ navigation }) {
  const { isDark } = useTheme();
  const [todos, setTodos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const { alertProps, showAlert } = useCustomAlert();
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Separate Habits (Recurring) and One-off Tasks
  const habits = todos.filter((t) => t.isRecurring);
  const oneOffTasks = todos.filter((t) => !t.isRecurring);

  const filteredTasks = oneOffTasks.filter((t) => {
    if (filterStatus === "pending") return !t.isCompleted;
    if (filterStatus === "completed") return t.isCompleted;
    return true;
  });

  const fetchTodos = async () => {
    try {
      const response = await api.get("/todos");
      setTodos(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTodos().finally(() => setRefreshing(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTodos();
    }, []),
  );

  const deleteTodo = async (id) => {
    try {
      setDeletingId(id);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await api.delete(`/todos/${id}`);
      fetchTodos();
    } catch (error) {
      showAlert({ title: "Error", message: "Failed to delete item" });
    } finally {
      setDeletingId(null);
      setItemToDelete(null);
    }
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    showAlert({
      title: "Confirm Deletion",
      message: "This action cannot be undone.",
      confirmText: "Delete",
      confirmColor: "bg-red-500",
      onConfirm: () => deleteTodo(id),
    });
  };

  const toggleComplete = async (item) => {
    try {
      // Animate list layout changes
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      // Optimistic
      setTodos((prev) =>
        prev.map((t) =>
          t._id === item._id ? { ...t, isCompleted: !item.isCompleted } : t,
        ),
      );

      // Trigger Haptic
      if (!item.isCompleted) {
        haptics.success(); // Task is being marked as completed
      } else {
        haptics.light(); // Task is being marked as incomplete
      }

      await api.put(`/todos/${item._id}`, { isCompleted: !item.isCompleted });
      // Background sync
      fetchTodos();
    } catch (e) {
      fetchTodos(); // Revert on fail
    }
  };

  // --- Render Components ---

  const renderTaskItem = ({ item }) => {
    const isDeleting = deletingId === item._id;

    // Priority Dot Color
    const priorityColor =
      item.priority === "HIGH"
        ? "bg-red-500"
        : item.priority === "MEDIUM"
          ? "bg-orange-400"
          : "bg-blue-400";

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate("TodoDetail", { todo: item })}
        onLongPress={() => confirmDelete(item._id)}
        className={`mb-3 mx-4 p-4 rounded-2xl flex-row items-center border ${
          isDark
            ? "bg-card-dark border-card-highlight-dark"
            : "bg-white border-border-light"
        }`}
        style={{
          // Subtle shadow for depth
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0 : 0.05,
          shadowRadius: 4,
          elevation: isDark ? 0 : 2,
        }}
      >
        {/* Check Circle */}
        <TouchableOpacity
          hitSlop={10}
          onPress={() => toggleComplete(item)}
          className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
            item.isCompleted
              ? "bg-primary border-primary"
              : isDark
                ? "border-zinc-600"
                : "border-zinc-300"
          }`}
        >
          {item.isCompleted && (
            <Ionicons name="checkmark" size={14} color="white" />
          )}
        </TouchableOpacity>

        {/* Content */}
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className={`text-base font-semibold ${
              item.isCompleted
                ? "line-through text-text-muted dark:text-text-muted-dark"
                : isDark
                  ? "text-text-dark"
                  : "text-text-light"
            }`}
          >
            {item.title}
          </Text>
          {item.description ? (
            <Text
              numberOfLines={1}
              className="text-xs text-text-muted dark:text-text-muted-dark mt-0.5"
            >
              {item.description}
            </Text>
          ) : null}
        </View>

        {/* Priority Dot */}
        <View className={`w-2 h-2 rounded-full ${priorityColor} ml-2`} />

        {isDeleting && (
          <View className="absolute inset-0 bg-black/10 dark:bg-black/50 rounded-2xl justify-center items-center">
            <ActivityIndicator size="small" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background-light"}`}
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <View className="px-4 py-4 flex-row justify-between items-center">
        <View>
          <Text
            className={`text-3xl font-bold ${isDark ? "text-white" : "text-black"}`}
          >
            Good Day
          </Text>
          <Text
            className={`text-sm font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("AddTodo", { type: "task" })}
          className="w-10 h-10 bg-primary rounded-full items-center justify-center"
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? "#fff" : "#000"}
          />
        }
      >
        {/* Stories / Habits Section Removed - Moved to Routines Tab */}
        {/* Daily Timeline */}
        <DailyTimeline
          tasks={todos}
          onTaskPress={(task) =>
            navigation.navigate("TodoDetail", { todo: task })
          }
        />
        {/* Tasks Section Header */}
        <View className="flex-row items-center justify-between px-6 mb-2">
          <Text
            className={`text-lg font-bold ${isDark ? "text-white" : "text-black"}`}
          >
            Tasks
          </Text>
          {/* Minimal Filter */}
          <TouchableOpacity
            onPress={() =>
              setFilterStatus((prev) => (prev === "all" ? "pending" : "all"))
            }
          >
            <Text className="text-primary font-medium text-sm">
              {filterStatus === "all" ? "Show All" : "Pending Only"}
            </Text>
          </TouchableOpacity>
        </View>
        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <View className="items-center justify-center py-10 opacity-50">
            <Ionicons
              name="leaf-outline"
              size={48}
              color={isDark ? "#555" : "#ccc"}
            />
            <Text
              className={`mt-2 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
            >
              No tasks found. Enjoy your day!
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item._id}
            renderItem={renderTaskItem}
            scrollEnabled={false} // Let parent ScrollView handle it
          />
        )}
      </ScrollView>

      <CustomAlert {...alertProps} />
    </SafeAreaView>
  );
}
