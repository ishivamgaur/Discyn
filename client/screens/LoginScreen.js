import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import haptics from "../services/hapticsService";
import { useAuthStore } from "../store/useAuthStore";
import GlassBackground from "../components/GlassBackground";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      haptics.error();
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill all fields",
      });
      return;
    }

    try {
      setLoading(true);
      await login({ email, password });
      haptics.success();
    } catch (error) {
      haptics.error();
      Toast.show({
        type: "error",
        text1: "Access Denied",
        text2: error.response?.data?.message || "Invalid credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          className="px-4"
        >
          <View className="w-full max-w-sm self-center">
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-primary/20 rounded-full items-center justify-center mb-6 border border-primary/30">
                <Ionicons name="infinite" size={40} color="#c799ff" />
              </View>
              <Text className="text-4xl font-display text-white tracking-tighter mb-2">
                Discyn
              </Text>
              <Text className="text-sm font-label text-text-muted-dark uppercase tracking-widest text-center">
                Organize. Focus. Achieve.
              </Text>
            </View>

            <View className="space-y-4">
              <View className="border border-white/10 rounded-2xl flex-row items-center px-4 h-14 relative overflow-hidden">
                <GlassBackground />
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#a9abb3"
                  className="z-10"
                />
                <TextInput
                  className="flex-1 ml-3 text-white font-body text-base h-full z-10"
                  placeholder="Operator Email"
                  placeholderTextColor="#52555c"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View className="border border-white/10 rounded-2xl flex-row items-center px-4 h-14 mt-4 relative overflow-hidden">
                <GlassBackground />
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#a9abb3"
                  className="z-10"
                />
                <TextInput
                  className="flex-1 ml-3 text-white font-body text-base h-full z-10"
                  placeholder="Passcode"
                  placeholderTextColor="#52555c"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-2"
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#a9abb3"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity className="mt-4 items-end">
                <Text className="text-primary font-label text-xs uppercase tracking-widest">
                  Forgot Passcode?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className="w-full bg-primary h-14 rounded-2xl items-center justify-center mt-8 shadow-lg shadow-primary/30"
              >
                {loading ? (
                  <ActivityIndicator color="#0b0e14" />
                ) : (
                  <Text className="text-[#0b0e14] font-display text-lg tracking-wider">
                    Initialize Session
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-12">
              <Text className="text-text-muted-dark font-body text-sm">
                Unregistered Operator?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text className="text-secondary font-label uppercase tracking-widest text-xs mt-0.5">
                  Create Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
