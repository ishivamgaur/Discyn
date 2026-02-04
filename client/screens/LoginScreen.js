import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import api, { setAuthToken } from "../services/authService";
import { useTheme } from "../context/ThemeContext";

export default function LoginScreen({ navigation, setIsLoggedIn }) {
  const { isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const { data } = await api.post("/api/users/login", {
        email,
        password,
      });

      await setAuthToken(data.accessToken, data.refreshToken);
      if (setIsLoggedIn) setIsLoggedIn(true);
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "Something went wrong",
      );
    }
  };

  return (
    <View
      className={`flex-1 justify-center p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <View className="mb-10">
        <Text className="text-4xl font-bold text-center text-primary mb-2">
          Todo App
        </Text>
        <Text
          className={`text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}
        >
          Master your day
        </Text>
      </View>

      <Text
        className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-800"}`}
      >
        Login
      </Text>

      <TextInput
        className={`p-4 rounded-lg mb-4 border text-base ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
        placeholder="Email"
        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        className={`p-4 rounded-lg mb-6 border text-base ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
        placeholder="Password"
        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className={`p-4 rounded-lg items-center mb-4 shadow-sm bg-primary`}
        onPress={handleLogin}
      >
        <Text className="text-white font-bold text-lg">Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Register")}
        className="p-2"
      >
        <Text
          className={`text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          Don't have an account?{" "}
          <Text className="text-primary font-bold">Register</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
