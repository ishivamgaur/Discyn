import "./global.css";
import React, { useEffect, useState } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as Notifications from "expo-notifications";
import { Platform, View, ActivityIndicator, Text } from "react-native";
import { loadUser, logout } from "./services/authService";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { Ionicons } from "@expo/vector-icons"; // Icons for tabs

import HomeScreen from "./screens/HomeScreen";
import AddTodoScreen from "./screens/AddTodoScreen";
import ReminderScreen from "./screens/ReminderScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import StatsScreen from "./screens/StatsScreen";
import HistoryScreen from "./screens/HistoryScreen";
import SettingsScreen from "./screens/SettingsScreen";
import TodoDetailScreen from "./screens/TodoDetailScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Create the Tab Navigator (The Main "App" Interface)
function AppTabs({ setIsLoggedIn }) {
  const { isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: isDark ? "#111827" : "#4f46e5" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        tabBarStyle: {
          backgroundColor: isDark ? "#1f2937" : "#ffffff",
          borderTopColor: isDark ? "#374151" : "#e5e7eb",
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: "#4f46e5",
        tabBarInactiveTintColor: isDark ? "#9ca3af" : "gray",
        tabBarShowLabel: true, // Show labels for standard feel
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginBottom: 5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Stats") {
            iconName = focused ? "bar-chart" : "bar-chart-outline";
          } else if (route.name === "History") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return (
            <Ionicons
              name={iconName}
              size={24}
              color={color}
              style={{ marginTop: 5 }}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "My Tasks" }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{ title: "Discipline" }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: "History" }}
      />
      <Tab.Screen name="Settings">
        {(props) => <SettingsScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Wrapper to handle Theme Context inside NavigationContainer
function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    (async () => {
      const hasToken = await loadUser();
      setIsLoggedIn(hasToken);
      setIsLoading(false);

      // Listen for auto-logout (token expiry)
      const { setLogoutCallback } = require("./services/authService");
      setLogoutCallback(() => {
        setIsLoggedIn(false);
      });

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      if (existingStatus !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <View
        className={`flex-1 justify-center items-center ${isDark ? "bg-gray-900" : "bg-gray-100"}`}
      >
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const navigationTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: "#111827", // Match bg-gray-900
          card: "#1f2937", // Match bg-gray-800
          text: "#ffffff",
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: "#f9fafb", // Match bg-gray-50
          card: "#ffffff",
          text: "#111827",
        },
      };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: isDark ? "#111827" : "#4f46e5" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          animation: "slide_from_right", // Smooth page transitions
          presentation: "card",
          contentStyle: { backgroundColor: isDark ? "#111827" : "#f9fafb" },
        }}
      >
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Main" options={{ headerShown: false }}>
              {(props) => <AppTabs {...props} setIsLoggedIn={setIsLoggedIn} />}
            </Stack.Screen>

            {/* Modals / Sub-screens outside the Tab Bar */}
            <Stack.Screen
              name="AddTodo"
              component={AddTodoScreen}
              options={{ title: "Add Task" }}
            />
            <Stack.Screen
              name="Reminder"
              component={ReminderScreen}
              options={{ title: "Set Reminder" }}
            />
            <Stack.Screen
              name="TodoDetail"
              component={TodoDetailScreen}
              options={{ headerShown: false, presentation: "modal" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" options={{ headerShown: false }}>
              {(props) => (
                <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />
              )}
            </Stack.Screen>
            <Stack.Screen name="Register" options={{ headerShown: false }}>
              {(props) => (
                <RegisterScreen {...props} setIsLoggedIn={setIsLoggedIn} />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
