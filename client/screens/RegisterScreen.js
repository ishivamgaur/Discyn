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
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api, { setAuthToken } from "../services/authService";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { Ionicons } from "@expo/vector-icons";

export default function RegisterScreen({ navigation, setIsLoggedIn }) {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      showToast({ message: "Please fill in all fields", type: "error" });
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.post("/api/users/register", {
        name,
        email,
        password,
      });

      await setAuthToken(data.accessToken, data.refreshToken);
      if (setIsLoggedIn) setIsLoggedIn(true);
    } catch (error) {
      showToast({
        message: error.response?.data?.message || "Something went wrong",
        type: "error",
      });
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
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 justify-center px-8">
              {/* Header Area */}
              <View className="items-center mb-10">
                <Text
                  className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Create Account
                </Text>
                <Text
                  className={`text-base font-medium ${isDark ? "text-zinc-500" : "text-zinc-500"}`}
                >
                  Start your journey to productivity
                </Text>
              </View>

              {/* Form Area */}
              <View className="space-y-4">
                <View className="mb-4">
                  <Text
                    className={`mb-2 font-medium ${isDark ? "text-zinc-300" : "text-gray-700"}`}
                  >
                    Full Name
                  </Text>
                  <TextInput
                    className={`p-4 rounded-2xl border ${isDark ? "bg-card-dark border-zinc-700 text-white" : "bg-zinc-50 border-zinc-200 text-gray-900"}`}
                    placeholder="John Doe"
                    placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

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
                    placeholder="Create a password"
                    placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  className={`p-4 rounded-2xl items-center shadow-lg shadow-blue-500/30 ${loading ? "bg-primary-light" : "bg-primary"}`}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <Text className="text-white font-bold text-lg">
                    {loading ? "Creating Account..." : "Sign Up"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Login Link */}
              <View className="mt-8 flex-row justify-center">
                <Text
                  className={`${isDark ? "text-zinc-500" : "text-zinc-500"}`}
                >
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text className="text-primary font-bold">Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
