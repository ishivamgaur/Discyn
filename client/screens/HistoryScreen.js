import React, { useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Platform } from "react-native";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHistory } from "../hooks/useTodos";
import { BlurView } from "expo-blur";

const GlassContainer = ({ children, className = "" }) => {
  const isWeb = Platform.OS === "web";
  return (
    <View className={`rounded-[24px] overflow-hidden border border-white/10 ${className}`}>
      {isWeb ? (
        <View className="liquid-glass p-5">{children}</View>
      ) : (
        <BlurView intensity={25} tint="dark" className="p-5">
          {children}
        </BlurView>
      )}
    </View>
  );
};

export default function HistoryScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const { data: historyItems = [], isLoading } = useHistory(selectedDate);

  const renderItem = ({ item }) => (
    <View className="p-4 mb-3 rounded-2xl flex-row items-center mx-4 bg-white/5 border border-white/10">
      <View className="w-10 h-10 rounded-full items-center justify-center mr-4 bg-secondary/20">
        <Ionicons name="checkmark" size={20} color="#00e3fd" />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-display text-white tracking-wide">{item.title}</Text>
        {item.isRecurring && (
          <View className="flex-row items-center mt-1">
            <Ionicons name="repeat" size={12} color="#c799ff" />
            <Text className="text-xs font-label text-primary uppercase tracking-widest ml-1">Routine</Text>
          </View>
        )}
      </View>
      <Text className="text-xs font-label text-text-muted-dark tracking-wider">
        {new Date(item.completedAt || new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background-dark">
      <View className="px-4 pt-4 pb-8">
        <Text className="text-sm font-label text-secondary uppercase tracking-widest mb-1">Time Log</Text>
        <Text className="text-4xl font-display text-white tracking-tight">History</Text>
      </View>

      <View className="mx-4 rounded-2xl overflow-hidden bg-card-dark border border-white/10 mb-4 pb-2">
        <Calendar
          key="dark"
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{ [selectedDate]: { selected: true, disableTouchEvent: true, selectedColor: "#c799ff", selectedTextColor: "#0b0e14" } }}
          theme={{
            backgroundColor: "transparent", calendarBackground: "transparent",
            textSectionTitleColor: "#a9abb3", selectedDayBackgroundColor: "#c799ff",
            selectedDayTextColor: "#0b0e14", todayTextColor: "#00e3fd",
            dayTextColor: "#ecedf6", textDisabledColor: "#22262f",
            monthTextColor: "#ffffff", arrowColor: "#c799ff",
            textDayFontFamily: "Inter_500Medium", textMonthFontFamily: "Outfit_700Bold",
            textDayHeaderFontFamily: "Inter_500Medium",
            textDayFontSize: 14, textMonthFontSize: 18,
          }}
        />
      </View>

      <View className="px-4 mb-3">
        <Text className="text-xs font-label uppercase tracking-widest text-text-muted-dark">
          Completed on <Text className="text-white">{new Date(selectedDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</Text>
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#c799ff" className="mt-10" />
      ) : (
        <FlatList
          data={historyItems}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="items-center justify-center mt-10 opacity-50">
              <Ionicons name="calendar-clear-outline" size={48} color="#45484f" />
              <Text className="text-base font-body mt-4 text-text-muted-dark">No tasks completed on this date.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </SafeAreaView>
  );
}

import { ScrollView } from "react-native";
