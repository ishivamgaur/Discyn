import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import haptics from "../services/hapticsService";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUpdateTodo, useDeleteTodo, useTodos } from "../hooks/useTodos";
import GlassBackground from "../components/GlassBackground";

const FOCUS_PRESETS = [
  { label: "15m", seconds: 15 * 60, color: "#10b981" },
  { label: "25m", seconds: 25 * 60, color: "#c799ff" },
  { label: "45m", seconds: 45 * 60, color: "#00e3fd" },
  { label: "60m", seconds: 60 * 60, color: "#f59e0b" },
];

const PRIORITY_OPTIONS = [
  {
    value: "LOW",
    label: "Low",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    icon: "arrow-down-outline",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    icon: "remove-outline",
  },
  {
    value: "HIGH",
    label: "High",
    color: "#ff6e84",
    bg: "rgba(255,110,132,0.12)",
    icon: "arrow-up-outline",
  },
];

export default function TodoDetailScreen({ route, navigation }) {
  const routeTodo = route.params?.todo;
  const todoId = route.params?.todoId || routeTodo?._id;
  const { data: todos = [], isLoading: isTodosLoading } = useTodos();
  const todo = todos.find((item) => item._id === todoId) || routeTodo;
  const updateMutation = useUpdateTodo();
  const deleteMutation = useDeleteTodo();

  const [title, setTitle] = useState(routeTodo?.title || "");
  const [description, setDescription] = useState(routeTodo?.description || "");
  const [isCompleted, setIsCompleted] = useState(routeTodo?.isCompleted || false);
  const [priority, setPriority] = useState(routeTodo?.priority || "MEDIUM");

  // Timer
  const [focusMode, setFocusMode] = useState("stopwatch");
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeSpent, setTimeSpent] = useState(routeTodo?.timeSpent || 0);
  const [countdownTotal, setCountdownTotal] = useState(25 * 60);
  const [countdownLeft, setCountdownLeft] = useState(25 * 60);
  const [sessions, setSessions] = useState(0);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const initializedTodoIdRef = useRef(null);

  const RING = 180;
  const STROKE = 8;
  const R = (RING - STROKE * 2) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * R;

  useEffect(() => {
    if (!todo || initializedTodoIdRef.current === todo._id) return;

    setTitle(todo.title);
    setDescription(todo.description || "");
    setIsCompleted(todo.isCompleted);
    setPriority(todo.priority || "MEDIUM");
    setTimeSpent(todo.timeSpent || 0);
    initializedTodoIdRef.current = todo._id;
  }, [todo]);

  useEffect(() => {
    if (isRunning) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.025,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.2,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      glow.start();
      return () => {
        pulse.stop();
        glow.stop();
      };
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [isRunning]);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeSpent((p) => p + 1);
        if (focusMode === "countdown") {
          setCountdownLeft((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setIsRunning(false);
              setIsPaused(false);
              setSessions((s) => s + 1);
              haptics.success();
              Toast.show({
                type: "success",
                text1: "🎯 Session Complete!",
                text2: `${Math.floor(countdownTotal / 60)}m focus locked in.`,
              });
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, focusMode, countdownTotal]);

  useEffect(() => {
    if (focusMode === "countdown" && countdownTotal > 0) {
      const progress = 1 - countdownLeft / countdownTotal;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  }, [countdownLeft, countdownTotal, focusMode]);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0)
      return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleToggle = () => {
    haptics.light();
    if (isRunning) {
      setIsRunning(false);
      setIsPaused(true);
    } else {
      if (focusMode === "countdown" && countdownLeft === 0)
        setCountdownLeft(countdownTotal);
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  const handleReset = () => {
    haptics.medium();
    setIsRunning(false);
    setIsPaused(false);
    if (focusMode === "countdown") setCountdownLeft(countdownTotal);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      haptics.error();
      Toast.show({
        type: "error",
        text1: "Title required",
        text2: "Add a task title before saving your changes.",
      });
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: todo._id,
        payload: { title, description, isCompleted, timeSpent, priority },
      });
      haptics.success();
      navigation.goBack();
    } catch {
      haptics.error();
      Toast.show({
        type: "error",
        text1: "Failed to save",
        text2: "Your latest edits could not be saved right now.",
      });
    }
  };

  const handleDelete = async () => {
    haptics.medium();
    try {
      await deleteMutation.mutateAsync(todo._id);
      haptics.success();
      Toast.show({
        type: "success",
        text1: "Task deleted",
        text2: "This task and its reminders were removed.",
      });
      navigation.goBack();
    } catch {
      haptics.error();
      Toast.show({
        type: "error",
        text1: "Failed to delete",
        text2: "Discyn could not remove this task right now.",
      });
    }
  };

  const displayTime = focusMode === "countdown" ? countdownLeft : timeSpent;
  const ringProgress =
    focusMode === "countdown" && countdownTotal > 0
      ? 1 - countdownLeft / countdownTotal
      : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - ringProgress);

  if (!todo && isTodosLoading) {
    return (
      <SafeAreaView edges={["top"]} style={styles.root}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#c799ff" />
        </View>
      </SafeAreaView>
    );
  }

  if (!todo) {
    return (
      <SafeAreaView edges={["top"]} style={styles.root}>
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={42} color="#45484f" />
          <Text style={styles.centerTitle}>Task not found</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.centerAction}
          >
            <Text style={styles.centerActionText}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      {/* ── Nav Bar ── */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.navBtn}
        >
          <Ionicons name="chevron-back" size={20} color="#a9abb3" />
          <Text style={styles.navTextLeft}>Back</Text>
        </TouchableOpacity>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>Task Detail</Text>
        </View>
        <TouchableOpacity
          onPress={handleSave}
          disabled={updateMutation.isPending}
          style={styles.navBtn}
        >
          <Text
            style={[
              styles.navTextRight,
              updateMutation.isPending && { color: "#45484f" },
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Title Input ── */}
          <View style={styles.titleWrap}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              style={styles.titleInput}
              placeholder="Task Title"
              placeholderTextColor="#3a3d45"
              multiline
            />
            <View style={styles.titleMeta}>
              <View
                style={[
                  styles.completedPill,
                  isCompleted && styles.completedPillActive,
                ]}
              >
                <Ionicons
                  name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
                  size={13}
                  color={isCompleted ? "#00e3fd" : "#45484f"}
                />
                <Text
                  style={[
                    styles.completedPillText,
                    isCompleted && { color: "#00e3fd" },
                  ]}
                >
                  {isCompleted ? "Completed" : "Pending"}
                </Text>
              </View>
              {sessions > 0 && (
                <View style={styles.sessionsPill}>
                  <Ionicons name="trophy" size={12} color="#f59e0b" />
                  <Text style={styles.sessionsPillText}>
                    {sessions} {sessions === 1 ? "session" : "sessions"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* ── Priority ── */}
          <View style={styles.card}>
            <GlassBackground />
            <Text style={styles.cardLabel}>Priority</Text>
            <View style={styles.priorityRow}>
              {PRIORITY_OPTIONS.map((opt) => {
                const active = priority === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.label}
                    onPress={() => {
                      haptics.light();
                      setPriority(opt.value);
                    }}
                    style={[
                      styles.priorityBtn,
                      {
                        backgroundColor: active ? opt.bg : "transparent",
                        borderColor: active
                          ? opt.color + "60"
                          : "rgba(255,255,255,0.06)",
                      },
                    ]}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={14}
                      color={active ? opt.color : "#45484f"}
                    />
                    <Text
                      style={[
                        styles.priorityLabel,
                        { color: active ? opt.color : "#52555c" },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Notes ── */}
          <View style={styles.card}>
            <GlassBackground />
            <Text style={styles.cardLabel}>Notes</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              style={styles.notesInput}
              placeholder="Add execution details..."
              placeholderTextColor="#3a3d45"
              textAlignVertical="top"
            />
          </View>

          {/* ══════════════════════════════════════════ */}
          {/* ── FOCUS TIMER ─────────────────────────── */}
          {/* ══════════════════════════════════════════ */}
          <View style={styles.focusCard}>
            <GlassBackground color="rgba(199, 153, 255, 0.04)" />

            {/* Glow */}
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                {
                  opacity: glowOpacity,
                  backgroundColor: "rgba(199,153,255,0.05)",
                },
              ]}
            />

            {/* Header */}
            <View style={styles.focusHeader}>
              <View style={styles.focusHeaderLeft}>
                <View style={styles.focusIconBg}>
                  <Ionicons name="flash" size={14} color="#c799ff" />
                </View>
                <Text style={styles.focusHeaderTitle}>Deep Focus</Text>
              </View>
              {timeSpent > 0 && (
                <View style={styles.timeLoggedBadge}>
                  <Ionicons name="time-outline" size={12} color="#52555c" />
                  <Text style={styles.timeLoggedText}>
                    {formatTime(timeSpent)} logged
                  </Text>
                </View>
              )}
            </View>

            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
              {[
                { key: "stopwatch", label: "Stopwatch", icon: "timer-outline" },
                {
                  key: "countdown",
                  label: "Pomodoro",
                  icon: "hourglass-outline",
                },
              ].map((m) => (
                <TouchableOpacity
                  key={m.key}
                  onPress={() => {
                    if (!isRunning) {
                      haptics.light();
                      setFocusMode(m.key);
                    }
                  }}
                  style={[
                    styles.modeBtn,
                    focusMode === m.key && styles.modeBtnActive,
                  ]}
                >
                  <Ionicons
                    name={m.icon}
                    size={13}
                    color={focusMode === m.key ? "#fff" : "#52555c"}
                  />
                  <Text
                    style={[
                      styles.modeBtnText,
                      focusMode === m.key && { color: "#fff" },
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Presets */}
            {focusMode === "countdown" && !isRunning && !isPaused && (
              <View style={styles.presetRow}>
                {FOCUS_PRESETS.map((p) => {
                  const active = countdownTotal === p.seconds;
                  return (
                    <TouchableOpacity
                      key={p.label}
                      onPress={() => {
                        haptics.light();
                        setCountdownTotal(p.seconds);
                        setCountdownLeft(p.seconds);
                      }}
                      style={[
                        styles.presetBtn,
                        active && {
                          backgroundColor: p.color + "18",
                          borderColor: p.color + "50",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetText,
                          { color: active ? p.color : "#52555c" },
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Ring + Timer */}
            <Animated.View
              style={[
                styles.ringContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Svg width={RING} height={RING} style={styles.ringAbsolute}>
                <Defs>
                  <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="#c799ff" />
                    <Stop offset="100%" stopColor="#00e3fd" />
                  </LinearGradient>
                </Defs>
                {/* Track */}
                <Circle
                  cx={RING / 2}
                  cy={RING / 2}
                  r={R}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth={STROKE}
                  fill="none"
                />
                {/* Progress */}
                {focusMode === "countdown" && (
                  <Circle
                    cx={RING / 2}
                    cy={RING / 2}
                    r={R}
                    stroke="url(#ringGrad)"
                    strokeWidth={STROKE}
                    fill="none"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
                  />
                )}
                {/* Stopwatch spinning arc */}
                {focusMode === "stopwatch" && isRunning && (
                  <Circle
                    cx={RING / 2}
                    cy={RING / 2}
                    r={R}
                    stroke="#00e3fd"
                    strokeWidth={STROKE}
                    fill="none"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={CIRCUMFERENCE * 0.85}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
                  />
                )}
              </Svg>
              <View style={styles.ringCenter}>
                <Text style={styles.timerText}>{formatTime(displayTime)}</Text>
                <Text style={styles.timerSubText}>
                  {isRunning
                    ? "focusing"
                    : isPaused
                      ? "paused"
                      : focusMode === "countdown"
                        ? "ready"
                        : "idle"}
                </Text>
              </View>
            </Animated.View>

            {/* Controls */}
            <View style={styles.controlRow}>
              {(isPaused ||
                (focusMode === "countdown" &&
                  countdownLeft === 0 &&
                  !isRunning)) && (
                <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                  <Ionicons name="refresh" size={18} color="#a9abb3" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleToggle}
                style={[styles.playBtn, isRunning && styles.playBtnPaused]}
              >
                <Ionicons
                  name={isRunning ? "pause" : "play"}
                  size={22}
                  color={isRunning ? "#fff" : "#0b0e14"}
                />
                <Text
                  style={[styles.playBtnText, isRunning && { color: "#fff" }]}
                >
                  {isRunning ? "Pause" : isPaused ? "Resume" : "Start Focus"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Mark Done ── */}
          <TouchableOpacity
            onPress={() => {
              haptics.light();
              setIsCompleted(!isCompleted);
            }}
            style={[styles.doneBtn, isCompleted && styles.doneBtnActive]}
          >
            <GlassBackground
              color={isCompleted ? "rgba(0,227,253,0.12)" : undefined}
            />
            <Ionicons
              name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
              size={22}
              color={isCompleted ? "#00e3fd" : "#52555c"}
            />
            <Text
              style={[styles.doneBtnText, isCompleted && { color: "#00e3fd" }]}
            >
              {isCompleted ? "Marked Complete" : "Mark as Done"}
            </Text>
          </TouchableOpacity>

          {/* ── Delete ── */}
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={18} color="#ff6e84" />
            <Text style={styles.deleteBtnText}>Delete Task</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0b0e14" },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  centerTitle: {
    marginTop: 14,
    fontSize: 18,
    color: "#fff",
    fontFamily: "Outfit_700Bold",
  },
  centerAction: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "rgba(199,153,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(199,153,255,0.2)",
  },
  centerActionText: {
    fontSize: 12,
    color: "#c799ff",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },

  // Nav
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  navBtn: { flexDirection: "row", alignItems: "center", minWidth: 64 },
  navCenter: { flex: 1, alignItems: "center" },
  navTitle: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Outfit_700Bold",
    letterSpacing: 0.5,
  },
  navTextLeft: {
    fontSize: 13,
    color: "#a9abb3",
    fontFamily: "Inter_500Medium",
    marginLeft: 2,
  },
  navTextRight: {
    fontSize: 12,
    color: "#c799ff",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "right",
    flex: 1,
  },

  // Scroll
  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },

  // Title
  titleWrap: { marginBottom: 20 },
  titleInput: {
    fontSize: 28,
    color: "#fff",
    fontFamily: "Outfit_700Bold",
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  titleMeta: { flexDirection: "row", gap: 8 },
  completedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  completedPillActive: {
    backgroundColor: "rgba(0,227,253,0.08)",
    borderColor: "rgba(0,227,253,0.2)",
  },
  completedPillText: {
    fontSize: 11,
    color: "#52555c",
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sessionsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(245,158,11,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.2)",
  },
  sessionsPillText: {
    fontSize: 11,
    color: "#f59e0b",
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  // Cards
  card: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
    position: "relative",
  },
  cardLabel: {
    fontSize: 10,
    color: "#52555c",
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 1.8,
    marginBottom: 12,
    zIndex: 10,
  },

  // Priority
  priorityRow: { flexDirection: "row", gap: 10, zIndex: 10 },
  priorityBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  priorityLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Notes
  notesInput: {
    fontSize: 15,
    color: "#ecedf6",
    fontFamily: "Inter_400Regular",
    height: 100,
    zIndex: 10,
  },

  // Focus Card
  focusCard: {
    marginBottom: 14,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(199,153,255,0.15)",
    overflow: "hidden",
    position: "relative",
  },

  // Focus Header
  focusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    zIndex: 10,
  },
  focusHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  focusIconBg: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "rgba(199,153,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(199,153,255,0.2)",
  },
  focusHeaderTitle: {
    fontSize: 12,
    color: "#c799ff",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  timeLoggedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  timeLoggedText: {
    fontSize: 10,
    color: "#52555c",
    fontFamily: "Inter_400Regular",
  },

  // Mode Toggle
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 3,
    marginBottom: 16,
    zIndex: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  modeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 13,
  },
  modeBtnActive: { backgroundColor: "rgba(255,255,255,0.08)" },
  modeBtnText: {
    fontSize: 11,
    color: "#52555c",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Presets
  presetRow: { flexDirection: "row", gap: 8, marginBottom: 20, zIndex: 10 },
  presetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    backgroundColor: "transparent",
  },
  presetText: { fontSize: 12, fontFamily: "Outfit_700Bold" },

  // Ring
  ringContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    zIndex: 10,
    height: 180,
  },
  ringAbsolute: { position: "absolute" },
  ringCenter: { alignItems: "center", justifyContent: "center" },
  timerText: {
    fontSize: 42,
    color: "#fff",
    fontFamily: "Outfit_700Bold",
    letterSpacing: -1,
  },
  timerSubText: {
    fontSize: 10,
    color: "#52555c",
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 4,
  },

  // Controls
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    zIndex: 10,
  },
  resetBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    backgroundColor: "#c799ff",
    shadowColor: "#c799ff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
  },
  playBtnPaused: {
    backgroundColor: "rgba(255,255,255,0.08)",
    shadowOpacity: 0,
  },
  playBtnText: {
    fontSize: 13,
    color: "#0b0e14",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },

  // Done button
  doneBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 10,
    overflow: "hidden",
    position: "relative",
  },
  doneBtnActive: { borderColor: "rgba(0,227,253,0.25)" },
  doneBtnText: {
    fontSize: 15,
    color: "#52555c",
    fontFamily: "Outfit_700Bold",
    letterSpacing: 0.4,
  },

  // Delete
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: "rgba(255,110,132,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,110,132,0.15)",
  },
  deleteBtnText: {
    fontSize: 14,
    color: "#ff6e84",
    fontFamily: "Inter_500Medium",
  },
});
