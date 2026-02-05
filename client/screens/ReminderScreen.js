import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import api from "../services/authService";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReminderScreen({ navigation }) {
  const { isDark } = useTheme();
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState("date");
  const [reminderText, setReminderText] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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
      Alert.alert(
        "Success",
        `Reminder set for ${trigger.toLocaleTimeString()}`,
      );
    } catch (e) {
      Alert.alert("Error", "Failed to schedule notification");
    }
  };

  const sendEmailReminder = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }
    setLoading(true);
    try {
      await api.post("/send-mail", {
        to: email,
        subject: "Todo App Reminder",
        text: `Here is your reminder: ${reminderText || "No description provided."}`,
      });
      Alert.alert("Success", "Email sent successfully!");
    } catch (e) {
      Alert.alert("Error", "Failed to send email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background-light"}`}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background-light"}`}
      >
        <ScrollView className="flex-1 p-6">
          <Text
            className={`text-3xl font-bold mb-8 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Reminders
          </Text>

          {/* Note Input */}
          <View
            className={`p-4 rounded-2xl mb-6 shadow-sm ${isDark ? "bg-card-dark" : "bg-white"}`}
          >
            <View className="flex-row items-center mb-3 gap-2">
              <Ionicons
                name="document-text-outline"
                size={20}
                color={isDark ? "#a1a1aa" : "#71717a"}
              />
              <Text
                className={`font-semibold ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
              >
                NOTE
              </Text>
            </View>
            <TextInput
              className={`text-base p-0 h-12 font-medium ${isDark ? "text-white" : "text-gray-900"}`}
              placeholder="Buy groceries..."
              placeholderTextColor={isDark ? "#52525b" : "#d4d4d8"}
              value={reminderText}
              onChangeText={setReminderText}
            />
          </View>

          {/* Date Time Picker Block */}
          <View
            className={`p-4 rounded-2xl mb-6 shadow-sm ${isDark ? "bg-card-dark" : "bg-white"}`}
          >
            <View className="flex-row items-center mb-4 gap-2">
              <Ionicons
                name="time-outline"
                size={20}
                color={isDark ? "#a1a1aa" : "#71717a"}
              />
              <Text
                className={`font-semibold ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
              >
                TIME
              </Text>
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <Text
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Text
                className={`text-base font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
              >
                {date.toLocaleDateString()}
              </Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => showMode("date")}
                className={`flex-1 p-3 rounded-xl items-center border ${isDark ? "border-zinc-700 bg-zinc-800" : "border-zinc-200 bg-zinc-50"}`}
              >
                <Text
                  className={`font-bold ${isDark ? "text-white" : "text-gray-700"}`}
                >
                  Change Date
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => showMode("time")}
                className={`flex-1 p-3 rounded-xl items-center border ${isDark ? "border-zinc-700 bg-zinc-800" : "border-zinc-200 bg-zinc-50"}`}
              >
                <Text
                  className={`font-bold ${isDark ? "text-white" : "text-gray-700"}`}
                >
                  Change Time
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

          {/* Set Notification Button */}
          <TouchableOpacity
            onPress={scheduleNotification}
            className="bg-primary p-4 rounded-xl flex-row items-center justify-center mb-8 shadow-lg shadow-blue-500/30"
          >
            <Ionicons name="notifications" size={20} color="white" />
            <Text className="text-white font-bold text-lg ml-2">
              Schedule Notification
            </Text>
          </TouchableOpacity>

          {/* Email Section */}
          <View
            className={`p-4 rounded-2xl mb-8 border border-dashed ${isDark ? "border-zinc-700 bg-zinc-900/50" : "border-zinc-300 bg-zinc-50"}`}
          >
            <Text
              className={`font-bold mb-4 ${isDark ? "text-zinc-300" : "text-zinc-600"}`}
            >
              EMAIL REMINDER
            </Text>
            <TextInput
              className={`p-4 rounded-xl mb-4 border ${isDark ? "bg-background-dark border-zinc-700 text-white" : "bg-white border-zinc-200 text-gray-900"}`}
              placeholder="Enter Email Address"
              placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={sendEmailReminder}
              disabled={loading}
              className={`p-4 rounded-xl items-center ${loading ? "bg-green-600" : "bg-green-500"}`}
            >
              <Text className="text-white font-bold text-lg">
                {loading ? "Sending..." : "Send Email"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
