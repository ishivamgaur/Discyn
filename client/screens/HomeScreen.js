import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
} from "react-native-reanimated";
import { useTodos, useToggleComplete } from "../hooks/useTodos";
import { useAuthStore } from "../store/useAuthStore";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const calcStreak = (history = []) => {
  if (!history || history.length === 0) return 0;
  const uniqueDays = [
    ...new Set(history.map((d) => new Date(d).toISOString().slice(0, 10))),
  ]
    .sort()
    .reverse();
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  if (uniqueDays[0] !== todayStr && uniqueDays[0] !== yesterdayStr) return 0;
  let streak = 0;
  let checkDate = new Date(uniqueDays[0]);
  for (const dateStr of uniqueDays) {
    if (dateStr === checkDate.toISOString().slice(0, 10)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

export default function HomeScreen({ navigation }) {
  const { user } = useAuthStore();
  const userName = user?.name || "Shivam";
  const { data: todos = [], isLoading, refetch, isRefetching } = useTodos();
  const toggleCompleteMutation = useToggleComplete();

  const toggleComplete = (item) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    toggleCompleteMutation.mutate(item);
  };

  const routines = todos.filter((t) => t.isRecurring);
  const tasks = todos.filter((t) => !t.isRecurring);
  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  const routinesDone = routines.filter((t) => t.isCompleted).length;
  const routinesTotal = routines.length;
  const routinePercent =
    routinesTotal === 0 ? 0 : Math.round((routinesDone / routinesTotal) * 100);

  const progress = useSharedValue(0);
  React.useEffect(() => {
    progress.value = withSpring(routinePercent / 100, {
      damping: 15,
      stiffness: 90,
    });
  }, [routinePercent]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: 2 * Math.PI * 50 * (1 - progress.value),
  }));

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const renderTask = (item) => (
    <TouchableOpacity
      key={item._id}
      activeOpacity={0.7}
      onPress={() => navigation.navigate("TodoDetail", { todo: item })}
      className={`flex-row items-center py-4 px-1 ${item.isCompleted ? "opacity-40" : "opacity-100"}`}
    >
      <TouchableOpacity
        onPress={() => toggleComplete(item)}
        className={`w-6 h-6 rounded-lg border-2 items-center justify-center mr-3 ${
          item.isCompleted ? "bg-secondary border-secondary" : "border-white/20"
        }`}
        style={
          item.isCompleted
            ? {
                shadowColor: "#00e3fd",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 6,
                elevation: 4,
              }
            : {}
        }
      >
        {item.isCompleted && (
          <Ionicons name="checkmark" size={14} color="#0b0e14" />
        )}
      </TouchableOpacity>
      <View className="flex-1">
        <Text
          className={`text-sm font-body ${item.isCompleted ? "text-text-muted-dark line-through" : "text-white"}`}
        >
          {item.title}
        </Text>
      </View>
      {item.priority === "HIGH" && (
        <View className="bg-red-500/15 px-2 py-0.5 rounded-md ml-2">
          <Text className="text-[10px] font-label uppercase text-red-400 tracking-wider">
            High
          </Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={14} color="#3a3d44" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-dark" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#c799ff"
          />
        }
      >
        {/* ── Header ─────────────────────────────────────── */}
        <View className="px-4 pt-6 pb-8">
          <Text className="text-sm font-body text-text-muted-dark mb-1">
            {greeting}
          </Text>
          <Text className="text-3xl font-display text-white tracking-tight">
            Hello, {userName} 👋
          </Text>
        </View>

        {/* ── Daily Routine Progress ─────────────────────── */}
        {routinesTotal > 0 && (
          <View className="mx-4 mt-2 mb-10 p-5 rounded-[24px] bg-white/[0.03] border border-white/[0.06]">
            <View className="flex-row items-center">
              <View className="relative items-center justify-center mr-6">
                <Svg width="84" height="84" viewBox="0 0 120 120">
                  <Circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#1c2028"
                    strokeWidth="10"
                    fill="none"
                  />
                  <AnimatedCircle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#00e3fd"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 50}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </Svg>
                <View className="absolute items-center justify-center">
                  <Text className="text-xl font-display text-white">
                    {routinePercent}%
                  </Text>
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-label text-text-muted-dark uppercase tracking-widest mb-2">
                  Daily Routines
                </Text>
                <View className="flex-row items-baseline mb-0.5">
                  <Text className="text-2xl font-display text-white">
                    {routinesDone}
                  </Text>
                  <Text className="text-sm font-body text-text-muted-dark ml-1">
                    / {routinesTotal}
                  </Text>
                </View>
                <Text className="text-xs font-body text-text-muted-dark">
                  completed today
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Routines Checklist ──────────────────────────── */}
        {routines.length > 0 && (
          <View className="mx-4 mb-10">
            <View className="flex-row items-center gap-2 mb-4 px-1">
              <View className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <Text className="text-xs font-label text-text-muted-dark uppercase tracking-widest">
                Routines — {routinesDone}/{routinesTotal}
              </Text>
            </View>
            <View className="bg-white/[0.03] border border-white/[0.06] rounded-[20px] px-4 py-1">
              {routines.map((item, i) => (
                <View key={item._id}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      navigation.navigate("TodoDetail", { todo: item })
                    }
                    className={`flex-row items-center py-4 ${item.isCompleted ? "opacity-40" : "opacity-100"}`}
                  >
                    <TouchableOpacity
                      onPress={() => toggleComplete(item)}
                      className={`w-6 h-6 rounded-lg border-2 items-center justify-center mr-3 ${
                        item.isCompleted
                          ? "bg-secondary border-secondary"
                          : "border-white/20"
                      }`}
                    >
                      {item.isCompleted && (
                        <Ionicons name="checkmark" size={14} color="#0b0e14" />
                      )}
                    </TouchableOpacity>
                    <View className="flex-1">
                      <Text
                        className={`text-sm font-body ${item.isCompleted ? "text-text-muted-dark line-through" : "text-white"}`}
                      >
                        {item.title}
                      </Text>
                    </View>
                    {calcStreak(item.completionHistory) > 0 && (
                      <View className="flex-row items-center bg-orange-500/10 px-2 py-0.5 rounded-md mr-1">
                        <Ionicons name="flame" size={12} color="#f97316" />
                        <Text className="text-[10px] font-label text-orange-400 ml-0.5">
                          {calcStreak(item.completionHistory)}d
                        </Text>
                      </View>
                    )}
                    <Ionicons name="repeat" size={14} color="#52555c" />
                  </TouchableOpacity>
                  {i < routines.length - 1 && (
                    <View className="h-px bg-white/[0.05]" />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Active Tasks ───────────────────────────────── */}
        {activeTasks.length > 0 && (
          <View className="mx-4 mb-10">
            <View className="flex-row items-center gap-2 mb-4 px-1">
              <View className="w-1.5 h-1.5 rounded-full bg-primary" />
              <Text className="text-xs font-label text-text-muted-dark uppercase tracking-widest">
                Active Tasks — {activeTasks.length}
              </Text>
            </View>
            <View className="bg-white/[0.03] border border-white/[0.06] rounded-[20px] px-4 py-1">
              {activeTasks.map((item, i) => (
                <View key={item._id}>
                  {renderTask(item)}
                  {i < activeTasks.length - 1 && (
                    <View className="h-px bg-white/[0.05]" />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Completed Tasks ────────────────────────────── */}
        {completedTasks.length > 0 && (
          <View className="mx-4 mb-10">
            <View className="flex-row items-center gap-2 mb-4 px-1">
              <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <Text className="text-xs font-label text-text-muted-dark uppercase tracking-widest">
                Done — {completedTasks.length}
              </Text>
            </View>
            <View className="bg-white/[0.03] border border-white/[0.06] rounded-[20px] px-4 py-1">
              {completedTasks.map((item, i) => (
                <View key={item._id}>
                  {renderTask(item)}
                  {i < completedTasks.length - 1 && (
                    <View className="h-px bg-white/[0.05]" />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {todos.length === 0 && !isLoading && (
          <View className="items-center py-20 opacity-40 mx-4">
            <Ionicons name="leaf-outline" size={48} color="#45484f" />
            <Text className="mt-4 text-text-muted-dark font-body text-sm text-center leading-6">
              Your day is clear.{"\n"}Tap + to add your first task.
            </Text>
          </View>
        )}
      </ScrollView>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("AddTodo", { type: "task" })}
        className="absolute bottom-8 right-6 w-16 h-16 rounded-full bg-primary items-center justify-center"
        style={{
          shadowColor: "#c799ff",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.6,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <Ionicons name="add" size={32} color="#0b0e14" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
