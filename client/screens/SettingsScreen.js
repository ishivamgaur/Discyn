import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { logout } from "../services/authService";

import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen({ setIsLoggedIn }) {
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      if (setIsLoggedIn) {
        setIsLoggedIn(false);
      } else {
        console.warn("setIsLoggedIn prompt missing");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to logout");
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className={`flex-1 p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <Text
        className={`text-3xl font-bold mb-8 ${isDark ? "text-white" : "text-gray-800"}`}
      >
        Settings ⚙️
      </Text>

      {/* Theme Section */}
      <View
        className={`p-4 rounded-xl mb-4 flex-row justify-between items-center ${isDark ? "bg-card-dark" : "bg-card-light"} shadow-sm`}
      >
        <View>
          <Text
            className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}
          >
            Dark Mode
          </Text>
          <Text className="text-gray-500 text-xs">Easy on the eyes</Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: "#767577", true: "#4f46e5" }} // Switch colors are tricky with Tailwind, keeping hex for now or use theme hook if needed.
          thumbColor={isDark ? "#f4f3f4" : "#f4f3f4"}
        />
      </View>

      {/* Account Section */}
      <View
        className={`p-4 rounded-xl mb-4 ${isDark ? "bg-card-dark" : "bg-card-light"} shadow-sm`}
      >
        <Text
          className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}
        >
          Account
        </Text>
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-danger p-3 rounded-lg items-center"
        >
          <Text className="text-white font-bold">Logout</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-center text-gray-400 mt-10">Version 2.0 (Pro)</Text>
    </SafeAreaView>
  );
}
