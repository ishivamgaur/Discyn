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
import {
  NavigationContainer,
  DarkTheme,
  createNavigationContainerRef,
} from "@react-navigation/native";
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
import { LinearGradient } from "expo-linear-gradient";
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
const navigationRef = createNavigationContainerRef();

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
    <Animatable.View
      ref={ref}
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      <Ionicons name={name} size={24} color={color} />
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
          height: Platform.OS === "ios" ? 92 : 78,
          elevation: 0,
          paddingBottom: Platform.OS === "ios" ? 32 : 0,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          height: Platform.OS === "ios" ? 92 : 78,
        },
        tabBarIconStyle: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarActiveTintColor: "#c799ff",
        tabBarInactiveTintColor: "#52555c",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "Inter_600SemiBold",
          marginBottom: 10,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 10,
        },
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

          return (
            <AnimatedIcon
              name={iconName}
              focused={focused}
              color={color}
              animation={animation}
            />
          );
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
  const pendingTodoIdRef = React.useRef(null);

  const openTodoFromNotification = React.useCallback(
    (todoId) => {
      if (!todoId) return;

      if (navigationRef.isReady() && isLoggedIn) {
        navigationRef.navigate("TodoDetail", { todoId });
        return;
      }

      pendingTodoIdRef.current = todoId;
    },
    [isLoggedIn],
  );

  const flushPendingTodoNavigation = React.useCallback(() => {
    if (!pendingTodoIdRef.current) return;
    if (!navigationRef.isReady() || !isLoggedIn) return;

    navigationRef.navigate("TodoDetail", {
      todoId: pendingTodoIdRef.current,
    });
    pendingTodoIdRef.current = null;
  }, [isLoggedIn]);

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
  }, [loadSession]);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        Toast.show({
          type: "info",
          text1: notification.request.content.title,
          text2: notification.request.content.body,
        });
      },
    );
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        openTodoFromNotification(response.notification.request.content.data?.todoId);
      });

    Notifications.getLastNotificationResponseAsync().then((response) => {
      openTodoFromNotification(response?.notification?.request?.content?.data?.todoId);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, [openTodoFromNotification]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync("#0b0e14");
  }, []);

  useEffect(() => {
    flushPendingTodoNavigation();
  }, [flushPendingTodoNavigation]);

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
      <NavigationContainer
        ref={navigationRef}
        theme={navigationTheme}
        onReady={flushPendingTodoNavigation}
      >
        <StatusBar barStyle="light-content" backgroundColor="#0b0e14" />
        {Platform.OS === "web" && (
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .glassmorphism {
              background: rgba(11, 14, 20, 0.4) !important;
              backdrop-filter: blur(24px) saturate(180%) contrast(120%) brightness(110%) !important;
              -webkit-backdrop-filter: blur(24px) saturate(180%) contrast(120%) brightness(110%) !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4) !important;
              transform: translateZ(0) !important;
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

const ToastBase = ({
  text1,
  text2,
  accentColor,
  iconName,
  blurTarget,
}) => {
  const Content = () => (
    <>
      <View
        className="w-11 h-11 rounded-full items-center justify-center mr-3.5 border"
        style={{
          backgroundColor: accentColor + "16",
          borderColor: accentColor + "38",
        }}
      >
        <Ionicons name={iconName} size={22} color={accentColor} />
      </View>
      <View className="flex-1 justify-center">
        <Text className="text-white font-heading text-[15px] tracking-wide">
          {text1}
        </Text>
        {text2 && (
          <Text className="text-text-muted-dark font-body text-[13px] mt-1">
            {text2}
          </Text>
        )}
      </View>
    </>
  );

  return (
    <View
      className="w-[92%] max-w-[420px] rounded-[24px] overflow-hidden shadow-2xl"
      style={{
        minHeight: 84,
        borderWidth: 1,
        borderColor: accentColor + "22",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 20,
      }}
    >
      {Platform.OS === "web" ? (
        <div
          style={{
            width: "100%",
            minHeight: "84px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: "16px",
            background:
              "linear-gradient(180deg, rgba(22, 27, 36, 0.88) 0%, rgba(11, 14, 20, 0.76) 100%)",
            backdropFilter:
              "blur(24px) saturate(180%) contrast(120%) brightness(110%)",
            WebkitBackdropFilter:
              "blur(24px) saturate(180%) contrast(120%) brightness(110%)",
            zIndex: 9999,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "0",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 45%, rgba(255,255,255,0) 100%)",
              pointerEvents: "none",
            }}
          />
          <div className="specular-rim" />
          <Content />
        </div>
      ) : (
        <View style={{ backgroundColor: "transparent" }}>
          <BlurView
            intensity={Platform.OS === "android" ? 100 : 82}
            tint="dark"
            className="flex-row items-center p-4 w-full overflow-hidden"
            style={{ minHeight: 84 }}
            blurTarget={Platform.OS === "android" ? blurTarget : undefined}
            blurMethod={
              Platform.OS === "android" ? "dimezisBlurView" : undefined
            }
            blurReductionFactor={Platform.OS === "android" ? 1 : undefined}
          >
            <LinearGradient
              pointerEvents="none"
              colors={[
                "rgba(255,255,255,0.08)",
                "rgba(255,255,255,0.025)",
                "rgba(255,255,255,0.01)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255,255,255,0.015)",
              }}
            />
            <Content />
          </BlurView>
        </View>
      )}
    </View>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Outfit_600SemiBold,
    Outfit_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const blurTargetRef = React.useRef(null);
  if (!fontsLoaded) return null;

  const toastConfig = {
    success: (props) => (
      <ToastBase
        {...props}
        blurTarget={blurTargetRef}
        accentColor="#10b981"
        iconName="checkmark-circle"
      />
    ),
    error: (props) => (
      <ToastBase
        {...props}
        blurTarget={blurTargetRef}
        accentColor="#ff6e84"
        iconName="alert-circle"
      />
    ),
    info: (props) => (
      <ToastBase
        {...props}
        blurTarget={blurTargetRef}
        accentColor="#00e3fd"
        iconName="information-circle"
      />
    ),
  };

  return (
    <QueryClientProvider client={queryClient}>
      <View ref={blurTargetRef} style={{ flex: 1 }} collapsable={false}>
        <AppContent />
      </View>
      <Toast config={toastConfig} topOffset={18} />
    </QueryClientProvider>
  );
}
