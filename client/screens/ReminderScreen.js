import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import api from "../services/authService";
import { useTheme } from "../context/ThemeContext";

export default function ReminderScreen() {
  const { isDark } = useTheme();
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState("date");
  const [reminderText, setReminderText] = useState("");
  const [email, setEmail] = useState(""); // For email notification

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === "ios");
    setDate(currentDate);
  };

  const showMode = (currentMode) => {
    setShowPicker(true);
    setMode(currentMode);
  };

  const scheduleNotification = async () => {
    const trigger = new Date(date);
    trigger.setSeconds(0);

    if (trigger <= new Date()) {
      Alert.alert("Invalid Time", "Please select a future time");
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Reminder ⏰",
          body: reminderText || "Here is your scheduled reminder!",
          sound: true,
        },
        trigger,
      });
      Alert.alert("Success", `Reminder set for ${trigger.toLocaleString()}`);
    } catch (e) {
      Alert.alert("Error", "Failed to schedule notification");
    }
  };

  const sendEmailReminder = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }
    try {
      await api.post("/send-mail", {
        to: email,
        subject: "Todo App Reminder",
        text: `Here is your reminder: ${reminderText || "No description provided."}`,
      });
      Alert.alert("Success", "Email sent successfully!");
    } catch (e) {
      Alert.alert("Error", "Failed to send email.");
    }
  };

  return (
    <View className={`flex-1 p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <Text
        className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-800"}`}
      >
        Set Reminder
      </Text>

      <TextInput
        className={`p-4 rounded-lg mb-4 border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
        placeholder="Reminder Note..."
        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
        value={reminderText}
        onChangeText={setReminderText}
      />

      <View className="mb-6">
        <Text className={`mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Selected Time:
        </Text>
        <Text
          className={`text-xl font-semibold mb-4 ${isDark ? "text-primary-light" : "text-primary"}`}
        >
          {date.toLocaleString()}
        </Text>

        <View className="flex-row gap-4 mb-4">
          <TouchableOpacity
            onPress={() => showMode("date")}
            className={`p-3 rounded flex-1 items-center ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
          >
            <Text className={isDark ? "text-white" : "text-black"}>
              Pick Date
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => showMode("time")}
            className={`p-3 rounded flex-1 items-center ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
          >
            <Text className={isDark ? "text-white" : "text-black"}>
              Pick Time
            </Text>
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode={mode}
            is24Hour={true}
            display="default"
            onChange={onChange}
            themeVariant={isDark ? "dark" : "light"}
          />
        )}
      </View>

      <TouchableOpacity
        className="bg-primary p-4 rounded-lg items-center mb-8"
        onPress={scheduleNotification}
      >
        <Text className="text-white font-bold text-lg">
          Set Local Notification
        </Text>
      </TouchableOpacity>

      <View
        className={`border-t pt-6 ${isDark ? "border-gray-700" : "border-gray-300"}`}
      >
        <Text
          className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}
        >
          Email Notification
        </Text>
        <TextInput
          className={`p-4 rounded-lg mb-4 border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
          placeholder="Enter Email Address"
          placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity
          className="bg-success p-4 rounded-lg items-center"
          onPress={sendEmailReminder}
        >
          <Text className="text-white font-bold text-lg">Send Email Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
