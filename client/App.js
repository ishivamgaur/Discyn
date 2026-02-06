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
import * as SystemUI from "expo-system-ui";
import { Platform, View, ActivityIndicator, StatusBar } from "react-native";
import { loadUser } from "./services/authService";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./screens/HomeScreen";
import AddTodoScreen from "./screens/AddTodoScreen";
import ReminderScreen from "./screens/ReminderScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import StatsScreen from "./screens/StatsScreen";
import HistoryScreen from "./screens/HistoryScreen";
import SettingsScreen from "./screens/SettingsScreen";
import TodoDetailScreen from "./screens/TodoDetailScreen";
import RoutinesScreen from "./screens/RoutinesScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function AppTabs({ setIsLoggedIn }) {
  const { isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // We'll rely on custom headers or safe area views
        tabBarStyle: {
          backgroundColor: isDark ? "#09090b" : "#ffffff", // Pure black/white
          borderTopColor: isDark ? "#27272a" : "#f4f4f5", // Subtle borders
          borderTopWidth: 0.5,
          height: Platform.OS === "ios" ? 85 : 65,
          paddingTop: 10,
          elevation: 0, // Remove shadow for flat look
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: isDark ? "#ffffff" : "#09090b", // High contrast active
        tabBarInactiveTintColor: isDark ? "#52525b" : "#a1a1aa", // Muted inactive
        tabBarShowLabel: false, // Minimalist: No labels
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          const iconSize = 28; // Slightly larger for touch targets

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Routines") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Stats") {
            iconName = focused ? "pie-chart" : "pie-chart-outline";
          } else if (route.name === "History") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return (
            <Ionicons
              name={iconName}
              size={iconSize}
              color={color}
              style={{ opacity: focused ? 1 : 0.8 }}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Routines" component={RoutinesScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings">
        {(props) => <SettingsScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    (async () => {
      const hasToken = await loadUser();
      setIsLoggedIn(hasToken);
      setIsLoading(false);

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
          sound: "default", // Explicit sound
          enableVibrate: true,
        });
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Notification permissions not granted!");
      }
    })();
  }, []);

  // Faster transition spec
  const transitionSpec = {
    open: {
      animation: "spring",
      config: {
        stiffness: 1000,
        damping: 50,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
    close: {
      animation: "spring",
      config: {
        stiffness: 1000,
        damping: 50,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
  };

  const navigationTheme = React.useMemo(() => {
    return isDark
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: "#09090b", // Zinc 950
            card: "#18181b", // Zinc 900
            text: "#fafafa",
            border: "#27272a",
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: "#ffffff",
            card: "#ffffff",
            text: "#09090b",
            border: "#e4e4e7",
          },
        };
  }, [isDark]);

  useEffect(() => {
    const setRootBackground = async () => {
      try {
        await SystemUI.setBackgroundColorAsync(isDark ? "#09090b" : "#ffffff");
      } catch (e) {
        console.warn("SystemUI error:", e);
      }
    };
    setRootBackground();
  }, [isDark]);

  if (isLoading) {
    return (
      <View
        className={`flex-1 justify-center items-center ${
          isDark ? "bg-background-dark" : "bg-background-light"
        }`}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? "#ffffff" : "#000000"}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#09090b" : "#ffffff" }}>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={isDark ? "#09090b" : "#ffffff"}
        />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right", // Default for main screens
            presentation: "card",
            contentStyle: { backgroundColor: isDark ? "#09090b" : "#ffffff" }, // Fix white flash
          }}
        >
          {isLoggedIn ? (
            <>
              <Stack.Screen name="Main">
                {(props) => (
                  <AppTabs {...props} setIsLoggedIn={setIsLoggedIn} />
                )}
              </Stack.Screen>

              {/* Modals & Full Screen Flows */}
              <Stack.Screen
                name="AddTodo"
                component={AddTodoScreen}
                options={{
                  presentation: "modal", // Native modal feel
                  animation: "slide_from_bottom", // Slide up/down
                  gestureEnabled: true,
                  gestureDirection: "vertical",
                  transitionSpec: {
                    open: transitionSpec.open,
                    close: transitionSpec.close,
                  },
                }}
              />
              <Stack.Screen
                name="Reminder"
                component={ReminderScreen}
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                  gestureEnabled: true,
                  gestureDirection: "vertical",
                  transitionSpec: {
                    open: transitionSpec.open,
                    close: transitionSpec.close,
                  },
                }}
              />
              <Stack.Screen
                name="TodoDetail"
                component={TodoDetailScreen}
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                  gestureEnabled: true,
                  gestureDirection: "vertical",
                  transitionSpec: {
                    open: transitionSpec.open,
                    close: transitionSpec.close,
                  },
                }}
              />
            </>
          ) : (
            <>
              <Stack.Screen name="Login">
                {(props) => (
                  <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />
                )}
              </Stack.Screen>
              <Stack.Screen name="Register">
                {(props) => (
                  <RegisterScreen {...props} setIsLoggedIn={setIsLoggedIn} />
                )}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}
