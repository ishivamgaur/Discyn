import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { View, Text, Animated, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Safe wrapper for useSafeAreaInsets - returns defaults if not available
const useSafeInsets = () => {
  try {
    // Only use on native platforms
    if (Platform.OS === "web") {
      return { top: 50, bottom: 0, left: 0, right: 0 };
    }
    const { useSafeAreaInsets } = require("react-native-safe-area-context");
    return useSafeAreaInsets();
  } catch (e) {
    return { top: 50, bottom: 0, left: 0, right: 0 };
  }
};

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const TOAST_DURATION = 3000;

const TOAST_TYPES = {
  success: { icon: "checkmark-circle", color: "#22c55e", bg: "#14532d" },
  error: { icon: "close-circle", color: "#ef4444", bg: "#7f1d1d" },
  info: { icon: "information-circle", color: "#3b82f6", bg: "#1e3a8a" },
  warning: { icon: "warning", color: "#f59e0b", bg: "#78350f" },
};

export function ToastProvider({ children }) {
  const insets = useSafeInsets();
  const [toast, setToast] = useState(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef(null);

  const showToast = useCallback(
    ({ message, type = "info" }) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToast({ message, type });

      // Animate in
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();

      // Auto hide
      timeoutRef.current = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setToast(null));
      }, TOAST_DURATION);
    },
    [translateY],
  );

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    Animated.timing(translateY, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setToast(null));
  }, [translateY]);

  const config = toast ? TOAST_TYPES[toast.type] : TOAST_TYPES.info;

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.container,
            {
              top: insets.top + 10,
              backgroundColor: config.bg,
              transform: [{ translateY }],
            },
          ]}
        >
          <Ionicons name={config.icon} size={24} color={config.color} />
          <Text style={[styles.message, { color: "#fff" }]}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
});
