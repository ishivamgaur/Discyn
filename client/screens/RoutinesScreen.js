import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  LayoutAnimation,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTodos, useToggleComplete } from "../hooks/useTodos";
import { BlurView } from "expo-blur";

export default function RoutinesScreen({ navigation }) {
  const { data: todos = [], isRefetching, refetch } = useTodos();
  const toggleCompleteMutation = useToggleComplete();

  const routines = todos.filter((t) => t.type === "ROUTINE" || t.isRecurring);

  const toggleRoutine = (item) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    toggleCompleteMutation.mutate(item._id);
  };

  const renderRoutineItem = ({ item }) => {
    return (
      <TouchableOpacity
        key={item._id}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("TodoDetail", { id: item._id })}
        className="flex-row items-center p-5 mb-4 rounded-3xl bg-white/5 border border-white/10"
      >
        <TouchableOpacity
          onPress={() => toggleRoutine(item)}
          className={`w-7 h-7 mr-4 rounded-xl border-2 items-center justify-center ${
            item.isCompleted ? "bg-secondary border-secondary" : "border-border-dark"
          }`}
        >
          {item.isCompleted && <Ionicons name="checkmark" size={18} color="#0b0e14" />}
        </TouchableOpacity>

        <View className="flex-1">
          <Text
            className={`text-lg font-display tracking-wide ${
              item.isCompleted ? "text-text-muted-dark line-through" : "text-white"
            }`}
          >
            {item.title}
          </Text>
        </View>

        <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center ml-2">
          <Ionicons name="repeat" size={18} color="#c799ff" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background-dark">
      <View className="px-4 pt-4 pb-10 flex-row justify-between items-center">
        <View>
          <Text className="text-sm font-label text-secondary uppercase tracking-widest mb-1">
            Build Habits
          </Text>
          <Text className="text-4xl font-display text-white tracking-tight">
            Routines
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("AddTodo", { type: "routine" })}
          className="w-12 h-12 rounded-2xl items-center justify-center bg-primary"
          style={{
            shadowColor: "#c799ff", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 12, elevation: 8
          }}
        >
          <Ionicons name="add" size={28} color="#0b0e14" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={routines}
        keyExtractor={(item) => item._id}
        renderItem={renderRoutineItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#00e3fd" />}
        ListEmptyComponent={() => (
          <View className="items-center justify-center mt-20 opacity-50">
            <Ionicons name="infinite" size={64} color="#45484f" />
            <Text className="mt-4 text-center font-body text-text-muted-dark text-lg">
              No routines yet.{"\n"}Initialize a new sequence.
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
