import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import api from "../services/authService";
import haptics from "../services/hapticsService";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { handleTaskScheduling } from "../services/notificationService";

// Only import DateTimePicker on mobile platforms
let DateTimePicker = null;
if (Platform.OS !== "web") {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}

export default function AddTodoScreen({ navigation, route }) {
  const { isDark } = useTheme();
  const initialType = route.params?.type || "task";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [isRecurring, setIsRecurring] = useState(initialType === "routine");

  // Phase 4 New State
  const [hasSchedule, setHasSchedule] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(new Date()); // Defaults to now, but only used if hasSchedule is true
  const [duration, setDuration] = useState(30); // minutes

  const [isNagging, setIsNagging] = useState(false);
  const [nagInterval, setNagInterval] = useState(5); // minutes between reminders
  const [nagDuration, setNagDuration] = useState(60); // total minutes to keep nagging

  // UI State
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleAddTodo = async () => {
    if (!title.trim()) {
      haptics.error();
      Alert.alert("Validation", "Title is required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title,
        description,
        isRecurring,
        priority,
        // Phase 4 Fields
        // Safety: If Nagging is on, we MUST have a scheduled time.
        scheduledTime: hasSchedule || isNagging ? scheduledTime : null,
        duration: hasSchedule ? duration : 30,
        reminderType: isNagging ? "NAGGING" : "NORMAL",
        nagInterval: isNagging ? nagInterval : 5,
        nagDuration: isNagging ? nagDuration : 60, // How long to keep nagging
        type: isRecurring ? "ROUTINE" : "TASK",
      };

      const response = await api.post("/todos", payload);

      try {
        await handleTaskScheduling(response.data);
      } catch (scheduleError) {
        console.error("Scheduling failed:", scheduleError);
        // Don't block success flow, just log
      }

      haptics.success();
      navigation.goBack();
    } catch (error) {
      haptics.error();
      Alert.alert("Error", "Failed to add todo");
    } finally {
      setLoading(false);
    }
  };

  const onTimeChange = (event, selectedDate) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      setScheduledTime(selectedDate);
    }
  };

  const PriorityBadge = ({ level, active, onPress }) => {
    const activeColors = {
      LOW: "bg-blue-500",
      MEDIUM: "bg-orange-500",
      HIGH: "bg-red-500",
    };

    const borderColor = isDark ? "border-zinc-700" : "border-zinc-200";

    return (
      <TouchableOpacity
        onPress={onPress}
        className={`px-4 py-2 rounded-full border ${active ? "border-transparent" : borderColor} ${active ? activeColors[level] : isDark ? "bg-card-dark" : "bg-white"} mr-2`}
      >
        <Text
          className={`text-xs font-bold ${active ? "text-white" : isDark ? "text-zinc-400" : "text-zinc-600"}`}
        >
          {level}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background-light"}`}
    >
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-primary text-base font-medium">Cancel</Text>
        </TouchableOpacity>
        <Text
          className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}
        >
          New {isRecurring ? "Routine" : "Task"}
        </Text>
        <TouchableOpacity onPress={handleAddTodo} disabled={loading}>
          <Text
            className={`text-base font-bold ${loading ? "text-zinc-400" : "text-primary"}`}
          >
            Done
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
              className={`text-2xl font-bold p-0 ${isDark ? "text-white" : "text-gray-900"}`}
              placeholder="What needs to be done?"
              placeholderTextColor={isDark ? "#52525b" : "#d4d4d8"}
              value={title}
              onChangeText={setTitle}
              //   multiline // Removed multiline for better submit handling usually, but keeping simple
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
              className={`text-base p-0 h-20 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              placeholder="Add notes..."
              placeholderTextColor={isDark ? "#52525b" : "#d4d4d8"}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Settings Card */}
          <View
            className={`rounded-2xl overflow-hidden mb-6 ${isDark ? "bg-card-dark" : "bg-white"}`}
          >
            {/* Priority */}
            <View
              className={`p-4 flex-row items-center justify-between border-b ${isDark ? "border-zinc-800" : "border-zinc-100"}`}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 items-center justify-center">
                  <Ionicons name="flag" size={18} color="#f97316" />
                </View>
                <Text
                  className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Priority
                </Text>
              </View>
              <View className="flex-row">
                {["LOW", "MEDIUM", "HIGH"].map((level) => (
                  <PriorityBadge
                    key={level}
                    level={level}
                    active={priority === level}
                    onPress={() => setPriority(level)}
                  />
                ))}
              </View>
            </View>

            {/* Recurring Switch */}
            <View
              className={`p-4 flex-row items-center justify-between border-b ${isDark ? "border-zinc-800" : "border-zinc-100"}`}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 items-center justify-center">
                  <Ionicons name="repeat" size={18} color="#3b82f6" />
                </View>
                <Text
                  className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Repeat Daily
                </Text>
              </View>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                trackColor={{ false: "#e4e4e7", true: "#3b82f6" }}
              />
            </View>

            {/* Schedule Toggle */}
            <View
              className={`p-4 flex-row items-center justify-between border-b ${isDark ? "border-zinc-800" : "border-zinc-100"}`}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 items-center justify-center">
                  <Ionicons name="time" size={18} color="#a855f7" />
                </View>
                <Text
                  className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Schedule Time
                </Text>
              </View>
              <Switch
                value={hasSchedule}
                onValueChange={(val) => {
                  setHasSchedule(val);
                  if (!val) setIsNagging(false); // Auto-disable Nag if schedule off
                }}
                trackColor={{ false: "#e4e4e7", true: "#a855f7" }}
              />
            </View>

            {/* Schedule Details (Collapsible) */}
            {hasSchedule && (
              <View
                className={`px-4 py-3 bg-zinc-50 dark:bg-black/20 border-b ${isDark ? "border-zinc-800" : "border-zinc-100"}`}
              >
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  className="flex-row justify-between items-center mb-3"
                >
                  <Text
                    className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
                  >
                    Start Time
                  </Text>
                  <Text
                    className={`text-base font-bold ${isDark ? "text-white" : "text-black"}`}
                  >
                    {scheduledTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>

                {/* Web: Use HTML time input */}
                {Platform.OS === "web" && (
                  <input
                    type="time"
                    value={`${String(scheduledTime.getHours()).padStart(2, "0")}:${String(scheduledTime.getMinutes()).padStart(2, "0")}`}
                    onChange={(e) => {
                      const newDate = new Date(scheduledTime);
                      const [hours, minutes] = e.target.value.split(":");
                      newDate.setHours(parseInt(hours), parseInt(minutes));
                      setScheduledTime(newDate);
                    }}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 8,
                      border: isDark
                        ? "1px solid #3f3f46"
                        : "1px solid #e4e4e7",
                      backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                      color: isDark ? "#fff" : "#000",
                      fontSize: 16,
                      marginTop: 8,
                    }}
                  />
                )}

                {/* Mobile: Use native DateTimePicker */}
                {Platform.OS !== "web" && showTimePicker && DateTimePicker && (
                  <DateTimePicker
                    value={scheduledTime}
                    mode="time"
                    is24Hour={false}
                    display="default"
                    onChange={onTimeChange}
                    themeVariant={isDark ? "dark" : "light"}
                  />
                )}

                <View className="mt-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text
                      className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
                    >
                      Duration
                    </Text>
                    <Text
                      className={`text-base font-bold ${isDark ? "text-white" : "text-black"}`}
                    >
                      {duration}m
                    </Text>
                  </View>
                  <Slider
                    style={{ width: "100%", height: 40 }}
                    minimumValue={5}
                    maximumValue={180}
                    step={5}
                    value={duration}
                    onValueChange={(val) => setDuration(val)}
                    minimumTrackTintColor="#10b981"
                    maximumTrackTintColor={isDark ? "#3f3f46" : "#e4e4e7"}
                    thumbTintColor="#10b981"
                  />
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-zinc-500">5m</Text>
                    <Text className="text-xs text-zinc-500">3h</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Nag Mode Toggle */}
            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/20 items-center justify-center">
                  <Ionicons
                    name="notifications-circle"
                    size={18}
                    color="#ef4444"
                  />
                </View>
                <View>
                  <Text
                    className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Nag Me
                  </Text>
                  <Text className="text-[10px] text-zinc-500">
                    Persistent reminders until done
                  </Text>
                </View>
              </View>
              <Switch
                value={isNagging}
                onValueChange={(val) => {
                  setIsNagging(val);
                  if (val && !hasSchedule) {
                    setHasSchedule(true);
                  }
                }}
                trackColor={{ false: "#e4e4e7", true: "#ef4444" }}
              />
            </View>

            {/* Nag Interval Slider - Shows when Nag Me is enabled */}
            {isNagging && (
              <View
                className={`p-4 pt-0 ${isDark ? "bg-zinc-800/50" : "bg-zinc-50"}`}
              >
                {/* Nag Frequency Slider */}
                <View className="flex-row justify-between items-center mb-2">
                  <Text
                    className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
                  >
                    Nag Every
                  </Text>
                  <Text
                    className={`text-base font-bold ${isDark ? "text-white" : "text-black"}`}
                  >
                    {nagInterval} min
                  </Text>
                </View>
                <Slider
                  style={{ width: "100%", height: 40 }}
                  minimumValue={1}
                  maximumValue={60}
                  step={1}
                  value={nagInterval}
                  onValueChange={(val) => setNagInterval(val)}
                  minimumTrackTintColor="#ef4444"
                  maximumTrackTintColor={isDark ? "#3f3f46" : "#e4e4e7"}
                  thumbTintColor="#ef4444"
                />
                <View className="flex-row justify-between mb-6">
                  <Text className="text-xs text-zinc-500">1 min</Text>
                  <Text className="text-xs text-zinc-500">60 min</Text>
                </View>

                {/* Nag Duration Slider */}
                <View className="flex-row justify-between items-center mb-2">
                  <Text
                    className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
                  >
                    Stop After
                  </Text>
                  <Text
                    className={`text-base font-bold ${isDark ? "text-white" : "text-black"}`}
                  >
                    {nagDuration < 60
                      ? `${nagDuration} min`
                      : `${Math.floor(nagDuration / 60)}h ${nagDuration % 60 > 0 ? (nagDuration % 60) + "m" : ""}`}
                  </Text>
                </View>
                <Slider
                  style={{ width: "100%", height: 40 }}
                  minimumValue={15}
                  maximumValue={240}
                  step={15}
                  value={nagDuration}
                  onValueChange={(val) => setNagDuration(val)}
                  minimumTrackTintColor="#7c3aed"
                  maximumTrackTintColor={isDark ? "#3f3f46" : "#e4e4e7"}
                  thumbTintColor="#7c3aed"
                />
                <View className="flex-row justify-between">
                  <Text className="text-xs text-zinc-500">15 min</Text>
                  <Text className="text-xs text-zinc-500">4 hours</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
