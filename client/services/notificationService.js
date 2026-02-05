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
  if (triggerDate <= new Date()) return;

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
// We schedule 5 notifications upfront spaced manually
export const scheduleNaggingReminder = async (todo) => {
  if (!todo.scheduledTime) return;
  const intervalMinutes = todo.nagInterval || 5;

  const baseDate = new Date(todo.scheduledTime);

  // Schedule 5 nags
  for (let i = 0; i < 5; i++) {
    const triggerDate = new Date(
      baseDate.getTime() + i * intervalMinutes * 60000,
    ); // Add minutes

    if (triggerDate <= new Date()) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: i === 0 ? "Time to " + todo.title : `NAG: ${todo.title}`,
        body:
          i === 0
            ? "Let's get this done!"
            : `You haven't marked this done yet! (${i + 1}/5)`,
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
  // Cancel Normal
  await Notifications.cancelScheduledNotificationAsync(`normal-${todoId}`);

  // Cancel Nags (Iterate plausible count)
  for (let i = 0; i < 10; i++) {
    await Notifications.cancelScheduledNotificationAsync(`nag-${todoId}-${i}`);
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
