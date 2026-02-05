import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

const light = async () => {
  if (isWeb) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    console.warn("Haptics not available");
  }
};

const medium = async () => {
  if (isWeb) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    console.warn("Haptics not available");
  }
};

const heavy = async () => {
  if (isWeb) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    console.warn("Haptics not available");
  }
};

const success = async () => {
  if (isWeb) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.warn("Haptics not available");
  }
};

const error = async () => {
  if (isWeb) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.warn("Haptics not available");
  }
};

export default {
  light,
  medium,
  heavy,
  success,
  error,
};
