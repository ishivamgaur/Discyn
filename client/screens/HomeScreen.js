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
  StyleSheet,
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
import GlassBackground from "../components/GlassBackground";

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
    } else break;
  }
  return streak;
};

const PRIORITY_COLOR = { HIGH: "#ff6e84", MEDIUM: "#f59e0b", LOW: "#10b981" };

export default function HomeScreen({ navigation }) {
  const { user } = useAuthStore();
  const userName = user?.name?.split(" ")[0] || "there";
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

  const TaskRow = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate("TodoDetail", { todo: item })}
      style={[styles.taskRow, item.isCompleted && { opacity: 0.4 }]}
    >
      <TouchableOpacity
        onPress={() => toggleComplete(item)}
        style={[styles.checkbox, item.isCompleted && styles.checkboxDone]}
      >
        {item.isCompleted && (
          <Ionicons name="checkmark" size={13} color="#0b0e14" />
        )}
      </TouchableOpacity>
      <View style={styles.taskInfo}>
        <Text
          style={[styles.taskTitle, item.isCompleted && styles.taskTitleDone]}
        >
          {item.title}
        </Text>
        {item.description ? (
          <Text style={styles.taskSubtitle} numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
      </View>
      {item.priority === "HIGH" && (
        <View style={styles.priorityPill}>
          <Text style={styles.priorityPillText}>High</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={13} color="#2e3139" />
    </TouchableOpacity>
  );

  const SectionHeader = ({ dot, label }) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionDot, { backgroundColor: dot }]} />
      <Text style={styles.sectionLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.headline}>Hello, Shivam 👋</Text>
        </View>

        {/* Routine Progress Card */}
        {routinesTotal > 0 && (
          <View style={styles.progressCard}>
            <GlassBackground />
            <View style={styles.progressInner}>
              <View style={styles.ringWrap}>
                <Svg width={80} height={80} viewBox="0 0 120 120">
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
                <View style={styles.ringLabel}>
                  <Text style={styles.ringPercent}>{routinePercent}%</Text>
                </View>
              </View>
              <View style={styles.progressMeta}>
                <Text style={styles.progressMetaLabel}>Daily Routines</Text>
                <Text style={styles.progressMetaCount}>
                  <Text style={styles.progressMetaBig}>{routinesDone}</Text>
                  <Text style={styles.progressMetaTotal}>
                    {" "}
                    / {routinesTotal}
                  </Text>
                </Text>
                <Text style={styles.progressMetaSub}>completed today</Text>
              </View>
            </View>
          </View>
        )}

        {/* Routines List */}
        {routines.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              dot="#00e3fd"
              label={`Routines — ${routinesDone}/${routinesTotal}`}
            />
            <View style={styles.listCard}>
              <GlassBackground />
              {routines.map((item, i) => (
                <View key={item._id}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      navigation.navigate("TodoDetail", { todo: item })
                    }
                    style={[
                      styles.taskRow,
                      item.isCompleted && { opacity: 0.4 },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => toggleComplete(item)}
                      style={[
                        styles.checkbox,
                        item.isCompleted && styles.checkboxDone,
                      ]}
                    >
                      {item.isCompleted && (
                        <Ionicons name="checkmark" size={13} color="#0b0e14" />
                      )}
                    </TouchableOpacity>
                    <View style={styles.taskInfo}>
                      <Text
                        style={[
                          styles.taskTitle,
                          item.isCompleted && styles.taskTitleDone,
                        ]}
                      >
                        {item.title}
                      </Text>
                    </View>
                    {calcStreak(item.completionHistory) > 0 && (
                      <View style={styles.streakBadge}>
                        <Ionicons name="flame" size={11} color="#f97316" />
                        <Text style={styles.streakText}>
                          {calcStreak(item.completionHistory)}d
                        </Text>
                      </View>
                    )}
                    <Ionicons name="repeat" size={13} color="#2e3139" />
                  </TouchableOpacity>
                  {i < routines.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              dot="#c799ff"
              label={`Active — ${activeTasks.length}`}
            />
            <View style={styles.listCard}>
              <GlassBackground />
              {activeTasks.map((item, i) => (
                <View key={item._id}>
                  <TaskRow item={item} />
                  {i < activeTasks.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Completed */}
        {completedTasks.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              dot="#10b981"
              label={`Done — ${completedTasks.length}`}
            />
            <View style={styles.listCard}>
              <GlassBackground />
              {completedTasks.map((item, i) => (
                <View key={item._id}>
                  <TaskRow item={item} />
                  {i < completedTasks.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {todos.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Ionicons name="leaf-outline" size={48} color="#2e3139" />
            <Text style={styles.emptyText}>
              Your day is clear.{"\n"}Tap + to add your first task.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate("AddTodo", { type: "task" })}
        style={styles.fab}
      >
        <Ionicons name="add" size={30} color="#0b0e14" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0b0e14" },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  greeting: {
    fontSize: 11,
    color: "#c799ff",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
  },
  headline: {
    fontSize: 30,
    color: "#fff",
    fontFamily: "Outfit_700Bold",
    letterSpacing: -0.5,
  },

  // Progress card
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    position: "relative",
  },
  progressInner: { flexDirection: "row", alignItems: "center" },
  ringWrap: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },
  ringLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  ringPercent: { fontSize: 16, color: "#fff", fontFamily: "Outfit_700Bold" },
  progressMeta: { flex: 1 },
  progressMetaLabel: {
    fontSize: 10,
    color: "#52555c",
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  progressMetaCount: { marginBottom: 2 },
  progressMetaBig: {
    fontSize: 24,
    color: "#fff",
    fontFamily: "Outfit_700Bold",
  },
  progressMetaTotal: {
    fontSize: 14,
    color: "#52555c",
    fontFamily: "Inter_400Regular",
  },
  progressMetaSub: {
    fontSize: 12,
    color: "#52555c",
    fontFamily: "Inter_400Regular",
  },

  // Sections
  section: { marginHorizontal: 16, marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionDot: { width: 5, height: 5, borderRadius: 3, marginRight: 8 },
  sectionLabel: {
    fontSize: 10,
    color: "#52555c",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 1.8,
  },
  listCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    position: "relative",
    paddingHorizontal: 14,
  },

  // Task row
  taskRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  taskInfo: { flex: 1, marginLeft: 12 },
  taskTitle: { fontSize: 14, color: "#ecedf6", fontFamily: "Inter_500Medium" },
  taskTitleDone: { color: "#45484f", textDecorationLine: "line-through" },
  taskSubtitle: {
    fontSize: 12,
    color: "#45484f",
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: { backgroundColor: "#00e3fd", borderColor: "#00e3fd" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.04)" },

  // Badges
  priorityPill: {
    backgroundColor: "rgba(255,110,132,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  priorityPillText: {
    fontSize: 9,
    color: "#ff6e84",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(249,115,22,0.1)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
    gap: 3,
  },
  streakText: {
    fontSize: 10,
    color: "#f97316",
    fontFamily: "Inter_600SemiBold",
  },

  // Empty
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    color: "#3a3d45",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 28,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#c799ff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#c799ff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
  },
});
