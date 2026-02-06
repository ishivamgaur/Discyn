import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

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

  // Safety check: Don't schedule in past
  const triggerDate = new Date(todo.scheduledTime);
  const now = new Date();
  if (triggerDate <= now) return;

  // Web Simulation
  if (Platform.OS === "web") {
    const delay = triggerDate.getTime() - now.getTime();
    console.log(
      `[Web] Scheduling Normal Notification for todo ${todo._id} in ${Math.round(delay / 1000)}s`,
    );

    // Alert user that simulation is active
    window.alert(
      `✅ Web Sim: Scheduled "${todo.title}" in ${Math.round(delay / 1000)}s`,
    );

    const timerId = setTimeout(() => {
      window.alert(
        `🔔 REMINDER: ${todo.title}\n\n${todo.description || "It's time!"}`,
      );
    }, delay);

    // Track timer
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
    trigger: triggerDate,
    identifier: `normal-${todo._id}`,
  });
};

// Schedule "Nagging" Reminder (Recurring locally)
export const scheduleNaggingReminder = async (todo) => {
  if (!todo.scheduledTime) return;
  const intervalMinutes = todo.nagInterval || 5;
  const durationMinutes = todo.nagDuration || 60; // Default 1 hour

  // Calculate how many notifications to schedule (limit to 50 max for safety)
  const count = Math.min(Math.floor(durationMinutes / intervalMinutes), 50);

  const baseDate = new Date(todo.scheduledTime);
  const now = new Date();

  // Web Simulation for Nagging
  if (Platform.OS === "web") {
    console.log(`[Web] Scheduling ${count} Nags for todo ${todo._id}`);
    window.alert(`✅ Web Sim: Scheduled ${count} nags for "${todo.title}"`);

    for (let i = 0; i < count; i++) {
      const triggerDate = new Date(
        baseDate.getTime() + i * intervalMinutes * 60000,
      );
      const delay = triggerDate.getTime() - now.getTime();

      if (delay <= 0) continue;

      const timerId = setTimeout(() => {
        window.alert(
          i === 0
            ? `🔔 REMINDER: ${todo.title}\n\nLet's get this done!`
            : `🔔 NAG #${i + 1}: ${todo.title}\n\nYou haven't marked this done yet!`,
        );
      }, delay);

      // Track timer
      if (!window.__webTimers) window.__webTimers = {};
      if (!window.__webTimers[todo._id]) window.__webTimers[todo._id] = [];
      window.__webTimers[todo._id].push(timerId);
    }
    return;
  }

  // Schedule calculated nags (Native)
  for (let i = 0; i < count; i++) {
    const triggerDate = new Date(
      baseDate.getTime() + i * intervalMinutes * 60000,
    ); // Add minutes

    if (triggerDate <= new Date()) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title:
          i === 0 ? "Time to " + todo.title : `NAG #${i + 1}: ${todo.title}`,
        body:
          i === 0
            ? "Let's get this done!"
            : "You haven't marked this done yet!",
        sound: true,
        data: { todoId: todo._id, type: "nag" },
      },
      trigger: triggerDate,
      identifier: `nag-${todo._id}-${i}`,
    });
  }
};

// Cancel Reminders for a Todo
export const cancelReminders = async (todoId) => {
  // Web Support: Clear timeouts
  if (Platform.OS === "web") {
    if (window.__webTimers && window.__webTimers[todoId]) {
      console.log(
        `[Web] Cancelling ${window.__webTimers[todoId].length} timers for todo ${todoId}`,
      );
      window.__webTimers[todoId].forEach((id) => clearTimeout(id));
      delete window.__webTimers[todoId];
    }
    return;
  }

  try {
    // Cancel Normal
    await Notifications.cancelScheduledNotificationAsync(`normal-${todoId}`);

    // Cancel Nags (Iterate plausible count - max scheduled is 50)
    for (let i = 0; i < 60; i++) {
      await Notifications.cancelScheduledNotificationAsync(
        `nag-${todoId}-${i}`,
      );
    }
  } catch (e) {
    console.log("Could not cancel notification (may not exist):", e.message);
  }
};

// Master Function
export const handleTaskScheduling = async (todo) => {
  await ensurePermissions();

  // Always cancel existing unique ID logic first to be safe
  await cancelReminders(todo._id);

  if (todo.reminderType === "NAGGING") {
    await scheduleNaggingReminder(todo);
  } else {
    await scheduleNormalReminder(todo);
  }
};
