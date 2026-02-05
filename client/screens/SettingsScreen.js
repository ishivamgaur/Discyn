import React from "react";
import { View, Text, TouchableOpacity, Switch, ScrollView } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { logout } from "../services/authService";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCustomAlert } from "../hooks/useCustomAlert";
import CustomAlert from "../components/CustomAlert";

export default function SettingsScreen({ setIsLoggedIn }) {
  const { isDark, toggleTheme } = useTheme();
  const { alertProps, showAlert } = useCustomAlert();

  const handleLogout = async () => {
    showAlert({
      title: "Log Out",
      message: "Are you sure you want to log out of your account?",
      icon: "log-out-outline",
      iconColor: "#ef4444",
      confirmText: "Log Out",
      confirmColor: "bg-red-500",
      onCancel: () => {},
      onConfirm: async () => {
        try {
          await logout();
          if (setIsLoggedIn) setIsLoggedIn(false);
        } catch (e) {
          showAlert({ title: "Error", message: "Failed to logout" });
        }
      },
    });
  };

  const SettingItem = ({
    icon,
    color,
    title,
    subtitle,
    rightElement,
    onPress,
  }) => (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      className={`flex-row items-center justify-between p-4 border-b ${
        isDark ? "bg-card-dark border-zinc-800" : "bg-white border-zinc-100"
      } first:rounded-t-2xl last:rounded-b-2xl last:border-b-0`}
    >
      <View className="flex-row items-center gap-3">
        <View
          className={`w-8 h-8 rounded-lg items-center justify-center`}
          style={{ backgroundColor: color }}
        >
          <Ionicons name={icon} size={18} color="white" />
        </View>
        <View>
          <Text
            className={`text-base font-medium ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              className={`text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement ? (
        rightElement
      ) : (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDark ? "#52525b" : "#d4d4d8"}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      edges={["top"]}
      className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background-light"}`}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text
          className={`text-3xl font-bold mb-6 px-2 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Settings
        </Text>

        <Text
          className={`text-xs font-bold uppercase tracking-widest mb-3 px-2 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}
        >
          Preferences
        </Text>

        <View className="mb-8">
          <SettingItem
            icon="moon"
            color="#6366f1" // Indigo
            title="Dark Mode"
            subtitle="Easy on the eyes"
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: "#e4e4e7", true: "#6366f1" }}
                thumbColor={"#fff"}
              />
            }
          />
          <SettingItem
            icon="notifications"
            color="#f43f5e" // Rose
            title="Notifications"
            subtitle="Manage alerts"
          />
        </View>

        <Text
          className={`text-xs font-bold uppercase tracking-widest mb-3 px-2 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}
        >
          Account
        </Text>
        <View className="mb-8">
          <SettingItem
            icon="person"
            color="#3b82f6" // Blue
            title="Profile"
            subtitle="Manage your info"
          />
          <SettingItem
            icon="log-out"
            color="#ef4444" // Red
            title="Log Out"
            onPress={handleLogout}
            rightElement={null} // No chevron for action
          />
        </View>

        <View className="items-center mt-4">
          <Text className="text-zinc-400 font-medium">Todo App v2.0</Text>
          <Text className="text-zinc-600 text-xs">Made with ❤️ by You</Text>
        </View>
      </ScrollView>
      <CustomAlert {...alertProps} />
    </SafeAreaView>
  );
}
