import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import api from "../services/authService";
import haptics from "../services/hapticsService";
import { useCustomAlert } from "../hooks/useCustomAlert";
import CustomAlert from "../components/CustomAlert";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function RoutinesScreen({ navigation }) {
  const { isDark } = useTheme();
  const [routines, setRoutines] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { alertProps, showAlert } = useCustomAlert();

  const fetchRoutines = async () => {
    try {
      const response = await api.get("/todos");
      // Filter client-side for now, or add a query param to API
      const allTodos = response.data;
      const routineList = allTodos.filter(
        (t) => t.type === "ROUTINE" || t.isRecurring,
      );
      setRoutines(routineList);
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRoutines().finally(() => setRefreshing(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRoutines();
    }, []),
  );

  const toggleRoutine = async (item) => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      // Optimistic Update
      const newStatus = !item.isCompleted;
      setRoutines((prev) =>
        prev.map((r) =>
          r._id === item._id ? { ...r, isCompleted: newStatus } : r,
        ),
      );

      if (newStatus) {
        haptics.success();
      } else {
        haptics.light();
      }

      await api.put(`/todos/${item._id}`, { isCompleted: newStatus });
      fetchRoutines(); // Sync
    } catch (error) {
      fetchRoutines(); // Revert
      haptics.error();
    }
  };

  const renderRoutineItem = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate("TodoDetail", { todo: item })}
        className={`flex-row items-center p-4 mb-3 rounded-xl border ${isDark ? "bg-card-dark border-zinc-800" : "bg-white border-zinc-200"}`}
      >
        {/* Rectangular Checkbox */}
        <TouchableOpacity
          onPress={() => toggleRoutine(item)}
          className={`w-6 h-6 mr-4 rounded-md border-2 items-center justify-center ${
            item.isCompleted
              ? "bg-purple-500 border-purple-500"
              : isDark
                ? "border-zinc-600"
                : "border-zinc-400"
          }`}
        >
          {item.isCompleted && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </TouchableOpacity>

        <View className="flex-1">
          <Text
            className={`text-base font-semibold ${item.isCompleted ? (isDark ? "text-zinc-500 decoration-zinc-500 line-through" : "text-zinc-400 decoration-zinc-400 line-through") : isDark ? "text-white" : "text-zinc-900"}`}
          >
            {item.title}
          </Text>
          {item.description ? (
            <Text
              numberOfLines={1}
              className={`text-xs mt-0.5 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}
            >
              {item.description}
            </Text>
          ) : null}
        </View>

        {/* Sync Icon or Streak/Info */}
        <View className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 items-center justify-center">
          <Ionicons
            name="repeat"
            size={14}
            color={isDark ? "#a1a1aa" : "#71717a"}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background-light"}`}
    >
      <View className="px-6 py-4 flex-row justify-between items-center">
        <View>
          <Text
            className={`text-3xl font-bold ${isDark ? "text-white" : "text-black"}`}
          >
            Routines
          </Text>
          <Text
            className={`text-sm font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
          >
            Build better habits
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("AddTodo", { type: "routine" })}
          className={`w-10 h-10 rounded-xl items-center justify-center bg-purple-600`}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={routines}
        keyExtractor={(item) => item._id}
        renderItem={renderRoutineItem}
        contentContainerStyle={{ padding: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? "#fff" : "#000"}
          />
        }
        ListEmptyState={() => (
          <View className="items-center justify-center mt-20 opacity-50">
            <Ionicons
              name="repeat"
              size={64}
              color={isDark ? "#333" : "#ddd"}
            />
            <Text
              className={`mt-4 text-center ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
            >
              No routines found.{"\n"}Start building a habit!
            </Text>
          </View>
        )}
      />

      <CustomAlert {...alertProps} />
    </SafeAreaView>
  );
}
