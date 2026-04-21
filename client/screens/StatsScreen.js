import React, { useState } from "react";
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
  BarChart,
  ContributionGraph,
  ProgressChart,
} from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStats } from "../hooks/useTodos";

const screenWidth = Dimensions.get("window").width;

export default function StatsScreen() {
  const [range, setRange] = useState("weekly"); // weekly | monthly | yearly

  const { data, isLoading, refetch, isRefetching } = useStats(range);

  const stats = data || {
    labels: ["M", "T", "W", "T", "F", "S", "S"],
    data: [0, 0, 0, 0, 0, 0, 0],
    todayCount: 0,
    streak: 0,
    completionRate: 0,
    totalCompleted: 0,
    totalFocusTime: 0,
  };

  const chartConfig = {
    backgroundGradientFrom: "#1c2028", // surface-container-high
    backgroundGradientTo: "#1c2028",
    fillShadowGradientFrom: "#00e3fd", // neon blue
    fillShadowGradientTo: "#00e3fd",
    fillShadowGradientFromOpacity: 0.4,
    fillShadowGradientToOpacity: 0.1,
    color: (opacity = 1) => `rgba(0, 227, 253, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    labelColor: (opacity = 1) => `rgba(169, 171, 179, ${opacity})`, // on_surface_variant
    decimalPlaces: 0,
  };

  if (isLoading && !isRefetching) {
    return (
      <View className="flex-1 justify-center items-center bg-background-dark">
        <ActivityIndicator color="#c799ff" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background-dark">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#c799ff"
          />
        }
      >
        <View className="px-4 py-4">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="bg-primary/20 p-2 rounded-xl">
              <Ionicons name="stats-chart" size={24} color="#c799ff" />
            </View>
            <Text className="text-3xl font-display text-white tracking-tight">
              Analytics
            </Text>
          </View>
          <Text className="text-sm font-body text-text-muted-dark mb-10">
            Deep dive into your operational efficiency and historical data.
          </Text>

          {/* Range Selector */}
          <View className="flex-row mb-6 p-1 rounded-2xl bg-white/5 border border-white/10">
            {["weekly", "monthly", "yearly"].map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRange(r)}
                className={`flex-1 py-3 rounded-xl items-center transition-all ${
                  range === r ? "bg-white/10" : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-xs font-label uppercase tracking-widest ${
                    range === r ? "text-white" : "text-text-muted-dark"
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
            <View className="flex-1 p-5 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden">
              <View className="absolute -right-4 -top-4 opacity-10">
                <Ionicons name="flame" size={80} color="#c799ff" />
              </View>
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="flame" size={20} color="#c799ff" />
                <Text className="text-xs font-label uppercase tracking-wider text-text-muted-dark">
                  Active Streak
                </Text>
              </View>
              <Text className="text-4xl font-display text-white">
                {stats.streak}{" "}
                <Text className="text-base font-body text-text-muted-dark">
                  days
                </Text>
              </Text>
            </View>

            {/* Total Wins Card */}
            <View className="flex-1 p-5 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden">
              <View className="absolute -right-4 -top-4 opacity-10">
                <Ionicons name="checkmark-done" size={80} color="#00e3fd" />
              </View>
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="checkmark-circle" size={20} color="#00e3fd" />
                <Text className="text-xs font-label uppercase tracking-wider text-text-muted-dark">
                  Total Done
                </Text>
              </View>
              <Text className="text-4xl font-display text-white">
                {stats.totalCompleted}{" "}
                <Text className="text-base font-body text-text-muted-dark">
                  tasks
                </Text>
              </Text>
            </View>
          </View>

          {/* Deep Focus Time Card */}
          <View className="w-full p-5 mb-6 rounded-3xl bg-primary/10 border border-primary/20 relative overflow-hidden">
            <View className="absolute -right-6 -top-6 opacity-10">
              <Ionicons name="time" size={100} color="#c799ff" />
            </View>
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="time-outline" size={20} color="#c799ff" />
              <Text className="text-xs font-label uppercase tracking-wider text-primary">
                Total Deep Focus
              </Text>
            </View>
            <Text className="text-4xl font-display text-white">
              {stats.totalFocusTime ? Math.floor(stats.totalFocusTime / 60) : 0}{" "}
              <Text className="text-base font-body text-primary">min</Text>
            </Text>
          </View>

          {/* Visualization Area */}
          <View className="p-5 rounded-3xl bg-card-dark border border-white/10 mb-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-display text-white tracking-wide">
                Activity Trend
              </Text>
              <Text className="text-xs font-label text-secondary uppercase tracking-widest">
                {range === "weekly"
                  ? "Last 7 Days"
                  : range === "monthly"
                    ? "This Month"
                    : "This Year"}
              </Text>
            </View>

            {/* Chart */}
            {range === "yearly" ? (
              // HEATMAP
              stats.data?.length > 0 ? (
                <ContributionGraph
                  values={stats.data}
                  endDate={new Date()}
                  numDays={105}
                  width={screenWidth - 80}
                  height={220}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(199, 153, 255, ${opacity})`, // primary neon purple
                  }}
                  tooltipDataAttrs={() => ({ rx: "4", ry: "4" })}
                />
              ) : (
                <Text className="text-text-muted-dark font-body text-center py-10">
                  No yearly data available.
                </Text>
              )
            ) : // BAR CHART
            stats.data?.length > 0 &&
              (range === "weekly" ? stats.data.some((x) => x > 0) : true) ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={{
                    labels: stats.labels || [],
                    datasets: [{ data: stats.data || [] }],
                  }}
                  width={Math.max(
                    screenWidth - 80,
                    (stats.labels?.length || 0) *
                      (range === "monthly" ? 30 : 50),
                  )}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{
                    ...chartConfig,
                    barPercentage: range === "monthly" ? 0.3 : 0.6,
                  }}
                  style={{ borderRadius: 16, paddingRight: 20 }}
                  showValuesOnTopOfBars={range === "weekly"}
                />
              </ScrollView>
            ) : (
              <View className="h-40 items-center justify-center">
                <Ionicons name="bar-chart-outline" size={48} color="#45484f" />
                <Text className="text-text-muted-dark font-body mt-4">
                  No activity recorded yet.
                </Text>
              </View>
            )}
          </View>

          {/* Completion Rate */}
          <View className="p-5 rounded-3xl bg-white/5 border border-white/10 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-xl font-display text-white tracking-wide mb-1">
                Today's Rate
              </Text>
              <Text className="text-text-muted-dark font-body text-sm leading-5">
                Tasks completed today out of all active tasks.
              </Text>
            </View>
            <View className="items-center justify-center">
              <ProgressChart
                data={{ labels: ["Done"], data: [stats.completionRate || 0] }}
                width={90}
                height={90}
                strokeWidth={10}
                radius={32}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(199, 153, 255, ${opacity})`,
                }}
                hideLegend={true}
              />
              <View className="absolute inset-0 items-center justify-center">
                <Text className="text-sm font-display text-white mt-1">
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
