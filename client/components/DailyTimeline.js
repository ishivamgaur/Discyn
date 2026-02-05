import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const START_HOUR = 0;
const END_HOUR = 24; // Full day coverage
const HOUR_HEIGHT = 80;

export default function DailyTimeline({ tasks, onTaskPress }) {
  const { isDark } = useTheme();

  // Filter tasks for Today that have a schedule
  const todaysTasks = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    console.log("DailyTimeline Recalculating. Total Tasks:", tasks.length);

    const filtered = tasks
      .map((task) => {
        // Clone to avoid mutation issues implies we should treat it carefully
        // If recurring & has schedule, simulate it is today
        if (task.isRecurring && task.scheduledTime) {
          const originalDate = new Date(task.scheduledTime);
          const taskTimeToday = new Date();
          taskTimeToday.setHours(
            originalDate.getHours(),
            originalDate.getMinutes(),
            0,
            0,
          );
          return {
            ...task,
            scheduledTime: taskTimeToday.toISOString(),
            isVirtual: true,
          };
        }
        return task;
      })
      .filter((task) => {
        if (!task.scheduledTime) return false;
        const tDate = new Date(task.scheduledTime);
        const isToday = tDate >= startOfDay && tDate <= endOfDay;
        return isToday;
      });

    console.log("Tasks for Today:", filtered.length);
    return filtered;
  }, [tasks]);

  // Generate hours array [6, 7, ... 23]
  const hours = Array.from(
    { length: END_HOUR - START_HOUR + 1 },
    (_, i) => START_HOUR + i,
  );

  // Helper for AM/PM format
  const formatHour = (h) => {
    if (h === 0) return "12 AM";
    if (h < 12) return `${h} AM`;
    if (h === 12) return "12 PM";
    return `${h - 12} PM`;
  };

  const getTaskStyle = (task) => {
    const date = new Date(task.scheduledTime);
    const hour = date.getHours();
    const minute = date.getMinutes();

    // Safety check: if task is before start hour, clamp it or hide?
    // For now, let's just calculate absolute top relative to start hour.

    const startOffsetHours = hour - START_HOUR + minute / 60;
    const top = startOffsetHours * HOUR_HEIGHT;
    const height = ((task.duration || 30) / 60) * HOUR_HEIGHT;

    return {
      top,
      height,
      left: 70, // Increased space for "12 AM" text
      right: 16,
    };
  };

  return (
    <View
      className={`flex-1 mt-4 ${isDark ? "bg-background-dark" : "bg-background-light"}`}
    >
      <Text
        className={`px-6 mb-4 text-lg font-bold ${isDark ? "text-white" : "text-black"}`}
      >
        Today's Schedule
      </Text>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          height: hours.length * HOUR_HEIGHT + 20,
          paddingBottom: 40,
          paddingTop: 10,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Render Grid & Time Labels */}
        {hours.map((hour) => {
          // Check if this is the "current" hour visual
          const isCurrentHour = new Date().getHours() === hour;
          return (
            <View
              key={hour}
              style={{ height: HOUR_HEIGHT, flexDirection: "row" }}
              className="px-4"
            >
              {/* Time Label */}
              <Text
                className={`w-14 text-xs font-medium text-right mr-3 -mt-2 ${isCurrentHour ? "text-red-500 font-bold" : isDark ? "text-zinc-500" : "text-zinc-400"}`}
              >
                {formatHour(hour)}
              </Text>
              {/* Line */}
              <View
                className={`flex-1 border-t ${isDark ? "border-zinc-800" : "border-zinc-100"}`}
                style={{
                  borderStyle: "dashed",
                  borderWidth: 1,
                  borderColor: isDark ? "#27272a" : "#f4f4f5",
                }}
              />
            </View>
          );
        })}

        {/* Current Time Indicator Line */}
        {(() => {
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          // Calculate position
          const offset =
            (currentHour - START_HOUR + currentMinute / 60) * HOUR_HEIGHT;

          // Adjust offset for paddingTop
          const finalTop = offset + 10;

          if (offset >= 0 && offset <= (END_HOUR - START_HOUR) * HOUR_HEIGHT) {
            return (
              <View
                style={{
                  position: "absolute",
                  top: finalTop,
                  left: 70,
                  right: 0,
                  flexDirection: "row",
                  alignItems: "center",
                  zIndex: 10,
                }}
              >
                <View className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                <View className="flex-1 h-[1px] bg-red-500 shadow-sm" />
              </View>
            );
          }
          return null;
        })()}

        {/* Task Blocks (Absolute) */}
        {todaysTasks.map((task) => {
          const style = getTaskStyle(task);
          if (style.top < 0) return null;

          // Distinct colors based on something (e.g. random or priority if available, otherwise cyclic)
          // For now, let's stick to a clean primary look or dynamic based on completion
          const isDone = task.isCompleted;

          return (
            <TouchableOpacity
              key={task._id}
              onPress={() => onTaskPress(task)}
              activeOpacity={0.9}
              style={{
                position: "absolute",
                top: style.top + 10 + 2, // Add paddingTop offset + cosmetic offset
                height: Math.max(style.height - 4, 34), // Ensure readable height
                left: style.left + 8,
                right: style.right,
                // Shadow
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
              className={`rounded-xl px-3 py-1.5 justify-center border-l-[3px] ${
                isDone
                  ? isDark
                    ? "bg-zinc-900 border-zinc-600"
                    : "bg-zinc-100 border-zinc-400"
                  : isDark
                    ? "bg-purple-900/20 border-purple-500"
                    : "bg-white border-purple-500"
              }`}
            >
              <Text
                numberOfLines={1}
                className={`text-xs font-bold leading-tight ${isDone ? (isDark ? "text-zinc-500 line-through" : "text-zinc-500 line-through") : isDark ? "text-purple-100" : "text-zinc-900"}`}
              >
                {task.title}
              </Text>

              {/* Routine Tag */}
              {task.isRecurring && (
                <View
                  className={`self-start px-1.5 py-0.5 rounded border mb-0.5 ${isDark ? "bg-purple-500/20 border-purple-500/50" : "bg-purple-100 border-purple-200"}`}
                >
                  <Text
                    className={`text-[8px] font-bold uppercase ${isDark ? "text-purple-300" : "text-purple-700"}`}
                  >
                    Routine
                  </Text>
                </View>
              )}

              <View className="flex-row items-center mt-0.5">
                <Text
                  numberOfLines={1}
                  className={`text-[10px] ${isDone ? "text-zinc-500" : isDark ? "text-purple-300" : "text-zinc-500"}`}
                >
                  {formatHour(new Date(task.scheduledTime).getHours())
                    .replace(" ", "")
                    .toLowerCase()}
                  :
                  {String(new Date(task.scheduledTime).getMinutes()).padStart(
                    2,
                    "0",
                  )}{" "}
                  • {task.duration}m
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Empty State Overlay if needed, but subtle */}
        {todaysTasks.length === 0 && (
          <View className="absolute top-10 left-20 right-10 items-center opacity-40">
            <Text
              className={`text-xs ${isDark ? "text-zinc-600" : "text-zinc-400"}`}
            >
              Nothing here... yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
