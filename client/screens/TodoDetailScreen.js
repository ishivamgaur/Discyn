import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import api from "../services/authService";
import { Ionicons } from "@expo/vector-icons";

import { useRef } from "react";
import { useCustomAlert } from "../hooks/useCustomAlert";
import CustomAlert from "../components/CustomAlert";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TodoDetailScreen({ route, navigation }) {
  const { todo } = route.params;
  const { isDark } = useTheme();
  const { alertProps, showAlert } = useCustomAlert();

  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      showAlert({ title: "Validation", message: "Title cannot be empty" });
      return;
    }

    setIsSaving(true);
    try {
      await api.put(`/todos/${todo._id}`, { title, description });
      showAlert({
        title: "Success",
        message: "Task updated successfully",
        onConfirm: () => navigation.goBack(),
      });
    } catch (error) {
      console.error(error);
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
    showAlert({
      title: "Delete Task",
      message:
        "Are you sure you want to remove this task? This cannot be undone.",
      confirmText: "Delete",
      confirmColor: "bg-red-500",
      onCancel: () => {}, // Show cancel button
      onConfirm: async () => {
        try {
          await api.delete(`/todos/${todo._id}`);
          navigation.goBack();
        } catch (error) {
          showAlert({ title: "Error", message: "Failed to delete task" });
        }
      },
    });
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-6">
          {/* Header Actions */}
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={isDark ? "#fff" : "#374151"}
              />
            </TouchableOpacity>
            <Text
              className={`text-lg font-bold ${isDark ? "text-gray-200" : "text-gray-700"}`}
            >
              Edit Task
            </Text>
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>

          {/* Edit Form */}
          <View
            className={`p-6 rounded-2xl shadow-sm ${isDark ? "bg-gray-800" : "bg-white"}`}
          >
            <Text
              className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              className={`text-xl font-bold mb-6 p-2 rounded-lg ${isDark ? "text-white bg-gray-700" : "text-gray-900 bg-gray-50"}`}
              placeholder="Task Title"
              placeholderTextColor={isDark ? "#9ca3af" : "#9ca3af"}
            />

            <Text
              className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              className={`text-base p-4 rounded-lg h-40 ${isDark ? "text-gray-200 bg-gray-700" : "text-gray-800 bg-gray-50"}`}
              placeholder="Add details..."
              placeholderTextColor={isDark ? "#9ca3af" : "#9ca3af"}
              textAlignVertical="top"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            className={`mt-8 py-4 rounded-xl items-center shadow-lg shadow-indigo-500/30 ${
              isSaving ? "bg-primary-light" : "bg-primary"
            }`}
          >
            <Text className="text-white font-bold text-lg">
              {isSaving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <CustomAlert {...alertProps} />
    </SafeAreaView>
  );
}
