import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { LineChart, ProgressChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/authService";
import { useTheme } from "../context/ThemeContext";

const screenWidth = Dimensions.get("window").width;

import { SafeAreaView } from "react-native-safe-area-context";

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
    backgroundGradientFrom: isDark ? "#1f2937" : "#ffffff",
    backgroundGradientTo: isDark ? "#111827" : "#ffffff",
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    labelColor: (opacity = 1) =>
      isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#4f46e5",
    },
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-6">
          <Text
            className={`text-2xl font-bold mb-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Daily Discipline 🛡️
          </Text>
          <Text className="text-gray-500 mb-6">
            Track your consistency and focus.
          </Text>

          {/* Range Selector */}
          <View
            className={`flex-row mb-6 bg-gray-200 dark:bg-gray-800 rounded-lg p-1 ${
              isDark ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            {["weekly", "monthly", "yearly"].map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRange(r)}
                className={`flex-1 py-2 rounded-md ${
                  range === r
                    ? isDark
                      ? "bg-gray-700"
                      : "bg-white shadow-sm"
                    : ""
                }`}
              >
                <Text
                  className={`text-center font-bold capitalize ${
                    range === r ? "text-primary" : "text-gray-500"
                  }`}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Streak Card */}
          <View className="flex-row gap-4 mb-6">
            <View
              className={`flex-1 p-4 rounded-2xl ${
                isDark ? "bg-gray-800" : "bg-white"
              } shadow-sm items-center`}
            >
              <Text className="text-4xl font-bold text-secondary">
                🔥 {stats.streak}
              </Text>
              <Text
                className={`text-sm font-semibold mt-2 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Day Streak
              </Text>
            </View>
            <View
              className={`flex-1 p-4 rounded-2xl ${
                isDark ? "bg-gray-800" : "bg-white"
              } shadow-sm items-center`}
            >
              <Text className="text-4xl font-bold text-primary">
                ✅ {stats.totalCompleted}
              </Text>
              <Text
                className={`text-sm font-semibold mt-2 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Total Wins
              </Text>
            </View>
          </View>

          {/* Line Chart */}
          <View
            className={`p-4 rounded-2xl ${
              isDark ? "bg-gray-800" : "bg-white"
            } shadow-sm mb-6`}
          >
            <Text
              className={`text-lg font-bold mb-4 capitalize ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              {range} Performance
            </Text>
            {stats.data.length > 0 ? (
              <LineChart
                data={{
                  labels: stats.labels,
                  datasets: [{ data: stats.data }],
                }}
                width={screenWidth - 80}
                height={220}
                yAxisInterval={1}
                chartConfig={chartConfig}
                bezier
                style={{ borderRadius: 16 }}
                getDotColor={() => "#4f46e5"}
              />
            ) : (
              <Text className="text-gray-500 text-center py-10">
                No data available
              </Text>
            )}
          </View>

          {/* Progress Ring */}
          <View
            className={`p-4 rounded-2xl ${
              isDark ? "bg-gray-800" : "bg-white"
            } shadow-sm mb-6 flex-row items-center`}
          >
            <View>
              <Text
                className={`text-lg font-bold mb-1 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Success Rate
              </Text>
              <Text className="text-gray-500 text-xs w-40">
                Percentage of tasks completed vs created.
              </Text>
            </View>
            <ProgressChart
              data={{ labels: ["Done"], data: [stats.completionRate] }}
              width={screenWidth * 0.4}
              height={120}
              strokeWidth={16}
              radius={32}
              chartConfig={chartConfig}
              hideLegend={true}
            />
            <Text
              className={`text-xl font-bold absolute right-12 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              {Math.round(stats.completionRate * 100)}%
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
