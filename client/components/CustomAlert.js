import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CustomAlert({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "bg-red-500", // Default danger
  icon = "alert-circle", // Default icon
  iconColor = "#ef4444", // Default icon color (red-500)
}) {
  const isDark = true;
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleValue.setValue(0);
      opacityValue.setValue(0);
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
      animationType="none"
      statusBarTranslucent
    >
      <View className="flex-1 justify-center items-center bg-black/60">
        <Animated.View
          className={`w-[85%] max-w-sm p-6 rounded-3xl ${
            isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white"
          } shadow-2xl items-center`}
          style={[
            Platform.OS === "ios"
              ? {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.4,
                  shadowRadius: 20,
                }
              : { elevation: 20 },
            {
              opacity: opacityValue,
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          {/* Icon Circle */}
          <View
            className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
              isDark ? "bg-zinc-800" : "bg-zinc-100"
            }`}
          >
            <Ionicons name={icon} size={32} color={iconColor} />
          </View>

          <Text
            className={`text-xl font-bold mb-2 text-center ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </Text>
          <Text
            className={`text-sm mb-8 text-center px-2 ${
              isDark ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            {message}
          </Text>

          <View className="flex-row w-full gap-3">
            {onCancel && (
              <TouchableOpacity
                onPress={onCancel}
                activeOpacity={0.8}
                className={`flex-1 py-3.5 rounded-2xl border ${
                  isDark
                    ? "border-zinc-700 bg-zinc-800"
                    : "border-zinc-200 bg-zinc-100"
                }`}
              >
                <Text
                  className={`text-center font-bold text-sm ${
                    isDark ? "text-white" : "text-gray-700"
                  }`}
                >
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.9}
              className={`flex-1 py-3.5 rounded-2xl shadow-lg ${confirmColor}`}
            >
              <Text className="text-white text-center font-bold text-sm">
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
