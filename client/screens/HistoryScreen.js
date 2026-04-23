import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHistory } from "../hooks/useTodos";
import GlassBackground from "../components/GlassBackground";

export default function HistoryScreen() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const { data: historyItems = [], isLoading } = useHistory(selectedDate);

  const renderItem = ({ item }) => (
    <View style={S.item}>
      <GlassBackground />
      <View style={S.itemIcon}>
        <Ionicons name="checkmark" size={16} color="#00e3fd" />
      </View>
      <View style={S.itemContent}>
        <Text style={S.itemTitle}>{item.title}</Text>
        {item.isRecurring && (
          <View style={S.routineBadge}>
            <Ionicons name="repeat" size={10} color="#c799ff" />
            <Text style={S.routineBadgeText}>Routine</Text>
          </View>
        )}
      </View>
      <Text style={S.itemTime}>
        {item.completedAt
          ? new Date(item.completedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "--:--"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={S.root}>
      <View style={S.header}>
        <Text style={S.label}>Time Log</Text>
        <Text style={S.title}>History</Text>
      </View>

      {/* Calendar */}
      <View style={S.calendarWrap}>
        <GlassBackground />
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: {
              selected: true,
              disableTouchEvent: true,
              selectedColor: "#c799ff",
              selectedTextColor: "#0b0e14",
            },
          }}
          theme={{
            backgroundColor: "transparent",
            calendarBackground: "transparent",
            textSectionTitleColor: "#52555c",
            selectedDayBackgroundColor: "#c799ff",
            selectedDayTextColor: "#0b0e14",
            todayTextColor: "#00e3fd",
            dayTextColor: "#ecedf6",
            textDisabledColor: "#2e3139",
            monthTextColor: "#fff",
            arrowColor: "#c799ff",
            textDayFontFamily: "Inter_500Medium",
            textMonthFontFamily: "Outfit_700Bold",
            textDayHeaderFontFamily: "Inter_500Medium",
            textDayFontSize: 13,
            textMonthFontSize: 16,
          }}
        />
      </View>

      {/* Date Label */}
      <View style={S.dateLabel}>
        <Text style={S.dateLabelText}>
          {new Date(selectedDate).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
        {historyItems.length > 0 && (
          <View style={S.countBadge}>
            <Text style={S.countBadgeText}>{historyItems.length}</Text>
          </View>
        )}
      </View>

      {/* List */}
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color="#c799ff"
          style={{ marginTop: 32 }}
        />
      ) : (
        <FlatList
          data={historyItems}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={S.list}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={() => (
            <View style={S.empty}>
              <Ionicons
                name="calendar-clear-outline"
                size={44}
                color="#2e3139"
              />
              <Text style={S.emptyTitle}>Nothing here</Text>
              <Text style={S.emptySub}>
                No tasks were completed on this day
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0b0e14" },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  label: {
    fontSize: 11,
    color: "#c799ff",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    color: "#fff",
    fontFamily: "Outfit_700Bold",
    letterSpacing: -0.5,
  },

  calendarWrap: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    position: "relative",
  },

  dateLabel: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  dateLabelText: {
    fontSize: 12,
    color: "#52555c",
    fontFamily: "Inter_500Medium",
  },
  countBadge: {
    backgroundColor: "rgba(199,153,255,0.15)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countBadgeText: {
    fontSize: 11,
    color: "#c799ff",
    fontFamily: "Inter_600SemiBold",
  },

  list: { paddingHorizontal: 16, paddingBottom: 100 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    position: "relative",
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(0,227,253,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 14, color: "#ecedf6", fontFamily: "Inter_500Medium" },
  routineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  routineBadgeText: {
    fontSize: 10,
    color: "#c799ff",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  itemTime: { fontSize: 11, color: "#45484f", fontFamily: "Inter_400Regular" },

  empty: { alignItems: "center", paddingTop: 48 },
  emptyTitle: {
    fontSize: 15,
    color: "#3a3d45",
    fontFamily: "Outfit_700Bold",
    marginTop: 14,
  },
  emptySub: {
    fontSize: 12,
    color: "#2e3139",
    fontFamily: "Inter_400Regular",
    marginTop: 5,
  },
});
