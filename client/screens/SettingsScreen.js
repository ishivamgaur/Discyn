import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../store/useAuthStore";
import GlassBackground from "../components/GlassBackground";

export default function SettingsScreen() {
  const logout = useAuthStore((s) => s.logout);
  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      Toast.show({ type: "error", text1: "Logout failed" });
    }
  };

  const GROUPS = [
    {
      label: "Preferences",
      items: [
        {
          icon: "notifications-outline",
          color: "#00e3fd",
          title: "Notifications",
          subtitle: "Manage alerts and reminders",
        },
        {
          icon: "shield-checkmark-outline",
          color: "#10b981",
          title: "Privacy & Data",
          subtitle: "Storage and analytics controls",
        },
      ],
    },
    {
      label: "Account",
      items: [
        {
          icon: "person-outline",
          color: "#c799ff",
          title: "Profile",
          subtitle: "Manage your identity",
        },
        {
          icon: "cloud-outline",
          color: "#3b82f6",
          title: "Sync",
          subtitle: "All data up to date",
        },
      ],
    },
  ];

  return (
    <SafeAreaView edges={["top"]} style={S.root}>
      <ScrollView
        contentContainerStyle={S.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={S.header}>
          <Text style={S.label}>Configuration</Text>
          <Text style={S.title}>Settings</Text>
        </View>

        {GROUPS.map((g) => (
          <View key={g.label} style={S.group}>
            <Text style={S.groupLabel}>{g.label}</Text>
            <View style={S.card}>
              <GlassBackground />
              {g.items.map((item, i) => (
                <View key={item.title}>
                  <TouchableOpacity activeOpacity={0.7} style={S.row}>
                    <View
                      style={[
                        S.iconBox,
                        { backgroundColor: item.color + "18" },
                      ]}
                    >
                      <Ionicons name={item.icon} size={18} color={item.color} />
                    </View>
                    <View style={S.rowText}>
                      <Text style={S.rowTitle}>{item.title}</Text>
                      <Text style={S.rowSub}>{item.subtitle}</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={15}
                      color="#2e3139"
                    />
                  </TouchableOpacity>
                  {i < g.items.length - 1 && <View style={S.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={S.group}>
          <View style={S.card}>
            <GlassBackground />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLogout}
              style={S.row}
            >
              <View
                style={[
                  S.iconBox,
                  { backgroundColor: "rgba(255,110,132,0.12)" },
                ]}
              >
                <Ionicons name="log-out-outline" size={18} color="#ff6e84" />
              </View>
              <View style={S.rowText}>
                <Text style={[S.rowTitle, { color: "#ff6e84" }]}>Sign Out</Text>
                <Text style={S.rowSub}>End current session</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={S.footer}>
          <Ionicons name="infinite" size={22} color="#c799ff" />
          <Text style={S.footerApp}>Discyn</Text>
          <Text style={S.footerTagline}>Organize · Focus · Achieve</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0b0e14" },
  scroll: { paddingBottom: 60 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  label: {
    fontSize: 11,
    color: "#c799ff",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    color: "#fff",
    fontFamily: "Outfit_700Bold",
    letterSpacing: -0.5,
  },
  group: { marginHorizontal: 16, marginBottom: 20 },
  groupLabel: {
    fontSize: 10,
    color: "#3a3d45",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 1.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    position: "relative",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  rowText: { flex: 1 },
  rowTitle: {
    fontSize: 14,
    color: "#ecedf6",
    fontFamily: "Inter_500Medium",
    marginBottom: 2,
  },
  rowSub: { fontSize: 12, color: "#45484f", fontFamily: "Inter_400Regular" },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    marginLeft: 66,
  },
  footer: { alignItems: "center", paddingVertical: 28, gap: 5 },
  footerApp: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "Outfit_700Bold",
    letterSpacing: 2,
  },
  footerTagline: {
    fontSize: 11,
    color: "#3a3d45",
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.8,
  },
});
