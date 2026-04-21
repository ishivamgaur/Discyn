import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import haptics from "../services/hapticsService";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUpdateTodo, useDeleteTodo } from "../hooks/useTodos";

export default function TodoDetailScreen({ route, navigation }) {
  const { todo } = route.params;
  const updateMutation = useUpdateTodo();
  const deleteMutation = useDeleteTodo();

  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [isCompleted, setIsCompleted] = useState(todo.isCompleted);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeSpent, setTimeSpent] = useState(todo.timeSpent || 0);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => setTimeSpent((p) => p + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleSave = async () => {
    if (!title.trim()) {
      haptics.error();
      Toast.show({ type: "error", text1: "Validation", text2: "Title cannot be empty" });
      return;
    }
    try {
      await updateMutation.mutateAsync({ id: todo._id, payload: { title, description, isCompleted, timeSpent } });
      haptics.success();
      navigation.goBack();
    } catch (e) {
      haptics.error();
      Toast.show({ type: "error", text1: "Error", text2: "Failed to update task" });
    }
  };

  const handleDelete = async () => {
    haptics.medium();
    try {
      await deleteMutation.mutateAsync(todo._id);
      haptics.success();
      Toast.show({ type: "success", text1: "Deleted", text2: "Task removed" });
      navigation.goBack();
    } catch (e) {
      haptics.error();
      Toast.show({ type: "error", text1: "Error", text2: "Failed to delete task" });
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background-dark">
      <View className="px-4 py-3 flex-row items-center justify-between border-b border-white/10">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-secondary font-label tracking-wider uppercase text-xs">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-lg font-display text-white tracking-wide">Details</Text>
        <TouchableOpacity onPress={handleSave} disabled={updateMutation.isPending}>
          <Text className={`text-xs font-label uppercase tracking-wider ${updateMutation.isPending ? "text-text-muted-dark" : "text-primary"}`}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView className="flex-1 p-4">
          <View className="mb-6">
            <TextInput value={title} onChangeText={setTitle} className="text-3xl font-display text-white p-0 tracking-tight" placeholder="Task Title" placeholderTextColor="#52555c" multiline />
          </View>

          <View className="mb-8 bg-white/5 p-4 rounded-3xl border border-white/10">
            <Text className="text-xs font-label text-text-muted-dark uppercase tracking-widest mb-2">Notes</Text>
            <TextInput value={description} onChangeText={setDescription} multiline className="text-base font-body text-white p-0 h-32" placeholder="Add details..." placeholderTextColor="#52555c" textAlignVertical="top" />
          </View>

          <View className="mb-8 bg-card-dark p-6 rounded-3xl border border-white/10 items-center justify-center relative overflow-hidden">
            {isTimerRunning && <View className="absolute inset-0 bg-primary/5" />}
            <Text className="text-xs font-label text-primary uppercase tracking-widest mb-2">Deep Focus Timer</Text>
            <Text className="text-6xl font-display text-white tracking-tighter mb-6">{formatTime(timeSpent)}</Text>
            <TouchableOpacity
              onPress={() => { haptics.light(); setIsTimerRunning(!isTimerRunning); }}
              className={`px-8 py-3 rounded-full flex-row items-center justify-center ${isTimerRunning ? "bg-white/10" : "bg-primary"}`}
              style={!isTimerRunning ? { shadowColor: "#c799ff", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10 } : {}}
            >
              <Ionicons name={isTimerRunning ? "pause" : "play"} size={20} color={isTimerRunning ? "#fff" : "#0b0e14"} />
              <Text className={`ml-2 font-label uppercase tracking-widest text-sm ${isTimerRunning ? "text-white" : "text-background-dark"}`}>{isTimerRunning ? "Pause" : "Start Focus"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => { haptics.light(); setIsCompleted(!isCompleted); }}
            className={`flex-row items-center justify-center p-5 rounded-3xl mb-4 ${isCompleted ? "bg-secondary/20 border border-secondary/30" : "bg-white/5 border border-white/10"}`}>
            <Ionicons name={isCompleted ? "checkmark-circle" : "ellipse-outline"} size={24} color={isCompleted ? "#00e3fd" : "#a9abb3"} />
            <Text className={`ml-3 font-display text-lg tracking-wide ${isCompleted ? "text-secondary" : "text-white"}`}>{isCompleted ? "Task Completed" : "Mark as Done"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDelete} className="flex-row items-center justify-center p-5 rounded-3xl bg-red-500/10 border border-red-500/20">
            <Ionicons name="trash-outline" size={20} color="#ff6e84" />
            <Text className="ml-2 font-display text-lg text-red-400 tracking-wide">Delete</Text>
          </TouchableOpacity>
          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
