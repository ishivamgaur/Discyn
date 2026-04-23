import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

const STORAGE_KEY = "discyn:scheduled-notification-ids";
const DEFAULT_CHANNEL_ID = "default";

const getStoredIds = async () => {
  if (Platform.OS === "web") return {};

  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const setStoredIds = async (value) => {
  if (Platform.OS === "web") return;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

const saveTodoNotificationIds = async (todoId, ids) => {
  if (Platform.OS === "web") return;
  const stored = await getStoredIds();
  stored[todoId] = ids;
  await setStoredIds(stored);
};

const clearTodoNotificationIds = async (todoId) => {
  if (Platform.OS === "web") return;
  const stored = await getStoredIds();
  delete stored[todoId];
  await setStoredIds(stored);
};

const ensureAndroidChannel = async () => {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
    name: "Discyn reminders",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#c799ff",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
};

const getNotificationContent = (todo, index = 0) => ({
  title:
    index === 0 ? `Reminder: ${todo.title}` : `Reminder #${index + 1}: ${todo.title}`,
  body:
    index === 0
      ? todo.description || "It is time to focus."
      : "You still have not marked this complete.",
  sound: true,
  ...(Platform.OS === "android" ? { channelId: DEFAULT_CHANNEL_ID } : {}),
  data: {
    todoId: todo._id,
    reminderType: todo.reminderType || "NORMAL",
    attempt: index,
  },
});

export const getNotificationPermissionStatus = async () => {
  const settings = await Notifications.getPermissionsAsync();
  return settings.status;
};

export const ensurePermissions = async () => {
  await ensureAndroidChannel();

  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return true;

  const { status: nextStatus } =
    await Notifications.requestPermissionsAsync();
  return nextStatus === "granted";
};

export const scheduleNormalReminder = async (todo) => {
  if (!todo.scheduledTime) return [];

  const triggerDate = new Date(todo.scheduledTime);
  const now = new Date();
  if (triggerDate <= now) return [];

  if (Platform.OS === "web") {
    const delay = triggerDate.getTime() - now.getTime();
    const timerId = setTimeout(() => {
      Toast.show({
        type: "info",
        text1: `Reminder: ${todo.title}`,
        text2: todo.description || "It is time to focus.",
      });
    }, delay);

    if (!window.__webTimers) window.__webTimers = {};
    window.__webTimers[todo._id] = [timerId];
    return [];
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: getNotificationContent(todo),
    trigger: triggerDate,
  });

  await saveTodoNotificationIds(todo._id, [notificationId]);
  return [notificationId];
};

export const scheduleNaggingReminder = async (todo) => {
  if (!todo.scheduledTime) return [];

  const intervalMinutes = todo.nagInterval || 5;
  const durationMinutes = todo.nagDuration || 60;
  const count = Math.min(Math.floor(durationMinutes / intervalMinutes), 50);
  const baseDate = new Date(todo.scheduledTime);
  const now = new Date();

  if (Platform.OS === "web") {
    const timerIds = [];

    for (let i = 0; i < count; i++) {
      const triggerDate = new Date(
        baseDate.getTime() + i * intervalMinutes * 60000,
      );
      const delay = triggerDate.getTime() - now.getTime();
      if (delay <= 0) continue;

      const timerId = setTimeout(() => {
        Toast.show({
          type: "info",
          text1:
            i === 0 ? `Reminder: ${todo.title}` : `Reminder #${i + 1}: ${todo.title}`,
          text2:
            i === 0
              ? "It is time to get this done."
              : "You still have not marked this complete.",
        });
      }, delay);

      timerIds.push(timerId);
    }

    if (!window.__webTimers) window.__webTimers = {};
    window.__webTimers[todo._id] = timerIds;
    return [];
  }

  const notificationIds = [];

  for (let i = 0; i < count; i++) {
    const triggerDate = new Date(
      baseDate.getTime() + i * intervalMinutes * 60000,
    );
    if (triggerDate <= new Date()) continue;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: getNotificationContent(todo, i),
      trigger: triggerDate,
    });

    notificationIds.push(notificationId);
  }

  await saveTodoNotificationIds(todo._id, notificationIds);
  return notificationIds;
};

export const cancelReminders = async (todoId) => {
  if (!todoId) return;

  if (Platform.OS === "web") {
    if (window.__webTimers && window.__webTimers[todoId]) {
      window.__webTimers[todoId].forEach((id) => clearTimeout(id));
      delete window.__webTimers[todoId];
    }
    return;
  }

  try {
    const stored = await getStoredIds();
    const scheduledIds = stored[todoId] || [];

    if (scheduledIds.length > 0) {
      await Promise.all(
        scheduledIds.map((notificationId) =>
          Notifications.cancelScheduledNotificationAsync(notificationId),
        ),
      );
    } else {
      const scheduled =
        await Notifications.getAllScheduledNotificationsAsync();
      const matches = scheduled.filter(
        (entry) => entry.content?.data?.todoId === todoId,
      );

      await Promise.all(
        matches.map((entry) =>
          Notifications.cancelScheduledNotificationAsync(entry.identifier),
        ),
      );
    }
  } catch (error) {
    console.log(
      "Could not cancel notification (may not exist):",
      error.message,
    );
  } finally {
    await clearTodoNotificationIds(todoId);
  }
};

export const handleTaskScheduling = async (todo) => {
  if (!todo?._id) return false;

  await cancelReminders(todo._id);

  if (!todo.scheduledTime || todo.isCompleted) {
    return true;
  }

  const hasPermission = await ensurePermissions();
  if (!hasPermission) return false;

  if (todo.reminderType === "NAGGING") {
    await scheduleNaggingReminder(todo);
  } else {
    await scheduleNormalReminder(todo);
  }

  return true;
};

export const scheduleTestNotification = async () => {
  const hasPermission = await ensurePermissions();
  if (!hasPermission) return false;

  if (Platform.OS === "web") {
    setTimeout(() => {
      Toast.show({
        type: "info",
        text1: "Discyn test notification",
        text2: "Your notification setup is working.",
      });
    }, 3000);
    return true;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Discyn test notification",
      body: "Your notification setup is working.",
      sound: true,
      ...(Platform.OS === "android" ? { channelId: DEFAULT_CHANNEL_ID } : {}),
      data: { type: "test" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      repeats: false,
    },
  });

  return true;
};
