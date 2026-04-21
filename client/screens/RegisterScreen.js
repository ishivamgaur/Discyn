import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import haptics from "../services/hapticsService";
import { useAuthStore } from "../store/useAuthStore";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const register = useAuthStore((state) => state.register);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      haptics.error();
      Toast.show({ type: "error", text1: "Error", text2: "Please fill all fields" });
      return;
    }

    try {
      setLoading(true);
      await register({ name, email, password });
      haptics.success();
    } catch (error) {
      haptics.error();
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background-dark">
      <View className="px-4 py-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center rounded-full bg-white/5 border border-white/10"
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-4 justify-center pb-16"
      >
        <View className="w-full max-w-sm self-center">
        <View className="mb-10">
          <Text className="text-4xl font-display text-white tracking-tighter mb-2">
            Create Profile
          </Text>
          <Text className="text-sm font-label text-text-muted-dark uppercase tracking-widest">
            Join Discyn
          </Text>
        </View>

        <View className="space-y-4">
          <View className="bg-white/5 border border-white/10 rounded-2xl flex-row items-center px-4 h-14">
            <Ionicons name="person-outline" size={20} color="#a9abb3" />
            <TextInput
              className="flex-1 ml-3 text-white font-body text-base h-full"
              placeholder="Operator Alias"
              placeholderTextColor="#52555c"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View className="bg-white/5 border border-white/10 rounded-2xl flex-row items-center px-4 h-14 mt-4">
            <Ionicons name="mail-outline" size={20} color="#a9abb3" />
            <TextInput
              className="flex-1 ml-3 text-white font-body text-base h-full"
              placeholder="System Email"
              placeholderTextColor="#52555c"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View className="bg-white/5 border border-white/10 rounded-2xl flex-row items-center px-4 h-14 mt-4">
            <Ionicons name="lock-closed-outline" size={20} color="#a9abb3" />
            <TextInput
              className="flex-1 ml-3 text-white font-body text-base h-full"
              placeholder="Secure Passcode"
              placeholderTextColor="#52555c"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className="w-full bg-secondary h-14 rounded-2xl items-center justify-center mt-8 shadow-lg shadow-secondary/30"
          >
            {loading ? (
              <ActivityIndicator color="#0b0e14" />
            ) : (
              <Text className="text-[#0b0e14] font-display text-lg tracking-wider">
                Authenticate Profile
              </Text>
            )}
          </TouchableOpacity>
        </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
