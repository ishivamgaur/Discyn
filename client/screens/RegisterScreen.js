import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import api, { setAuthToken } from "../services/authService";
import { useTheme } from "../context/ThemeContext";

export default function RegisterScreen({ navigation, setIsLoggedIn }) {
  const { isDark } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const { data } = await api.post("/api/users/register", {
        name,
        email,
        password,
      });

      await setAuthToken(data.accessToken, data.refreshToken);
      if (setIsLoggedIn) setIsLoggedIn(true);
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        error.response?.data?.message || "Something went wrong",
      );
    }
  };

  return (
    <View
      className={`flex-1 justify-center p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <Text className="text-3xl font-bold mb-8 text-center text-primary">
        Create Account
      </Text>

      <TextInput
        className={`p-4 rounded-lg mb-4 border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
        placeholder="Full Name"
        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        className={`p-4 rounded-lg mb-4 border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
        placeholder="Email"
        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        className={`p-4 rounded-lg mb-6 border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
        placeholder="Password"
        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className={`p-4 rounded-lg items-center mb-4 bg-primary`}
        onPress={handleRegister}
      >
        <Text className="text-white font-bold text-lg">Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
        className="p-2"
      >
        <Text
          className={`text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          Already have an account?{" "}
          <Text className="text-primary font-bold">Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
