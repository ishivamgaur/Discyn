import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTodos, useToggleComplete } from "../hooks/useTodos";
import GlassBackground from "../components/GlassBackground";

export default function RoutinesScreen({ navigation }) {
  const { data: todos = [], isRefetching, refetch } = useTodos();
  const toggleMutation = useToggleComplete();
  const routines = todos.filter((t) => t.type === "ROUTINE" || t.isRecurring);
  const done = routines.filter((t) => t.isCompleted).length;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => navigation.navigate("TodoDetail", { todo: item })}
      style={[S.item, item.isCompleted && { opacity: 0.45 }]}
    >
      <GlassBackground />
      <TouchableOpacity
        onPress={() => toggleMutation.mutate(item)}
        style={[S.checkbox, item.isCompleted && S.checkboxDone]}
      >
        {item.isCompleted && (
          <Ionicons name="checkmark" size={14} color="#0b0e14" />
        )}
      </TouchableOpacity>
      <View style={S.itemContent}>
        <Text style={[S.itemTitle, item.isCompleted && S.itemTitleDone]}>
          {item.title}
        </Text>
        {item.description ? (
          <Text style={S.itemSub} numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
      </View>
      <View style={S.repeatIcon}>
        <Ionicons name="repeat" size={15} color="#c799ff" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["top"]} style={S.root}>
      <View style={S.header}>
        <View style={S.headerText}>
          <Text style={S.label}>Build Habits</Text>
          <Text style={S.title}>Routines</Text>
          {routines.length > 0 && (
            <Text style={S.count}>
              {done}/{routines.length} done today
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("AddTodo", { type: "routine" })}
          style={S.addBtn}
        >
          <Ionicons name="add" size={24} color="#0b0e14" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={routines}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={S.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#c799ff"
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={() => (
          <View style={S.empty}>
            <Ionicons name="infinite-outline" size={52} color="#2e3139" />
            <Text style={S.emptyTitle}>No routines yet</Text>
            <Text style={S.emptySub}>Tap + to create your first habit</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0b0e14" },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerText: {},
  label: {
    fontSize: 11,
    color: "#c799ff",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    color: "#fff",
    fontFamily: "Outfit_700Bold",
    letterSpacing: -0.5,
  },
  count: {
    fontSize: 12,
    color: "#52555c",
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#c799ff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    shadowColor: "#c799ff",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    position: "relative",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: { backgroundColor: "#00e3fd", borderColor: "#00e3fd" },
  itemContent: { flex: 1, marginLeft: 14 },
  itemTitle: { fontSize: 15, color: "#ecedf6", fontFamily: "Inter_500Medium" },
  itemTitleDone: { color: "#45484f", textDecorationLine: "line-through" },
  itemSub: {
    fontSize: 12,
    color: "#45484f",
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  repeatIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(199,153,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyTitle: {
    fontSize: 16,
    color: "#3a3d45",
    fontFamily: "Outfit_700Bold",
    marginTop: 16,
  },
  emptySub: {
    fontSize: 13,
    color: "#2e3139",
    fontFamily: "Inter_400Regular",
    marginTop: 6,
  },
});
