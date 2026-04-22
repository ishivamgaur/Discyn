import React, { useState } from "react";
import {
  View, Text, ScrollView, RefreshControl,
  TouchableOpacity, ActivityIndicator, Dimensions, StyleSheet,
} from "react-native";
import { ContributionGraph } from "react-native-chart-kit";
import { BarChart, PieChart } from "react-native-gifted-charts";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Modal, FlatList, Pressable } from "react-native";
import GlassBackground from "../components/GlassBackground";
import { useStats } from "../hooks/useTodos";

const W = Dimensions.get("window").width;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 12 }, (_, i) => CURRENT_YEAR - i); // last 12 years

export default function StatsScreen() {
  const [range, setRange] = useState("weekly");
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [isYearPickerVisible, setYearPickerVisible] = useState(false);
  const { data, isLoading, refetch, isRefetching } = useStats(range, range === "yearly" ? selectedYear : undefined);

  const stats = data || {
    labels: ["M", "T", "W", "T", "F", "S", "S"],
    data: [0, 0, 0, 0, 0, 0, 0],
    streak: 0, completionRate: 0, totalCompleted: 0, totalFocusTime: 0,
  };

  const chartConfig = {
    backgroundGradientFrom: "#1c2028", backgroundGradientTo: "#1c2028",
    color: (opacity = 1) => `rgba(199, 153, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(82, 85, 92, ${opacity})`,
    decimalPlaces: 0,
  };

  if (isLoading && !isRefetching) {
    return (
      <SafeAreaView edges={["top"]} style={S.root}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#c799ff" />
        </View>
      </SafeAreaView>
    );
  }

  const hasData = range === "yearly"
    ? stats.data?.length > 0 && stats.data.some((d) => d.count > 0)
    : stats.data?.length > 0 && stats.data.some((x) => x > 0);

  // Chart range label
  const rangeChipLabel = range === "weekly"
    ? "Last 7 Days"
    : range === "monthly"
      ? `${new Date().toLocaleString("default", { month: "long" })} ${CURRENT_YEAR}`
      : `${selectedYear}`;

  return (
    <SafeAreaView edges={["top"]} style={S.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scroll}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#c799ff" />}
      >
        {/* ── Header ── */}
        <View style={S.header}>
          <Text style={S.label}>Performance</Text>
          <Text style={S.title}>Analytics</Text>
          <Text style={S.subtitle}>Your efficiency and focus, visualized.</Text>
        </View>

        {/* ── Range Toggle ── */}
        <View style={S.rangeRow}>
          {["weekly", "monthly", "yearly"].map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRange(r)}
              style={[S.rangeBtn, range === r && S.rangeBtnActive]}
            >
              <Text style={[S.rangeBtnText, range === r && S.rangeBtnTextActive]}>
                {r === "weekly" ? "Week" : r === "monthly" ? "Month" : "Year"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Year Selector Dropdown (only shown in yearly mode) ── */}
        {range === "yearly" && (
          <View style={S.yearRow}>
            <Text style={S.yearRowLabel}>Select Year</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setYearPickerVisible(true)}
              style={S.dropdownBtn}
            >
              <View style={S.dropdownBtnContent}>
                <Ionicons name="calendar-outline" size={18} color="#c799ff" />
                <Text style={S.dropdownBtnText}>{selectedYear}</Text>
                {selectedYear === CURRENT_YEAR && <Text style={S.currentYearBadge}>Current</Text>}
              </View>
              <Ionicons name="chevron-down" size={18} color="#52555c" />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Year Selection Modal ── */}
        <Modal
          visible={isYearPickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setYearPickerVisible(false)}
        >
          <Pressable
            style={S.modalOverlay}
            onPress={() => setYearPickerVisible(false)}
          >
            <View style={S.modalContent}>
              <GlassBackground color="rgba(28, 32, 40, 0.95)" />
              <View style={S.modalHeader}>
                <Text style={S.modalTitle}>Choose Year</Text>
                <TouchableOpacity onPress={() => setYearPickerVisible(false)}>
                  <Ionicons name="close-circle" size={24} color="#45484f" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={YEARS}
                keyExtractor={(item) => item.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[S.yearOption, selectedYear === item && S.yearOptionActive]}
                    onPress={() => {
                      setSelectedYear(item);
                      setYearPickerVisible(false);
                    }}
                  >
                    <Text style={[S.yearOptionText, selectedYear === item && S.yearOptionTextActive]}>
                      {item}
                    </Text>
                    {selectedYear === item && (
                      <Ionicons name="checkmark-circle" size={20} color="#c799ff" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </Pressable>
        </Modal>

        {/* ── Streak + Total Cards ── */}
        <View style={S.cardRow}>
          <View style={[S.card, S.cardHalf]}>
            <GlassBackground />
            <View style={S.cardBgIcon} pointerEvents="none">
              <Ionicons name="flame" size={80} color="#c799ff" style={{ opacity: 0.08 }} />
            </View>
            <View style={S.cardIconRow}>
              <Ionicons name="flame" size={16} color="#f97316" />
              <Text style={S.cardMiniLabel}>Streak</Text>
            </View>
            <Text style={S.cardBigNumber}>{stats.streak}</Text>
            <Text style={S.cardUnit}>days</Text>
          </View>

          <View style={{ width: 12 }} />

          <View style={[S.card, S.cardHalf]}>
            <GlassBackground />
            <View style={[S.cardBgIcon, { right: -10, top: -10 }]} pointerEvents="none">
              <Ionicons name="checkmark-done" size={80} color="#00e3fd" style={{ opacity: 0.08 }} />
            </View>
            <View style={S.cardIconRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#00e3fd" />
              <Text style={S.cardMiniLabel}>Total Done</Text>
            </View>
            <Text style={S.cardBigNumber}>{stats.totalCompleted}</Text>
            <Text style={S.cardUnit}>tasks</Text>
          </View>
        </View>

        {/* ── Focus Time + Today's Rate Cards ── */}
        <View style={S.cardRow}>
          <View style={[S.card, S.cardHalf, { borderColor: "rgba(199,153,255,0.2)" }]}>
            <GlassBackground color="rgba(199,153,255,0.05)" />
            <View style={[S.cardBgIcon, { right: -15, top: -15 }]} pointerEvents="none">
              <Ionicons name="time" size={80} color="#c799ff" style={{ opacity: 0.08 }} />
            </View>
            <View style={S.cardIconRow}>
              <Ionicons name="time-outline" size={16} color="#c799ff" />
              <Text style={[S.cardMiniLabel, { color: "#c799ff" }]}>Focus</Text>
            </View>
            <Text style={S.cardBigNumber}>
              {stats.totalFocusTime ? Math.floor(stats.totalFocusTime / 60) : 0}
            </Text>
            <Text style={S.cardUnit}>minutes</Text>
          </View>

          <View style={{ width: 12 }} />

          <View style={[S.card, S.cardHalf, { borderColor: "rgba(0,227,253,0.2)" }]}>
            <GlassBackground color="rgba(0,227,253,0.05)" />
            <View style={[S.cardBgIcon, { right: -15, top: -15 }]} pointerEvents="none">
              <Ionicons name="pie-chart" size={80} color="#00e3fd" style={{ opacity: 0.08 }} />
            </View>
            <View style={S.cardIconRow}>
              <Ionicons name="pie-chart-outline" size={16} color="#00e3fd" />
              <Text style={[S.cardMiniLabel, { color: "#00e3fd" }]}>Rate</Text>
            </View>
            <Text style={S.cardBigNumber}>
              {Math.round((stats.completionRate || 0) * 100)}
            </Text>
            <Text style={S.cardUnit}>percent</Text>
          </View>
        </View>

        {/* ── Activity Chart ── */}
        <View style={[S.card, S.cardWide]}>
          <GlassBackground color="rgba(28,32,40,0.5)" />

          {/* Chart Header */}
          <View style={S.chartHeader}>
            <View style={S.chartHeaderLeft}>
              <Ionicons name="analytics-outline" size={15} color="#c799ff" />
              <Text style={S.chartTitle}>Activity Trend</Text>
            </View>
            {/* Highlighted range chip */}
            <View style={S.rangeChip}>
              <Text style={S.rangeChipText}>{rangeChipLabel}</Text>
            </View>
          </View>

          {/* Chart Body */}
          {range === "yearly" ? (
            hasData ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <ContributionGraph
                  values={stats.data}
                  endDate={new Date(selectedYear, 11, 31)}
                  numDays={365.25} // Approximate for leap years
                  width={Math.max(W - 72, (365 / 7) * 18)}
                  height={200}
                  chartConfig={{
                    ...chartConfig,
                    backgroundGradientFrom: "transparent",
                    backgroundGradientTo: "transparent",
                    color: (o = 1) => `rgba(199, 153, 255, ${o})`,
                    labelColor: (o = 1) => `rgba(82, 85, 92, ${o})`,
                  }}
                  tooltipDataAttrs={() => ({ rx: "4", ry: "4" })}
                  style={{ borderRadius: 12, marginLeft: -16 }}
                />
              </ScrollView>
            ) : (
              <View style={S.chartEmpty}>
                <Ionicons name="calendar-outline" size={40} color="#2e3139" />
                <Text style={S.chartEmptyTitle}>No data for {selectedYear}</Text>
                <Text style={S.chartEmptyText}>Complete tasks to see your yearly heatmap</Text>
              </View>
            )
          ) : hasData ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ paddingTop: 8, paddingRight: 8, paddingBottom: 4 }}>
                <BarChart
                  data={stats.data.map((value, i) => ({
                    value,
                    label: stats.labels ? stats.labels[i] : "",
                    frontColor: value > 0 ? "#c799ff" : "rgba(199,153,255,0.1)",
                    gradientColor: value > 0 ? "#00e3fd" : undefined,
                    showGradient: value > 0,
                  }))}
                  barWidth={range === "monthly" ? 10 : 22}
                  spacing={range === "monthly" ? 10 : 22}
                  roundedTop roundedBottom hideRules
                  xAxisThickness={0} yAxisThickness={0}
                  yAxisTextStyle={{ color: "#45484f", fontSize: 10, fontFamily: "Inter_500Medium" }}
                  xAxisLabelTextStyle={{ color: "#45484f", fontSize: 10, fontFamily: "Inter_500Medium" }}
                  noOfSections={4} maxValue={Math.max(...stats.data, 5)}
                  isAnimated animationDuration={1000}
                />
              </View>
            </ScrollView>
          ) : (
            <View style={S.chartEmpty}>
              <Ionicons name="bar-chart-outline" size={40} color="#2e3139" />
              <Text style={S.chartEmptyTitle}>No activity yet</Text>
              <Text style={S.chartEmptyText}>Complete tasks to see your {range} trend</Text>
            </View>
          )}
        </View>


        {/* ── Monthly Calendar View ── */}
        <View style={[S.card, S.cardWide, { marginBottom: 40 }]}>
          <GlassBackground color="rgba(28,32,40,0.5)" />
          <View style={S.chartHeader}>
            <View style={S.chartHeaderLeft}>
              <Ionicons name="calendar" size={15} color="#00e3fd" />
              <Text style={S.chartTitle}>Activity Calendar</Text>
            </View>
          </View>
          <Calendar
            theme={{
              backgroundColor: "transparent",
              calendarBackground: "transparent",
              textSectionTitleColor: "#52555c",
              selectedDayBackgroundColor: "#c799ff",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#c799ff",
              dayTextColor: "#ecedf6",
              textDisabledColor: "#2e3139",
              dotColor: "#c799ff",
              selectedDotColor: "#ffffff",
              arrowColor: "#c799ff",
              monthTextColor: "#fff",
              indicatorColor: "#c799ff",
              textDayFontFamily: "Inter_500Medium",
              textMonthFontFamily: "Outfit_700Bold",
              textDayHeaderFontFamily: "Inter_600SemiBold",
              textDayFontSize: 13,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12,
            }}
            markedDates={
              range === "yearly" && Array.isArray(stats.data)
                ? stats.data.reduce((acc, curr) => {
                    if (curr && typeof curr === "object" && curr.count > 0) {
                      acc[curr.date] = { marked: true, dotColor: "#c799ff" };
                    }
                    return acc;
                  }, {})
                : {}
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0b0e14" },
  scroll: { paddingBottom: 100 },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  label: { fontSize: 11, color: "#c799ff", fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 },
  title: { fontSize: 30, color: "#fff", fontFamily: "Outfit_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: "#45484f", fontFamily: "Inter_400Regular", marginTop: 4 },

  // Range toggle
  rangeRow: { flexDirection: "row", marginHorizontal: 16, marginBottom: 14, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  rangeBtn: { flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rangeBtnActive: { backgroundColor: "rgba(255,255,255,0.08)" },
  rangeBtnText: { fontSize: 11, color: "#45484f", fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 1 },
  rangeBtnTextActive: { color: "#fff" },

  // Year picker
  yearRow: { marginHorizontal: 16, marginBottom: 18 },
  yearRowLabel: { fontSize: 10, color: "#3a3d45", fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 },
  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownBtnContent: { flexDirection: "row", alignItems: "center", gap: 10 },
  dropdownBtnText: { fontSize: 15, color: "#fff", fontFamily: "Outfit_600SemiBold" },
  currentYearBadge: {
    fontSize: 9,
    color: "#c799ff",
    fontFamily: "Inter_600SemiBold",
    backgroundColor: "rgba(199,153,255,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { width: "100%", maxWidth: 340, maxHeight: "60%", borderRadius: 28, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  modalTitle: { fontSize: 18, color: "#fff", fontFamily: "Outfit_700Bold" },
  yearOption: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.03)" },
  yearOptionActive: { backgroundColor: "rgba(199,153,255,0.05)" },
  yearOptionText: { fontSize: 16, color: "#52555c", fontFamily: "Inter_500Medium" },
  yearOptionTextActive: { color: "#fff", fontFamily: "Inter_600SemiBold" },

  // Cards
  cardRow: { flexDirection: "row", marginHorizontal: 16, marginBottom: 12 },
  card: { borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", overflow: "hidden", position: "relative", padding: 18 },
  cardHalf: { flex: 1 },
  cardWide: { marginHorizontal: 16, marginBottom: 12 },
  cardBgIcon: { position: "absolute", right: -10, top: -10, zIndex: 0 },
  cardIconRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12, zIndex: 10 },
  cardMiniLabel: { fontSize: 10, color: "#52555c", fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 1.5 },
  cardBigNumber: { fontSize: 38, color: "#fff", fontFamily: "Outfit_700Bold", letterSpacing: -1, zIndex: 10 },
  cardUnit: { fontSize: 14, color: "#45484f", fontFamily: "Inter_400Regular", letterSpacing: 0 },

  rateSub: { fontSize: 12, color: "#45484f", fontFamily: "Inter_400Regular", marginTop: 4 },

  // Chart
  chartHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16, zIndex: 10 },
  chartHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  chartTitle: { fontSize: 14, color: "#ecedf6", fontFamily: "Outfit_700Bold" },
  rangeChip: { backgroundColor: "rgba(199,153,255,0.12)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(199,153,255,0.2)" },
  rangeChipText: { fontSize: 10, color: "#c799ff", fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 1 },
  chartEmpty: { height: 150, alignItems: "center", justifyContent: "center" },
  chartEmptyTitle: { fontSize: 14, color: "#3a3d45", fontFamily: "Outfit_700Bold", marginTop: 12 },
  chartEmptyText: { fontSize: 12, color: "#2e3139", fontFamily: "Inter_400Regular", marginTop: 4 },
});
