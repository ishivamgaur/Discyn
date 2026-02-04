import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
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
      className={`p-4 mb-3 rounded-xl flex-row items-center mx-4 ${
        isDark ? "bg-gray-800" : "bg-white"
      } shadow-sm border ${isDark ? "border-gray-700" : "border-gray-100"}`}
    >
      <Ionicons
        name="checkmark-circle"
        size={24}
        color="#22c55e"
        style={{ marginRight: 12 }}
      />
      <View className="flex-1">
        <Text
          className={`text-lg font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {item.title}
        </Text>
        {item.isRecurring && (
          <Text
            className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            Daily Routine 🔄
          </Text>
        )}
      </View>
      <Text className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
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
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-100"}`}
    >
      {/* Calendar Section */}
      <View className={isDark ? "bg-gray-800" : "bg-white"}>
        <Calendar
          onDayPress={(day) => {
            setSelectedDate(day.dateString);
          }}
          markedDates={{
            [selectedDate]: {
              selected: true,
              disableTouchEvent: true,
              selectedDotColor: "orange",
              selectedColor: "#4f46e5", // Indigo 600
            },
          }}
          theme={{
            backgroundColor: isDark ? "#374151" : "#ffffff", // Card dark or white
            calendarBackground: isDark ? "#374151" : "#ffffff",
            textSectionTitleColor: isDark ? "#d1d5db" : "#b6c1cd",
            selectedDayBackgroundColor: "#4f46e5",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "#4f46e5",
            dayTextColor: isDark ? "#e5e7eb" : "#2d4150",
            textDisabledColor: isDark ? "#6b7280" : "#d9e1e8",
            monthTextColor: isDark ? "#f3f4f6" : "#2d4150",
            arrowColor: "#4f46e5",
            textDayFontWeight: "600",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "500",
          }}
        />
      </View>

      <Text
        className={`mx-4 my-4 text-lg font-bold ${isDark ? "text-white" : "text-gray-800"}`}
      >
        Completed on {selectedDate}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4f46e5" className="mt-10" />
      ) : (
        <FlatList
          data={historyItems}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="items-center justify-center mt-10">
              <Text
                className={`text-base ${isDark ? "text-gray-500" : "text-gray-400"}`}
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
