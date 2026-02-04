import React from "react";
import { Modal, View, Text, TouchableOpacity, Platform } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function CustomAlert({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "bg-red-500", // Default danger
}) {
  const { isDark } = useTheme();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View
          className={`w-[85%] max-w-sm p-6 rounded-3xl ${
            isDark ? "bg-gray-900 border border-gray-800" : "bg-white"
          } shadow-2xl`}
          style={
            Platform.OS === "ios"
              ? {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                }
              : { elevation: 10 }
          }
        >
          <Text
            className={`text-xl font-bold mb-3 text-center ${
              isDark ? "text-gray-100" : "text-gray-900"
            }`}
          >
            {title}
          </Text>
          <Text
            className={`text-base mb-6 text-center ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {message}
          </Text>

          <View className="flex-row justify-between gap-3">
            {onCancel && (
              <TouchableOpacity
                onPress={onCancel}
                className={`flex-1 py-3 rounded-xl border ${
                  isDark
                    ? "border-gray-600 bg-gray-700"
                    : "border-gray-200 bg-gray-100"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    isDark ? "text-white" : "text-gray-700"
                  }`}
                >
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onConfirm}
              className={`flex-1 py-3 rounded-xl ${confirmColor}`}
            >
              <Text className="text-white text-center font-semibold">
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
