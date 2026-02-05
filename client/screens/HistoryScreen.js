import React, { useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert } from "react-native";
import { Calendar } from "react-native-calendars";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/authService";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen({ navigation }) {
  const { isDark } = useTheme();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch history for selected date
  const fetchHistory = async (date) => {
    try {
      setLoading(true);
      const response = await api.get(`/todos/history`, {
        params: { date },
      });
      setHistoryItems(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory(selectedDate);
    }, [selectedDate]),
  );

  const renderItem = ({ item }) => (
    <View
      className={`p-4 mb-3 rounded-2xl flex-row items-center mx-4 border ${
        isDark ? "bg-card-dark border-zinc-800" : "bg-white border-zinc-100"
      }`}
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isDark ? "bg-green-900/20" : "bg-green-100"}`}
      >
        <Ionicons name="checkmark" size={20} color="#22c55e" />
      </View>
      <View className="flex-1">
        <Text
          className={`text-base font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {item.title}
        </Text>
        {item.isRecurring && (
          <View className="flex-row items-center mt-1">
            <Ionicons
              name="repeat"
              size={12}
              color={isDark ? "#9ca3af" : "#6f6f76"}
            />
            <Text
              className={`text-xs ml-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
            >
              Daily Routine
            </Text>
          </View>
        )}
      </View>
      <Text
        className={`text-xs font-medium ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
      >
        {new Date(item.completedAt || new Date()).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      edges={["top"]}
      className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background-light"}`}
    >
      {/* Header */}
      <View className="px-6 py-4">
        <Text
          className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
        >
          History
        </Text>
      </View>

      {/* Calendar Section */}
      <View
        className={`mx-4 rounded-3xl overflow-hidden border mb-6 ${isDark ? "bg-card-dark border-zinc-800" : "bg-white border-zinc-100"}`}
      >
        <Calendar
          key={isDark ? "dark" : "light"}
          onDayPress={(day) => {
            setSelectedDate(day.dateString);
          }}
          markedDates={{
            [selectedDate]: {
              selected: true,
              disableTouchEvent: true,
              selectedDotColor: "orange",
              selectedColor: "#2563eb", // Blue 600
            },
          }}
          theme={{
            backgroundColor: isDark ? "#18181b" : "#ffffff",
            calendarBackground: isDark ? "#18181b" : "#ffffff",
            textSectionTitleColor: isDark ? "#a1a1aa" : "#b6c1cd",
            selectedDayBackgroundColor: "#2563eb",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "#2563eb",
            dayTextColor: isDark ? "#e4e4e7" : "#2d4150",
            textDisabledColor: isDark ? "#52525b" : "#d9e1e8",
            monthTextColor: isDark ? "#f4f4f5" : "#2d4150",
            arrowColor: isDark ? "#fafafa" : "#2563eb",
            textDayFontWeight: "600",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "500",
          }}
        />
      </View>

      <View className="px-6 mb-2">
        <Text
          className={`text-sm font-bold uppercase tracking-widest ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
        >
          Completed on{" "}
          {new Date(selectedDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" className="mt-10" />
      ) : (
        <FlatList
          data={historyItems}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="items-center justify-center mt-10 opacity-50">
              <Ionicons
                name="calendar-clear-outline"
                size={48}
                color={isDark ? "#555" : "#ccc"}
              />
              <Text
                className={`text-base mt-2 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
              >
                No tasks completed this day.
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}
