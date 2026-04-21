import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

// Request permissions helper
export const ensurePermissions = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    return newStatus === "granted";
  }
  return true;
};

// Schedule "Normal" Reminder (One-time)
export const scheduleNormalReminder = async (todo) => {
  if (!todo.scheduledTime) return;

  const triggerDate = new Date(todo.scheduledTime);
  const now = new Date();
  if (triggerDate <= now) return;

  if (Platform.OS === "web") {
    const delay = triggerDate.getTime() - now.getTime();
    const timerId = setTimeout(() => {
      Toast.show({ type: "info", text1: `🔔 ${todo.title}`, text2: todo.description || "It's time!" });
    }, delay);

    if (!window.__webTimers) window.__webTimers = {};
    if (!window.__webTimers[todo._id]) window.__webTimers[todo._id] = [];
    window.__webTimers[todo._id].push(timerId);
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Reminder: " + todo.title,
      body: todo.description || "It's time to focus!",
      sound: true,
      data: { todoId: todo._id },
    },
    trigger: { date: triggerDate },
    identifier: `normal-${todo._id}`,
  });
};

// Schedule "Nagging" Reminder (Recurring locally)
export const scheduleNaggingReminder = async (todo) => {
  if (!todo.scheduledTime) return;
  const intervalMinutes = todo.nagInterval || 5;
  const durationMinutes = todo.nagDuration || 60; 

  const count = Math.min(Math.floor(durationMinutes / intervalMinutes), 50);

  const baseDate = new Date(todo.scheduledTime);
  const now = new Date();

  if (Platform.OS === "web") {
    for (let i = 0; i < count; i++) {
      const triggerDate = new Date(baseDate.getTime() + i * intervalMinutes * 60000);
      const delay = triggerDate.getTime() - now.getTime();

      if (delay <= 0) continue;

      const timerId = setTimeout(() => {
        Toast.show({
          type: "info",
          text1: i === 0 ? `🔔 ${todo.title}` : `🔔 Enforcement #${i + 1}: ${todo.title}`,
          text2: i === 0 ? "Let's get this done!" : "You haven't marked this done yet!",
        });
      }, delay);

      if (!window.__webTimers) window.__webTimers = {};
      if (!window.__webTimers[todo._id]) window.__webTimers[todo._id] = [];
      window.__webTimers[todo._id].push(timerId);
    }
    return;
  }

  for (let i = 0; i < count; i++) {
    const triggerDate = new Date(baseDate.getTime() + i * intervalMinutes * 60000);

    if (triggerDate <= new Date()) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: i === 0 ? "Time to " + todo.title : `ENFORCEMENT #${i + 1}: ${todo.title}`,
        body: i === 0 ? "Let's get this done!" : "You haven't marked this done yet!",
        sound: true,
        data: { todoId: todo._id, type: "nag" },
      },
      trigger: { date: triggerDate },
      identifier: `nag-${todo._id}-${i}`,
    });
  }
};

// Cancel Reminders for a Todo
export const cancelReminders = async (todoId) => {
  if (Platform.OS === "web") {
    if (window.__webTimers && window.__webTimers[todoId]) {
      window.__webTimers[todoId].forEach((id) => clearTimeout(id));
      delete window.__webTimers[todoId];
    }
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(`normal-${todoId}`);
    for (let i = 0; i < 60; i++) {
      await Notifications.cancelScheduledNotificationAsync(`nag-${todoId}-${i}`);
    }
  } catch (e) {
    console.log("Could not cancel notification (may not exist):", e.message);
  }
};

// Master Function
export const handleTaskScheduling = async (todo) => {
  await ensurePermissions();

  await cancelReminders(todo._id);

  if (todo.reminderType === "NAGGING") {
    await scheduleNaggingReminder(todo);
  } else {
    await scheduleNormalReminder(todo);
  }
};
