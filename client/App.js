import "./global.css";
import React, { useEffect, useState } from "react";
import {
  useFonts,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from "@expo-google-fonts/outfit";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as Notifications from "expo-notifications";
import * as SystemUI from "expo-system-ui";
import {
  Platform,
  View,
  Text,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useAuthStore } from "./store/useAuthStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import HomeScreen from "./screens/HomeScreen";
import AddTodoScreen from "./screens/AddTodoScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import StatsScreen from "./screens/StatsScreen";
import HistoryScreen from "./screens/HistoryScreen";
import SettingsScreen from "./screens/SettingsScreen";
import TodoDetailScreen from "./screens/TodoDetailScreen";
import RoutinesScreen from "./screens/RoutinesScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

import * as Animatable from "react-native-animatable";

const AnimatedIcon = ({ name, focused, color, animation }) => {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (focused && ref.current) {
      ref.current.animate(animation, 600);
    }
  }, [focused]);

  return (
    <Animatable.View ref={ref} style={{ justifyContent: "center", alignItems: "center" }}>
      <Ionicons name={name} size={28} color={color} />
    </Animatable.View>
  );
};

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0b0e14",
          borderTopColor: "rgba(255,255,255,0.1)",
          borderTopWidth: 1,
          height: 64,
          elevation: 0,
          paddingBottom: 0,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          height: 64,
        },
        tabBarIconStyle: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarActiveTintColor: "#c799ff",
        tabBarInactiveTintColor: "#52555c",
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          let animation;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
            animation = "bounceIn";
          } else if (route.name === "Routines") {
            iconName = focused ? "infinite" : "infinite-outline";
            animation = "pulse";
          } else if (route.name === "Stats") {
            iconName = focused ? "bar-chart" : "bar-chart-outline";
            animation = "swing";
          } else if (route.name === "History") {
            iconName = focused ? "calendar" : "calendar-outline";
            animation = "flipInY";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
            animation = "rotate";
          }

          return <AnimatedIcon name={iconName} focused={focused} color={color} animation={animation} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Routines" component={RoutinesScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const loadSession = useAuthStore((s) => s.loadSession);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await loadSession();
      setIsLoading(false);

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#c799ff",
        });
      }
    })();
  }, []);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync("#0b0e14");
  }, []);

  const navigationTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: "#0b0e14",
      card: "#1c2028",
      text: "#ffffff",
      border: "rgba(255,255,255,0.1)",
    },
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background-dark">
        <ActivityIndicator size="large" color="#c799ff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0b0e14" }}>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar barStyle="light-content" backgroundColor="#0b0e14" />
        {Platform.OS === "web" && (
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .glassmorphism {
              background-color: rgba(11, 14, 20, 0.4) !important;
              backdrop-filter: blur(24px) !important;
              -webkit-backdrop-filter: blur(24px) !important;
            }
          `,
            }}
          />
        )}
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0b0e14" },
          }}
        >
          {isLoggedIn ? (
            <>
              <Stack.Screen name="Main" component={AppTabs} />
              <Stack.Screen
                name="AddTodo"
                component={AddTodoScreen}
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
              <Stack.Screen
                name="TodoDetail"
                component={TodoDetailScreen}
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

import { createElement } from "react";

const ToastBase = ({ text1, text2, accentColor, iconName }) => {
  const isWeb = Platform.OS === "web";

  const Content = () => (
    <>
      <View
        className="w-11 h-11 rounded-full items-center justify-center mr-3.5 border"
        style={{
          backgroundColor: accentColor + "15",
          borderColor: accentColor + "30",
        }}
      >
        <Ionicons name={iconName} size={22} color={accentColor} />
      </View>
      <View className="flex-1 justify-center">
        <Text className="text-white font-heading text-[15px] tracking-wide">
          {text1}
        </Text>
        {text2 && (
          <Text className="text-text-muted-dark font-body text-[13px] mt-0.5">
            {text2}
          </Text>
        )}
      </View>
    </>
  );

  return (
    <View
      className="w-[92%] max-w-[420px] mt-4 rounded-[24px] overflow-hidden border border-white/10 shadow-2xl"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 20,
      }}
    >
      {isWeb ? (
        createElement(
          "div",
          {
            className: "liquid-glass",
            style: {
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              padding: "16px",
              position: "relative",
              overflow: "hidden",
            },
          },
          [
            <div key="rim" className="specular-rim" />,
            createElement(
              View,
              {
                key: "content",
                style: { flexDirection: "row", alignItems: "center", flex: 1 },
              },
              [<Content key="c" />],
            ),
          ],
        )
      ) : (
        <BlurView
          intensity={25}
          tint="dark"
          className="flex-row items-center p-4"
        >
          <Content />
        </BlurView>
      )}
    </View>
  );
};

const toastConfig = {
  success: (props) => (
    <ToastBase {...props} accentColor="#c799ff" iconName="checkmark-circle" />
  ),
  error: (props) => (
    <ToastBase {...props} accentColor="#ff6e84" iconName="alert-circle" />
  ),
  info: (props) => (
    <ToastBase {...props} accentColor="#00e3fd" iconName="information-circle" />
  ),
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Outfit_600SemiBold,
    Outfit_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toast config={toastConfig} />
    </QueryClientProvider>
  );
}
