import React from "react";
import { View, Platform } from "react-native";
import { BlurView } from "expo-blur";

export default function GlassBackground({
  color = "rgba(255, 255, 255, 0.05)",
}) {
  if (Platform.OS === "web") {
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: color,
          backdropFilter:
            "blur(24px) saturate(180%) contrast(120%) brightness(110%)",
          WebkitBackdropFilter:
            "blur(24px) saturate(180%) contrast(120%) brightness(110%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
    );
  }

  return (
    <View
      className="absolute inset-0 z-0"
      pointerEvents="none"
      style={{ backgroundColor: color }}
    >
      <BlurView intensity={20} tint="dark" className="flex-1" />
    </View>
  );
}
