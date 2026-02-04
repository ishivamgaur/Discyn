import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  UIManager,
  LayoutAnimation,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/authService";
import { useTheme } from "../context/ThemeContext";
import CustomAlert from "../components/CustomAlert";
import { useCustomAlert } from "../hooks/useCustomAlert";

// Enable LayoutAnimation on Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen({ navigation }) {
  const { isDark } = useTheme();
  const [todos, setTodos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks"); // 'tasks' or 'habits'
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'pending', 'completed'

  const { alertProps, showAlert } = useCustomAlert();
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null); // For long-press actions

  const filteredTodos = todos.filter((t) => {
    const matchesTab = activeTab === "tasks" ? !t.isRecurring : t.isRecurring;
    if (!matchesTab) return false;
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
      // Silent error on fetch
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

  const deleteTodo = async (idOfTodo) => {
    const id = idOfTodo || itemToDelete;
    if (!id) return;

    // Alert is handled by confirmDelete trigger, this function just executes
    try {
      setDeletingId(id);
      if (Platform.OS !== "web") {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      await api.delete(`/todos/${id}`);
      fetchTodos();
    } catch (error) {
      showAlert({ title: "Error", message: "Failed to delete todo" });
    } finally {
      setDeletingId(null);
      setItemToDelete(null);
      setSelectedId(null);
    }
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    showAlert({
      title: "Delete Task",
      message: "Are you sure you want to remove this task?",
      confirmText: "Delete",
      confirmColor: "bg-red-500",
      onCancel: () => {}, // Show cancel
      onConfirm: () => {
        deleteTodo(id);
      },
    });
  };

  const toggleComplete = async (item) => {
    try {
      // Optimistic update
      setTodos((prev) =>
        prev.map((t) =>
          t._id === item._id ? { ...t, isCompleted: !t.isCompleted } : t,
        ),
      );
      await api.put(`/todos/${item._id}`, { isCompleted: !item.isCompleted });
      fetchTodos();
    } catch (e) {
      showAlert({ title: "Error", message: "Failed to update status" });
      fetchTodos(); // Revert
    }
  };

  // Clear selection when tapping elsewhere
  const clearSelection = () => {
    if (selectedId) setSelectedId(null);
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedId === item._id;
    const isDeleting = deletingId === item._id;

    // Priority Background Colors (Light/Pastel for Light Mode, Darker Tint for Dark Mode)
    let bgColorClass = isDark ? "bg-card-dark" : "bg-white";
    let priorityColor = isDark ? "#ffffff" : "#000000";

    if (!isDark) {
      if (item.priority === "HIGH") bgColorClass = "bg-red-50 border-red-100";
      else if (item.priority === "MEDIUM")
        bgColorClass = "bg-orange-50 border-orange-100";
      else if (item.priority === "LOW")
        bgColorClass = "bg-green-50 border-green-100";
    } else {
      // Dark mode subtle tints
      if (item.priority === "HIGH")
        bgColorClass = "bg-red-900/20 border-red-900/50";
      else if (item.priority === "MEDIUM")
        bgColorClass = "bg-orange-900/20 border-orange-900/50";
      else if (item.priority === "LOW")
        bgColorClass = "bg-green-900/20 border-green-900/50";
    }

    if (viewMode === "grid") {
      // ... Grid View Implementation (simplified for brevity, focusing on List View first as per request)
      // You can replicate logic here if needed
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            isSelected
              ? setSelectedId(null)
              : navigation.navigate("TodoDetail", { todo: item })
          }
          onLongPress={() => setSelectedId(item._id)}
          className={`flex-1 m-2 p-4 rounded-xl border ${bgColorClass} ${
            isSelected ? "border-indigo-500 border-2" : ""
          }`}
          style={{ elevation: 2 }}
        >
          {isSelected ? (
            <View className="flex-1 justify-center items-center gap-2">
              <TouchableOpacity
                onPress={() => toggleComplete(item)}
                className="bg-green-500 p-2 rounded-full w-full items-center"
              >
                <Text className="text-white font-bold">Done</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => confirmDelete(item._id)}
                className="bg-red-500 p-2 rounded-full w-full items-center"
              >
                <Text className="text-white font-bold">Delete</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View className="flex-row justify-between mb-2">
                <View
                  className={`px-2 py-0.5 rounded text-xs ${
                    item.priority === "HIGH"
                      ? "bg-red-100 dark:bg-red-900"
                      : item.priority === "MEDIUM"
                        ? "bg-orange-100 dark:bg-orange-900"
                        : "bg-green-100 dark:bg-green-900"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold ${
                      item.priority === "HIGH"
                        ? "text-red-700 dark:text-red-300"
                        : item.priority === "MEDIUM"
                          ? "text-orange-700 dark:text-orange-300"
                          : "text-green-700 dark:text-green-300"
                    }`}
                  >
                    {item.priority}
                  </Text>
                </View>
                {item.isRecurring && <Text>🔄</Text>}
              </View>
              <Text
                numberOfLines={3}
                className={`text-base font-bold ${
                  item.isCompleted
                    ? "line-through text-gray-400"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                {item.title}
              </Text>
            </>
          )}
        </TouchableOpacity>
      );
    }

    // List View (Primary Focus)
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate("TodoDetail", { todo: item })}
        onLongPress={() => confirmDelete(item._id)}
        className={`mx-4 mb-3 rounded-2xl overflow-hidden border ${
          isSelected ? "border-indigo-500 border-2" : "border-transparent"
        }`}
        style={{
          elevation: isSelected ? 8 : 2,
          shadowColor: isSelected ? "#4f46e5" : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isSelected ? 0.3 : 0.05,
          shadowRadius: 8,
          backgroundColor: isDark ? "#1f2937" : "transparent", // Base bg handled by inner view
        }}
      >
        <View className={`p-4 flex-row items-center ${bgColorClass}`}>
          {/* Done Checkbox */}
          <TouchableOpacity
            onPress={() => toggleComplete(item)}
            className="mr-3"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View
              className={`w-6 h-6 rounded-full border-2 justify-center items-center ${
                item.isCompleted
                  ? "bg-green-500 border-green-500"
                  : isDark
                    ? "border-gray-500"
                    : "border-gray-400"
              }`}
            >
              {item.isCompleted && (
                <Ionicons name="checkmark" size={14} color="white" />
              )}
            </View>
          </TouchableOpacity>

          {/* Priority Strip (Left) - Adjusted position or removed if redundant */}
          <View
            className={`w-1.5 h-full absolute left-0 top-0 bottom-0 ${
              item.priority === "HIGH"
                ? "bg-red-500"
                : item.priority === "MEDIUM"
                  ? "bg-orange-500"
                  : "bg-green-500"
            }`}
          />

          <View className="flex-1 ml-3">
            <View className="flex-row justify-between items-start">
              <Text
                numberOfLines={1}
                className={`text-lg font-bold mb-1 ${
                  item.isCompleted
                    ? "line-through text-gray-400"
                    : isDark
                      ? "text-white"
                      : "text-gray-800"
                }`}
              >
                {item.title}
              </Text>
              {item.isRecurring && <Text className="text-xs">🔄</Text>}
            </View>

            {item.description ? (
              <Text
                numberOfLines={1}
                className={`text-sm mb-2 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {item.description}
              </Text>
            ) : null}

            {/* Tags / Meta */}
            <View className="flex-row gap-2 mt-1">
              <View
                className={`px-2 py-0.5 rounded-md ${
                  item.priority === "HIGH"
                    ? "bg-red-100 dark:bg-red-900/40"
                    : item.priority === "MEDIUM"
                      ? "bg-orange-100 dark:bg-orange-900/40"
                      : "bg-green-100 dark:bg-green-900/40"
                }`}
              >
                <Text
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    item.priority === "HIGH"
                      ? "text-red-700 dark:text-red-300"
                      : item.priority === "MEDIUM"
                        ? "text-orange-700 dark:text-orange-300"
                        : "text-green-700 dark:text-green-300"
                  }`}
                >
                  {item.priority}
                </Text>
              </View>
              {item.isCompleted && (
                <View className="bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-md">
                  <Text className="text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase">
                    Completed
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Hint Arrow */}
          <Ionicons
            name="chevron-forward"
            size={16}
            color={isDark ? "#4b5563" : "#9ca3af"}
          />

          {isDeleting && (
            <View className="absolute inset-0 bg-white/50 dark:bg-black/50 justify-center items-center rounded-2xl">
              <ActivityIndicator color={priorityColor} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-100"}`}
    >
      {/* Header / Tabs */}
      <View className="flex-row px-4 pt-4 pb-4">
        <TouchableOpacity
          onPress={() => setActiveTab("tasks")}
          className={`flex-1 py-3 rounded-l-xl border-y border-l items-center ${
            activeTab === "tasks"
              ? "bg-primary border-primary"
              : isDark
                ? "bg-card-dark border-gray-700"
                : "bg-white border-gray-200"
          }`}
        >
          <Text
            className={`font-bold ${
              activeTab === "tasks"
                ? "text-white"
                : isDark
                  ? "text-gray-400"
                  : "text-gray-600"
            }`}
          >
            Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("habits")}
          className={`flex-1 py-3 rounded-r-xl border-y border-r items-center ${
            activeTab === "habits"
              ? "bg-primary border-primary"
              : isDark
                ? "bg-card-dark border-gray-700"
                : "bg-white border-gray-200"
          }`}
        >
          <Text
            className={`font-bold ${
              activeTab === "habits"
                ? "text-white"
                : isDark
                  ? "text-gray-400"
                  : "text-gray-600"
            }`}
          >
            Routines 🔄
          </Text>
        </TouchableOpacity>
      </View>
      {/* Filter Chips - iOS Scroll Indicator Hidden */}
      <View className="px-4 mb-2">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={["all", "pending", "completed"]}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilterStatus(item)}
              className={`px-4 py-1.5 rounded-full mr-2 border ${
                filterStatus === item
                  ? "bg-indigo-100 border-indigo-200"
                  : isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`capitalize text-xs font-medium ${
                  filterStatus === item
                    ? "text-indigo-700"
                    : isDark
                      ? "text-gray-400"
                      : "text-gray-600"
                }`}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <FlatList
        key={viewMode} // Forces re-render when switching columns
        numColumns={viewMode === "grid" ? 2 : 1}
        data={filteredTodos}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        columnWrapperStyle={
          viewMode === "grid" ? { paddingHorizontal: 8 } : undefined
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? "#fff" : "#000"}
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Text
              className={`text-lg ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {filterStatus !== "all"
                ? `No ${filterStatus} items found 🔍`
                : activeTab === "tasks"
                  ? "No tasks for today! 🌤️"
                  : "No routines set! 🌱"}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingVertical: 10, paddingBottom: 100 }}
      />
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-primary w-16 h-16 rounded-full justify-center items-center shadow-lg shadow-indigo-500/50"
        onPress={() =>
          navigation.navigate("AddTodo", {
            type: activeTab === "habits" ? "routine" : "task",
          })
        }
        style={
          Platform.OS === "ios"
            ? {
                shadowColor: "#4f46e5",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }
            : { elevation: 8 }
        }
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
      <CustomAlert {...alertProps} />
    </SafeAreaView>
  );
}
