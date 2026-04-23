import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../store/useAuthStore";
import GlassBackground from "../components/GlassBackground";
import {
  ensurePermissions,
  getNotificationPermissionStatus,
  scheduleTestNotification,
} from "../services/notificationService";

export default function SettingsScreen() {
  const logout = useAuthStore((s) => s.logout);
  const [notificationStatus, setNotificationStatus] = useState("unknown");

  const refreshNotificationStatus = async () => {
    try {
      const status = await getNotificationPermissionStatus();
      setNotificationStatus(status);
    } catch {
      setNotificationStatus("unknown");
    }
  };

  useEffect(() => {
    refreshNotificationStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      Toast.show({
        type: "error",
        text1: "Logout failed",
        text2: "Your session could not be closed right now.",
      });
    }
  };

  const handleEnableNotifications = async () => {
    try {
      const granted = await ensurePermissions();
      await refreshNotificationStatus();

      if (granted) {
        Toast.show({
          type: "success",
          text1: "Notifications enabled",
          text2: "Discyn can now notify you in the panel.",
        });
        return;
      }

      Toast.show({
        type: "error",
        text1: "Permission not granted",
        text2: "Enable notifications in device settings.",
      });
      Linking.openSettings?.();
    } catch {
      Toast.show({
        type: "error",
        text1: "Notifications unavailable",
      });
    }
  };

  const handleTestNotification = async () => {
    try {
      const scheduled = await scheduleTestNotification();
      await refreshNotificationStatus();

      if (!scheduled) {
        Toast.show({
          type: "error",
          text1: "Permission required",
          text2: "Allow notifications first.",
        });
        return;
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Test notification failed",
      });
    }
  };

  const notificationSubtitle =
    notificationStatus === "granted"
      ? "Allowed on this device"
      : notificationStatus === "denied"
        ? "Blocked - tap to enable"
        : "Manage alerts and reminders";

  const GROUPS = [
    {
      label: "Preferences",
      items: [
        {
          key: "notifications",
          icon: "notifications-outline",
          color: "#00e3fd",
          title: "Notifications",
          subtitle: notificationSubtitle,
          onPress: handleEnableNotifications,
        },
        {
          key: "notification-test",
          icon: "paper-plane-outline",
          color: "#c799ff",
          title: "Send Test Notification",
          subtitle: "Verify panel delivery in 3 seconds",
          onPress: handleTestNotification,
        },
        {
          key: "privacy",
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
          key: "profile",
          icon: "person-outline",
          color: "#c799ff",
          title: "Profile",
          subtitle: "Manage your identity",
        },
        {
          key: "sync",
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
                <View key={item.key}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={item.onPress}
                    style={S.row}
                  >
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
