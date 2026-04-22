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
import { BlurView } from "expo-blur";
import { createElement } from "react";

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
      <View className="flex-1 justify-center items-center">
        <TouchableWithoutFeedback onPress={onCancel}>
          <View className="absolute inset-0">
            {Platform.OS === "web" ? (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(11, 14, 20, 0.4)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              />
            ) : (
              <BlurView
                intensity={40}
                tint="dark"
                className="absolute inset-0"
              />
            )}
          </View>
        </TouchableWithoutFeedback>
        <Animated.View
          className="w-[85%] max-w-sm rounded-[24px] shadow-2xl items-center overflow-hidden border border-white/10"
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
          {Platform.OS === "web" ? (
            <div
              style={{
                width: "100%",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "rgba(11, 14, 20, 0.4)",
                backdropFilter:
                  "blur(24px) saturate(180%) contrast(120%) brightness(110%)",
                WebkitBackdropFilter:
                  "blur(24px) saturate(180%) contrast(120%) brightness(110%)",
                zIndex: 9999,
                position: "relative",
              }}
            >
              {/* Icon Circle */}
              <View
                className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
                  isDark ? "bg-white/10" : "bg-black/10"
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
                        ? "border-white/20 bg-white/10"
                        : "border-black/20 bg-black/10"
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
            </div>
          ) : (
            <BlurView
              intensity={70}
              tint="dark"
              className="w-full p-6 items-center"
            >
              {/* Icon Circle */}
              <View
                className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
                  isDark ? "bg-white/10" : "bg-black/10"
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
                        ? "border-white/20 bg-white/10"
                        : "border-black/20 bg-black/10"
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
            </BlurView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}
