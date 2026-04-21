import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../store/useAuthStore";
import { BlurView } from "expo-blur";

const GlassContainer = ({ children, className = "" }) => {
  const isWeb = Platform.OS === "web";
  return (
    <View className={`rounded-[24px] overflow-hidden border border-white/10 ${className}`}>
      {isWeb ? (
        <View className="liquid-glass p-0">{children}</View>
      ) : (
        <BlurView intensity={25} tint="dark" className="p-0">
          {children}
        </BlurView>
      )}
    </View>
  );
};

export default function SettingsScreen() {
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      Toast.show({ type: "error", text1: "Error", text2: "Disconnection failed" });
    }
  };

  const SettingItem = ({ icon, color, title, subtitle, rightElement, onPress }) => (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      className="flex-row items-center justify-between p-5 border-b bg-white/5 border-white/10"
    >
      <View className="flex-row items-center gap-4">
        <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View>
          <Text className="text-lg font-display text-white tracking-wide">{title}</Text>
          {subtitle && <Text className="text-xs font-body text-text-muted-dark mt-0.5">{subtitle}</Text>}
        </View>
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={20} color="#52555c" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background-dark">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View className="mb-12">
          <Text className="text-sm font-label text-secondary uppercase tracking-widest mb-1">Configuration</Text>
          <Text className="text-4xl font-display text-white tracking-tight">Settings</Text>
        </View>

        <Text className="text-xs font-label uppercase tracking-widest mb-3 px-2 text-text-muted-dark">System Preferences</Text>
        <View className="mb-8 rounded-3xl border border-white/10 overflow-hidden bg-card-dark">
          <SettingItem icon="notifications" color="#00e3fd" title="Notifications" subtitle="Manage operational alerts" />
          <SettingItem icon="shield-checkmark" color="#10b981" title="Privacy & Data" subtitle="Local storage and analytics" />
        </View>

        <Text className="text-xs font-label uppercase tracking-widest mb-3 px-2 text-text-muted-dark">Account</Text>
        <View className="mb-8 rounded-3xl border border-white/10 overflow-hidden bg-card-dark">
          <SettingItem icon="person" color="#c799ff" title="Operator Profile" subtitle="Manage your identity" />
          <SettingItem icon="cloud-sync" color="#3b82f6" title="Sync Status" subtitle="All protocols up to date" />
          <SettingItem icon="log-out" color="#ff6e84" title="Disconnect" subtitle="End current session" onPress={handleLogout} rightElement={<View/>} />
        </View>

        <View className="items-center mt-6 opacity-50">
          <Ionicons name="infinite" size={32} color="#c799ff" />
          <Text className="text-white font-display mt-2 tracking-widest">Discyn v2.0</Text>
          <Text className="text-text-muted-dark text-xs font-body mt-1">Organize. Focus. Achieve.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
