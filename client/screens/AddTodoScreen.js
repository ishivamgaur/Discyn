import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import haptics from "../services/hapticsService";
import { SafeAreaView } from "react-native-safe-area-context";
import { handleTaskScheduling } from "../services/notificationService";
import { useAddTodo } from "../hooks/useTodos";
import GlassBackground from "../components/GlassBackground";

let DateTimePicker = null;
if (Platform.OS !== "web") {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}

export default function AddTodoScreen({ navigation, route }) {
  const initialType = route.params?.type || "task";
  const addTodoMutation = useAddTodo();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [isRecurring, setIsRecurring] = useState(initialType === "routine");
  const [hasSchedule, setHasSchedule] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [duration, setDuration] = useState(30);
  const [isNagging, setIsNagging] = useState(false);
  const [nagInterval, setNagInterval] = useState(5);
  const [nagDuration, setNagDuration] = useState(60);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleAddTodo = async () => {
    if (!title.trim()) {
      haptics.error();
      Toast.show({
        type: "error",
        text1: "Validation",
        text2: "Title is required",
      });
      return;
    }

    try {
      const payload = {
        title,
        description,
        isRecurring,
        priority,
        scheduledTime: hasSchedule || isNagging ? scheduledTime : null,
        duration: hasSchedule ? duration : 30,
        reminderType: isNagging ? "NAGGING" : "NORMAL",
        nagInterval: isNagging ? nagInterval : 5,
        nagDuration: isNagging ? nagDuration : 60,
        type: isRecurring ? "ROUTINE" : "TASK",
      };

      const todo = await addTodoMutation.mutateAsync(payload);

      try {
        await handleTaskScheduling(todo);
      } catch (e) {
        console.error("Scheduling failed:", e);
      }

      haptics.success();
      navigation.goBack();
    } catch (error) {
      haptics.error();
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to create task",
      });
    }
  };

  const onTimeChange = (event, selectedDate) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedDate) setScheduledTime(selectedDate);
  };

  const PriorityBadge = ({ level, active, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`px-3 py-1.5 rounded-xl border ${active ? "bg-white/10 border-white/20" : "bg-transparent border-transparent"}`}
    >
      <Text
        className={`text-[10px] font-label uppercase tracking-wider ${active ? "text-white" : "text-text-muted-dark"}`}
      >
        {level}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background-dark">
      <View className="px-4 py-3 flex-row items-center justify-between border-b border-white/10">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-secondary text-xs font-label uppercase tracking-widest">
            Cancel
          </Text>
        </TouchableOpacity>
        <Text className="text-lg font-display text-white tracking-wide">
          New {isRecurring ? "Routine" : "Task"}
        </Text>
        <TouchableOpacity
          onPress={handleAddTodo}
          disabled={addTodoMutation.isPending}
        >
          <Text
            className={`text-xs font-label uppercase tracking-widest ${addTodoMutation.isPending ? "text-text-muted-dark" : "text-primary"}`}
          >
            Done
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-4">
          <View className="mb-6">
            <TextInput
              className="text-4xl font-display text-white p-0 tracking-tight"
              placeholder="System Objective?"
              placeholderTextColor="#45484f"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View className="mb-8 p-4 rounded-3xl border border-white/10 relative overflow-hidden">
            <GlassBackground />
            <Text className="text-xs font-label text-text-muted-dark uppercase tracking-widest mb-2 z-10">
              Parameters
            </Text>
            <TextInput
              className="text-base font-body text-white p-0 h-24 z-10"
              placeholder="Add execution details..."
              placeholderTextColor="#45484f"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View className="rounded-3xl overflow-hidden mb-8 border border-white/10 relative">
            <GlassBackground />
            <View className="p-4 flex-row items-center justify-between border-b border-white/10">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-orange-500/20 items-center justify-center">
                  <Ionicons name="flag" size={16} color="#f97316" />
                </View>
                <Text className="font-display text-white text-base tracking-wide">
                  Priority
                </Text>
              </View>
              <View className="flex-row bg-white/5 rounded-xl p-0.5">
                {["LOW", "MEDIUM", "HIGH"].map((level) => (
                  <PriorityBadge
                    key={level}
                    level={level}
                    active={priority === level}
                    onPress={() => {
                      haptics.light();
                      setPriority(level);
                    }}
                  />
                ))}
              </View>
            </View>

            <View className="p-4 flex-row items-center justify-between border-b border-white/10">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-primary/20 items-center justify-center">
                  <Ionicons name="repeat" size={16} color="#c799ff" />
                </View>
                <Text className="font-display text-white text-base tracking-wide">
                  Repeat Daily
                </Text>
              </View>
              <Switch
                value={isRecurring}
                onValueChange={(v) => {
                  haptics.light();
                  setIsRecurring(v);
                }}
                trackColor={{ false: "#22262f", true: "#c799ff" }}
                thumbColor={Platform.OS === "android" ? "#fff" : undefined}
              />
            </View>

            <View className="p-4 flex-row items-center justify-between border-b border-white/10">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-secondary/20 items-center justify-center">
                  <Ionicons name="time" size={16} color="#00e3fd" />
                </View>
                <Text className="font-display text-white text-base tracking-wide">
                  Schedule Block
                </Text>
              </View>
              <Switch
                value={hasSchedule}
                onValueChange={(v) => {
                  haptics.light();
                  setHasSchedule(v);
                  if (!v) setIsNagging(false);
                }}
                trackColor={{ false: "#22262f", true: "#00e3fd" }}
                thumbColor={Platform.OS === "android" ? "#fff" : undefined}
              />
            </View>

            {hasSchedule && (
              <View className="px-4 py-4 border-b border-white/10 bg-transparent">
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  className="flex-row justify-between items-center mb-4"
                >
                  <Text className="text-xs font-label uppercase text-text-muted-dark tracking-widest">
                    Start Time
                  </Text>
                  <Text className="text-xl font-display text-white">
                    {scheduledTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
                {Platform.OS !== "web" && showTimePicker && DateTimePicker && (
                  <DateTimePicker
                    value={scheduledTime}
                    mode="time"
                    display="spinner"
                    onChange={onTimeChange}
                    textColor="#fff"
                  />
                )}
                <View className="mt-2">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xs font-label uppercase text-text-muted-dark tracking-widest">
                      Duration
                    </Text>
                    <Text className="text-base font-display text-white">
                      {duration}m
                    </Text>
                  </View>
                  <Slider
                    style={{ width: "100%", height: 40 }}
                    minimumValue={5}
                    maximumValue={180}
                    step={5}
                    value={duration}
                    onValueChange={setDuration}
                    minimumTrackTintColor="#00e3fd"
                    maximumTrackTintColor="#22262f"
                    thumbTintColor="#00e3fd"
                  />
                </View>
              </View>
            )}

            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-red-500/20 items-center justify-center">
                  <Ionicons name="shield-checkmark" size={16} color="#ff6e84" />
                </View>
                <View>
                  <Text className="font-display text-white text-base tracking-wide">
                    Persistence Protocol
                  </Text>
                  <Text className="text-[10px] font-label uppercase tracking-widest text-text-muted-dark mt-0.5">
                    Pro Feature
                  </Text>
                </View>
              </View>
              <Switch
                value={isNagging}
                onValueChange={(v) => {
                  haptics.medium();
                  setIsNagging(v);
                  if (v && !hasSchedule) setHasSchedule(true);
                }}
                trackColor={{ false: "#22262f", true: "#ff6e84" }}
                thumbColor={Platform.OS === "android" ? "#fff" : undefined}
              />
            </View>

            {isNagging && (
              <View className="p-4 pt-0 border-t border-white/10 bg-transparent">
                <View className="flex-row justify-between items-center mb-2 mt-4">
                  <Text className="text-xs font-label uppercase text-text-muted-dark tracking-widest">
                    Enforce Every
                  </Text>
                  <Text className="text-base font-display text-red-400">
                    {nagInterval} min
                  </Text>
                </View>
                <Slider
                  style={{ width: "100%", height: 40 }}
                  minimumValue={1}
                  maximumValue={60}
                  step={1}
                  value={nagInterval}
                  onValueChange={setNagInterval}
                  minimumTrackTintColor="#ff6e84"
                  maximumTrackTintColor="#22262f"
                  thumbTintColor="#ff6e84"
                />
                <View className="flex-row justify-between items-center mb-2 mt-4">
                  <Text className="text-xs font-label uppercase text-text-muted-dark tracking-widest">
                    Stop After
                  </Text>
                  <Text className="text-base font-display text-primary">
                    {nagDuration < 60
                      ? `${nagDuration} min`
                      : `${Math.floor(nagDuration / 60)}h`}
                  </Text>
                </View>
                <Slider
                  style={{ width: "100%", height: 40 }}
                  minimumValue={15}
                  maximumValue={240}
                  step={15}
                  value={nagDuration}
                  onValueChange={setNagDuration}
                  minimumTrackTintColor="#c799ff"
                  maximumTrackTintColor="#22262f"
                  thumbTintColor="#c799ff"
                />
              </View>
            )}
          </View>
          <View className="h-20" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
