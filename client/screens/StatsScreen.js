import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  LineChart,
  BarChart,
  ContributionGraph,
  ProgressChart,
} from "react-native-chart-kit";

// ... imports

// ... inside component

import { useFocusEffect } from "@react-navigation/native";
import api from "../services/authService";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

export default function StatsScreen() {
  const { isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState("weekly"); // weekly | monthly | yearly
  const [stats, setStats] = useState({
    labels: ["M", "T", "W", "T", "F", "S", "S"],
    data: [0, 0, 0, 0, 0, 0, 0],
    todayCount: 0,
    streak: 0,
    completionRate: 0,
    totalCompleted: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await api.get(`/todos/stats?range=${range}`);

      setStats((prev) => ({
        ...prev,
        labels: data.labels,
        data: data.data,
        completionRate: data.completionRate,
        todayCount: data.data[data.data.length - 1] || 0,
        totalCompleted: data.totalCompleted,
      }));
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [range]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats().finally(() => setRefreshing(false));
  }, [range]);

  const chartConfig = {
    backgroundGradientFrom: isDark ? "#18181b" : "#ffffff", // Zinc 900 / White
    backgroundGradientTo: isDark ? "#18181b" : "#ffffff",
    fillShadowGradientFrom: "#3b82f6", // Blue 500
    fillShadowGradientTo: "#3b82f6",
    fillShadowGradientFromOpacity: 0.2,
    fillShadowGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue 500
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    labelColor: (opacity = 1) =>
      isDark
        ? `rgba(161, 161, 170, ${opacity})`
        : `rgba(113, 113, 122, ${opacity})`, // Zinc 400 / 500
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#2563eb", // Blue 600
    },
    decimalPlaces: 0,
  };

  if (loading && !refreshing) {
    return (
      <View
        className={`flex-1 justify-center items-center ${isDark ? "bg-background-dark" : "bg-background-light"}`}
      >
        <ActivityIndicator color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background-light"}`}
    >
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? "#fff" : "#000"}
          />
        }
      >
        <View className="px-6 py-6">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="bg-primary/10 p-2 rounded-lg">
              <Ionicons name="stats-chart" size={24} color="#3b82f6" />
            </View>
            <Text
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Performance
            </Text>
          </View>
          <Text
            className={`text-sm mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}
          >
            Track your consistency and focus over time.
          </Text>

          {/* Range Selector */}
          <View
            className={`flex-row mb-6 p-1 rounded-xl ${
              isDark ? "bg-card-highlight-dark" : "bg-zinc-100"
            }`}
          >
            {["weekly", "monthly", "yearly"].map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRange(r)}
                className={`flex-1 py-2 rounded-lg items-center ${
                  range === r
                    ? isDark
                      ? "bg-zinc-700"
                      : "bg-white shadow-sm"
                    : ""
                }`}
              >
                <Text
                  className={`text-xs font-bold capitalize ${
                    range === r
                      ? isDark
                        ? "text-white"
                        : "text-gray-900"
                      : isDark
                        ? "text-zinc-500"
                        : "text-zinc-500"
                  }`}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cards Row */}
          <View className="flex-row gap-4 mb-6">
            {/* Streak Card */}
            <View
              className={`flex-1 p-5 rounded-3xl border ${
                isDark
                  ? "bg-card-dark border-zinc-800"
                  : "bg-white border-zinc-100"
              }`}
            >
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="flame" size={20} color="#ef4444" />
                <Text
                  className={`text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  Streak
                </Text>
              </View>
              <Text
                className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {stats.streak}{" "}
                <Text className="text-sm font-normal text-zinc-500">days</Text>
              </Text>
            </View>

            {/* Total Wins Card */}
            <View
              className={`flex-1 p-5 rounded-3xl border ${
                isDark
                  ? "bg-card-dark border-zinc-800"
                  : "bg-white border-zinc-100"
              }`}
            >
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                <Text
                  className={`text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  Total
                </Text>
              </View>
              <Text
                className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {stats.totalCompleted}{" "}
                <Text className="text-sm font-normal text-zinc-500">done</Text>
              </Text>
            </View>
          </View>

          {/* Visualization Area */}
          <View
            className={`p-4 rounded-3xl border mb-6 ${
              isDark
                ? "bg-card-dark border-zinc-800"
                : "bg-white border-zinc-100"
            }`}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text
                className={`text-base font-bold capitalize px-2 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Activity Trend
              </Text>
              <Text
                className={`text-xs font-medium px-2 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
              >
                {range === "weekly"
                  ? "Last 7 Days"
                  : range === "monthly"
                    ? "This Month"
                    : "This Year"}
              </Text>
            </View>

            {/* Chart Switching Logic */}
            {range === "yearly" ? (
              // HEATMAP
              stats.data.length > 0 ? (
                <ContributionGraph
                  values={stats.data} // [{date: "YYYY-MM-DD", count: 1}]
                  endDate={new Date()}
                  numDays={105}
                  width={screenWidth - 70}
                  height={220}
                  chartConfig={{
                    ...chartConfig,
                    backgroundGradientFrom: isDark ? "#18181b" : "#ffffff",
                    backgroundGradientTo: isDark ? "#18181b" : "#ffffff",
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    labelColor: (opacity = 1) =>
                      isDark
                        ? `rgba(255, 255, 255, ${opacity})`
                        : `rgba(0, 0, 0, ${opacity})`,
                  }}
                  tooltipDataAttrs={(value) => ({
                    rx: "2",
                    ry: "2",
                  })}
                />
              ) : (
                <Text className="text-zinc-500 text-center py-10">
                  No yearly data yet
                </Text>
              )
            ) : // BAR CHART for Weekly/Monthly
            stats.data.length > 0 &&
              (range === "weekly" ? stats.data.some((x) => x > 0) : true) ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={{
                    labels: stats.labels,
                    datasets: [{ data: stats.data }],
                  }}
                  width={Math.max(
                    screenWidth - 80,
                    stats.labels.length * (range === "monthly" ? 30 : 50),
                  )}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{
                    ...chartConfig,
                    barPercentage: range === "monthly" ? 0.3 : 0.6,
                    decimalPlaces: 0,
                  }}
                  style={{
                    borderRadius: 16,
                    paddingRight: 20,
                  }}
                  showValuesOnTopOfBars={range === "weekly"}
                />
              </ScrollView>
            ) : (
              <View className="h-40 items-center justify-center">
                <Ionicons
                  name="bar-chart-outline"
                  size={48}
                  color={isDark ? "#333" : "#eee"}
                />
                <Text className="text-zinc-400 mt-2">
                  No activity recorded yet
                </Text>
              </View>
            )}
          </View>

          {/* Completion Rate */}
          <View
            className={`p-5 rounded-3xl border mb-6 flex-row items-center justify-between ${
              isDark
                ? "bg-card-dark border-zinc-800"
                : "bg-white border-zinc-100"
            }`}
          >
            <View className="flex-1 pr-4">
              <Text
                className={`text-lg font-bold mb-1 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Completion Rate
              </Text>
              <Text className="text-zinc-500 text-xs leading-5">
                Your efficiency in completing tasks vs creating them.
              </Text>
            </View>
            <View className="items-center justify-center">
              <ProgressChart
                data={{ labels: ["Done"], data: [stats.completionRate || 0] }}
                width={80}
                height={80}
                strokeWidth={8}
                radius={28}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`, // Blue
                }}
                hideLegend={true}
              />
              <View className="absolute inset-0 items-center justify-center">
                <Text
                  className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {Math.round((stats.completionRate || 0) * 100)}%
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
