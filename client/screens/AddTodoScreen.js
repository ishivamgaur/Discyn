import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/authService";
import { useTheme } from "../context/ThemeContext";

import { SafeAreaView } from "react-native-safe-area-context";

export default function AddTodoScreen({ navigation, route }) {
  const { isDark } = useTheme();
  // Safe default if accessed without params
  const initialType = route.params?.type || "task";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [isRecurring, setIsRecurring] = useState(initialType === "routine");

  const handleAddTodo = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Title is required");
      return;
    }

    try {
      await api.post("/todos", {
        title,
        description,
        isRecurring,
        priority,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to add todo");
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className={`flex-1 p-4 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <Text
        className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}
      >
        New Task
      </Text>

      <TextInput
        className={`p-4 rounded-lg mb-4 border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
        placeholder="What needs to be done?"
        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        className={`p-4 rounded-lg mb-6 border h-24 ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
        placeholder="Description (Optional)"
        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
        value={description}
        onChangeText={setDescription}
        textAlignVertical="top"
      />

      {/* Priority Selector */}
      <View className="mb-6">
        <Text
          className={`font-semibold mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          Priority
        </Text>
        <View className="flex-row gap-3">
          {["LOW", "MEDIUM", "HIGH"].map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPriority(p)}
              className={`flex-1 py-3 rounded-lg items-center border ${
                priority === p
                  ? p === "HIGH"
                    ? "bg-red-500 border-red-500"
                    : p === "MEDIUM"
                      ? "bg-orange-500 border-orange-500"
                      : "bg-green-500 border-green-500"
                  : isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`font-bold ${
                  priority === p
                    ? "text-white"
                    : isDark
                      ? "text-gray-400"
                      : "text-gray-600"
                }`}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recurring Toggle */}
      <TouchableOpacity
        className={`flex-row items-center justify-between p-4 rounded-lg mb-6 border ${
          isRecurring
            ? "bg-primary border-primary"
            : isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
        }`}
        onPress={() => setIsRecurring(!isRecurring)}
      >
        <View className="flex-row items-center">
          <Ionicons
            name="repeat"
            size={24}
            color={isRecurring ? "#fff" : isDark ? "#9ca3af" : "#6b7280"}
          />
          <Text
            className={`font-semibold text-base ml-3 ${
              isRecurring
                ? "text-white"
                : isDark
                  ? "text-gray-200"
                  : "text-gray-800"
            }`}
          >
            Daily Habit (Repeats)
          </Text>
        </View>
        <Ionicons
          name={isRecurring ? "checkbox" : "square-outline"}
          size={24}
          color={isRecurring ? "#fff" : isDark ? "#4b5563" : "#d1d5db"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-primary p-4 rounded-lg items-center"
        onPress={handleAddTodo}
      >
        <Text className="text-white font-bold text-lg">Create Task</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
