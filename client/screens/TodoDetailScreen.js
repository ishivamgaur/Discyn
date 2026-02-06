import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import api from "../services/authService";
import haptics from "../services/hapticsService";
import { Ionicons } from "@expo/vector-icons";
import { useCustomAlert } from "../hooks/useCustomAlert";
import CustomAlert from "../components/CustomAlert";
import {
  cancelReminders,
  handleTaskScheduling,
} from "../services/notificationService";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TodoDetailScreen({ route, navigation }) {
  const { todo } = route.params;
  const { isDark } = useTheme();
  const { alertProps, showAlert } = useCustomAlert();

  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(todo.isCompleted);

  const handleSave = async () => {
    if (!title.trim()) {
      haptics.error();
      showAlert({ title: "Validation", message: "Title cannot be empty" });
      return;
    }

    setIsSaving(true);
    try {
      await api.put(`/todos/${todo._id}`, { title, description, isCompleted });
      haptics.success();
      navigation.goBack();
    } catch (error) {
      console.error(error);
      haptics.error();
      showAlert({
        title: "Error",
        message: "Failed to update task",
        confirmColor: "bg-red-500",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    haptics.medium(); // Warning impact
    showAlert({
      title: "Delete Task",
      message:
        "Are you sure you want to remove this task? This cannot be undone.",
      confirmText: "Delete",
      confirmColor: "bg-red-500",
      icon: "trash-outline",
      iconColor: "#ef4444",
      onCancel: () => {}, // Show cancel button
      onConfirm: async () => {
        try {
          await cancelReminders(todo._id); // Cleanup reminders
          await api.delete(`/todos/${todo._id}`);
          haptics.success();
          navigation.goBack();
        } catch (error) {
          haptics.error();
          showAlert({ title: "Error", message: "Failed to delete task" });
        }
      },
    });
  };

  const toggleComplete = async () => {
    try {
      const newStatus = !isCompleted;
      setIsCompleted(newStatus); // Optimistic UI

      if (newStatus) {
        haptics.success();
        await cancelReminders(todo._id);
      } else {
        haptics.light();
        if (todo.scheduledTime && new Date(todo.scheduledTime) > new Date()) {
          await handleTaskScheduling(todo);
        }
      }

      await api.put(`/todos/${todo._id}`, { isCompleted: newStatus });
    } catch (error) {
      setIsCompleted(!isCompleted); // Revert
      haptics.error();
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background-light"}`}
    >
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-primary text-base font-medium">Cancel</Text>
        </TouchableOpacity>
        <Text
          className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Details
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          <Text
            className={`text-base font-bold ${isSaving ? "text-zinc-400" : "text-primary"}`}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background-light"}`}
      >
        <ScrollView className="flex-1 p-6">
          {/* Title Input */}
          <View className="mb-6">
            <Text
              className={`text-sm font-bold mb-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
            >
              TITLE
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              className={`text-2xl font-bold p-0 ${isDark ? "text-white" : "text-gray-900"}`}
              placeholder="Task Title"
              placeholderTextColor={isDark ? "#52525b" : "#d4d4d8"}
              multiline
            />
          </View>

          {/* Description Input */}
          <View className="mb-8">
            <Text
              className={`text-sm font-bold mb-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
            >
              NOTES
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              className={`text-base p-0 h-40 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              placeholder="Add notes..."
              placeholderTextColor={isDark ? "#52525b" : "#d4d4d8"}
              textAlignVertical="top"
            />
          </View>

          {/* Schedule Info Card */}
          {(todo.scheduledTime ||
            todo.type === "ROUTINE" ||
            todo.reminderType === "NAGGING") && (
            <View
              className={`p-4 rounded-2xl mb-6 ${isDark ? "bg-card-dark" : "bg-white"}`}
            >
              <View className="flex-row items-center gap-2 mb-3">
                <Ionicons
                  name="calendar"
                  size={20}
                  color={isDark ? "#a1a1aa" : "#71717a"}
                />
                <Text
                  className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Schedule Details
                </Text>
              </View>

              {todo.scheduledTime && (
                <View className="flex-row justify-between mb-2">
                  <Text className={isDark ? "text-zinc-400" : "text-zinc-500"}>
                    Time
                  </Text>
                  <Text
                    className={`font-medium ${isDark ? "text-zinc-200" : "text-zinc-800"}`}
                  >
                    {new Date(todo.scheduledTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between mb-2">
                <Text className={isDark ? "text-zinc-400" : "text-zinc-500"}>
                  Duration
                </Text>
                <Text
                  className={`font-medium ${isDark ? "text-zinc-200" : "text-zinc-800"}`}
                >
                  {todo.duration || 30} min
                </Text>
              </View>

              {todo.reminderType === "NAGGING" && (
                <View className="flex-row justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <Text className="text-red-500 font-medium">
                    Nag Mode Active
                  </Text>
                  <Text className="text-red-500">
                    Every {todo.nagInterval || 5}m
                  </Text>
                </View>
              )}

              {/* Nag Duration Display */}
              {todo.reminderType === "NAGGING" && todo.nagDuration && (
                <View className="flex-row justify-between mb-2">
                  <Text className={isDark ? "text-zinc-400" : "text-zinc-500"}>
                    Stop After
                  </Text>
                  <Text
                    className={`font-medium ${isDark ? "text-zinc-200" : "text-zinc-800"}`}
                  >
                    {todo.nagDuration < 60
                      ? `${todo.nagDuration} min`
                      : `${Math.floor(todo.nagDuration / 60)}h ${todo.nagDuration % 60 > 0 ? (todo.nagDuration % 60) + "m" : ""}`}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <TouchableOpacity
            onPress={toggleComplete}
            className={`flex-row items-center justify-center p-4 rounded-xl mb-4 ${
              isCompleted
                ? "bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30"
                : "bg-primary"
            }`}
          >
            <Ionicons
              name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={isCompleted ? "#16a34a" : "white"}
            />
            <Text
              className={`ml-2 font-bold text-lg ${isCompleted ? "text-green-600" : "text-white"}`}
            >
              {isCompleted ? "Completed" : "Mark as Done"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            className="flex-row items-center justify-center p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30"
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text className="ml-2 font-bold text-red-500">Delete Task</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <CustomAlert {...alertProps} />
    </SafeAreaView>
  );
}
