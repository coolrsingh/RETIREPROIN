import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/hooks/useApi";

interface Scenario {
  id: number;
  name: string;
  mode: string;
  updatedAt: string;
}

function PlanCard({ scenario, onPress }: { scenario: Scenario; onPress: () => void }) {
  const colors = useColors();
  const date = new Date(scenario.updatedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <TouchableOpacity
      style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.planCardRow}>
        <View style={[styles.planIconBg, { backgroundColor: colors.secondary }]}>
          <Ionicons name="trending-up" size={20} color={colors.primary} />
        </View>
        <View style={styles.planCardContent}>
          <Text style={[styles.planCardTitle, { color: colors.foreground }]} numberOfLines={1}>
            {scenario.name}
          </Text>
          <Text style={[styles.planCardDate, { color: colors.mutedForeground }]}>{date}</Text>
        </View>
        <View style={[styles.planBadge, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.planBadgeText, { color: colors.primary }]}>
            {scenario.mode === "quick" ? "Quick" : "Detailed"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} style={{ marginLeft: 4 }} />
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ onCreatePlan, colors }: { onCreatePlan: () => void; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconBg, { backgroundColor: colors.secondary }]}>
        <Ionicons name="trending-up-outline" size={40} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No plans yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
        Create your first retirement plan to get started
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        onPress={onCreatePlan}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles.emptyButtonText}>Create Quick Plan</Text>
      </TouchableOpacity>
    </View>
  );
}

function GuestBanner({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.guestBanner, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
      <Ionicons name="information-circle-outline" size={18} color={colors.warning} />
      <Text style={[styles.guestText, { color: "#92400e" }]}>
        Log in via the RetirePro web app to sync your plans here.
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: scenarios, isLoading, refetch, isRefetching } = useQuery<Scenario[]>({
    queryKey: ["scenarios"],
    queryFn: () => apiFetch<Scenario[]>("/api/scenarios"),
    enabled: isAuthenticated,
    retry: false,
  });

  const handleCreatePlan = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.navigate("/(tabs)/new-plan");
  }, [router]);

  const handleViewPlan = useCallback(
    (id: number) => {
      Haptics.selectionAsync();
      router.push(`/plan/${id}` as any);
    },
    [router]
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (authLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerBrand}>
          <View style={[styles.brandIconBg, { backgroundColor: colors.primary }]}>
            <Ionicons name="trending-up" size={18} color="#fff" />
          </View>
          <Text style={[styles.brandName, { color: colors.foreground }]}>RetirePro</Text>
        </View>
        {isAuthenticated && (
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: colors.primary }]}
            onPress={handleCreatePlan}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {!isAuthenticated && <GuestBanner colors={colors} />}

      {isAuthenticated && (
        <View style={[styles.welcomeBar, { backgroundColor: colors.secondary, borderBottomColor: colors.border }]}>
          <Text style={[styles.welcomeText, { color: colors.primary }]}>
            Welcome back, {user?.firstName ?? "there"}
          </Text>
          <Text style={[styles.welcomeSub, { color: colors.mutedForeground }]}>
            {scenarios?.length ?? 0} retirement {(scenarios?.length ?? 0) === 1 ? "plan" : "plans"}
          </Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList<Scenario>
          data={scenarios ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 },
          ]}
          scrollEnabled={!!(scenarios?.length)}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <PlanCard scenario={item} onPress={() => handleViewPlan(item.id)} />
          )}
          ListEmptyComponent={
            isAuthenticated ? (
              <EmptyState onCreatePlan={handleCreatePlan} colors={colors} />
            ) : (
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconBg, { backgroundColor: colors.secondary }]}>
                  <Feather name="lock" size={36} color={colors.mutedForeground} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Sign in required</Text>
                <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                  Visit the RetirePro web app to log in, then come back here to view your plans.
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBrand: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  createBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  welcomeText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  welcomeSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  guestBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  guestText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  list: { padding: 16, gap: 12 },
  planCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  planCardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  planIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  planCardContent: { flex: 1 },
  planCardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  planCardDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  planBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  planBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  emptyContainer: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 8, textAlign: "center" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 28,
  },
  emptyButtonText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
