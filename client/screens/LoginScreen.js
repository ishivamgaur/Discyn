import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api, { setAuthToken } from "../services/authService";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen({ navigation, setIsLoggedIn }) {
  const { isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-background-dark" : "bg-white"}`}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className={`flex-1 ${isDark ? "bg-background-dark" : "bg-white"}`}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-center px-8">
            {/* Logo / Brand Area */}
            <View className="items-center mb-12">
              <View className="w-20 h-20 bg-primary rounded-3xl items-center justify-center mb-6 shadow-lg shadow-primary/50">
                <Ionicons name="layers" size={40} color="white" />
              </View>
              <Text
                className={`text-4xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Welcome Back
              </Text>
              <Text
                className={`text-base font-medium ${isDark ? "text-zinc-500" : "text-zinc-500"}`}
              >
                Sign in to continue planning
              </Text>
            </View>

            {/* Form Area */}
            <View className="space-y-4">
              <View className="mb-4">
                <Text
                  className={`mb-2 font-medium ${isDark ? "text-zinc-300" : "text-gray-700"}`}
                >
                  Email Address
                </Text>
                <TextInput
                  className={`p-4 rounded-2xl border ${isDark ? "bg-card-dark border-zinc-700 text-white" : "bg-zinc-50 border-zinc-200 text-gray-900"}`}
                  placeholder="you@example.com"
                  placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View className="mb-8">
                <Text
                  className={`mb-2 font-medium ${isDark ? "text-zinc-300" : "text-gray-700"}`}
                >
                  Password
                </Text>
                <TextInput
                  className={`p-4 rounded-2xl border ${isDark ? "bg-card-dark border-zinc-700 text-white" : "bg-zinc-50 border-zinc-200 text-gray-900"}`}
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                className={`p-4 rounded-2xl items-center shadow-lg shadow-blue-500/30 ${loading ? "bg-primary-light" : "bg-primary"}`}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text className="text-white font-bold text-lg">
                  {loading ? "Signing in..." : "Sign In"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View className="mt-8 flex-row justify-center">
              <Text className={`${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text className="text-primary font-bold">Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
