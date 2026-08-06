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
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PlanCard({ scenario, onPress }: { scenario: Scenario; onPress: () => void }) {
  const colors = useColors();
  const accentColors = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#d97706"];
  const accent = accentColors[scenario.id % accentColors.length];

  return (
    <TouchableOpacity style={styles.planCard} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.planAccentBar, { backgroundColor: accent }]} />
      <View style={styles.planCardInner}>
        <View style={styles.planCardTop}>
          <View style={[styles.planIconCircle, { backgroundColor: accent + "18" }]}>
            <Ionicons name="trending-up" size={18} color={accent} />
          </View>
          <View style={styles.planMeta}>
            <Text style={styles.planCardTitle} numberOfLines={1}>{scenario.name}</Text>
            <Text style={styles.planCardDate}>{formatDate(scenario.updatedAt)}</Text>
          </View>
          <View style={[styles.planBadge, { backgroundColor: accent + "15" }]}>
            <Text style={[styles.planBadgeText, { color: accent }]}>
              {scenario.mode === "quick" ? "Quick" : "Full"}
            </Text>
          </View>
        </View>
        <View style={styles.planCardBottom}>
          <Text style={styles.planCardCta}>View projections →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, isLoading: authLoading, authError } = useAuth();

  const { data: scenarios, isLoading, isError, error, refetch, isRefetching } = useQuery<Scenario[]>({
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
  const firstName = user?.firstName ?? "there";
  const planCount = scenarios?.length ?? 0;

  if (authLoading) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#0f172a", "#1e3a5f"]}
        style={[styles.hero, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroGreeting}>
              {isAuthenticated ? `Good day, ${firstName} 👋` : "Welcome to RetirePro"}
            </Text>
            <Text style={styles.heroSubtitle}>
              {isAuthenticated
                ? `You have ${planCount} retirement ${planCount === 1 ? "plan" : "plans"}`
                : "Plan your retirement today"}
            </Text>
          </View>
          <View style={styles.heroBrandBadge}>
            <Ionicons name="trending-up" size={16} color="#fff" />
          </View>
        </View>

        {isAuthenticated && (
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatBox}>
              <Text style={styles.heroStatNumber}>{planCount}</Text>
              <Text style={styles.heroStatLabel}>Plans</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatBox}>
              <Text style={styles.heroStatNumber}>
                {user?.retirementAge ?? "—"}
              </Text>
              <Text style={styles.heroStatLabel}>Retire at</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatBox}>
              <Text style={styles.heroStatNumber}>
                {user?.monthlyIncome
                  ? `₹${Math.round(user.monthlyIncome / 1000)}K`
                  : "—"}
              </Text>
              <Text style={styles.heroStatLabel}>Monthly Income</Text>
            </View>
          </View>
        )}

        {!isAuthenticated && (
          <View style={styles.guestCard}>
            <Ionicons name="lock-closed-outline" size={16} color="#93c5fd" />
            <Text style={styles.guestCardText}>
              Log in via the RetirePro web app to sync your plans.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.heroCreateBtn}
          onPress={handleCreatePlan}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={20} color="#0f172a" />
          <Text style={styles.heroCreateBtnText}>New Retirement Plan</Text>
        </TouchableOpacity>
      </LinearGradient>

      {authError ? (
        <View style={[styles.fill, { alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }]}>
          <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
          <Text style={[styles.emptyTitle, { color: colors.text, marginTop: 12 }]}>Something went wrong</Text>
          <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>{authError}</Text>
        </View>
      ) : isLoading ? (
        <View style={[styles.fill, { alignItems: "center", justifyContent: "center" }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={[styles.fill, { alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }]}>
          <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
          <Text style={[styles.emptyTitle, { color: colors.text, marginTop: 12 }]}>Could not load plans</Text>
          <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
            {error instanceof Error ? error.message : "An unexpected error occurred. Pull down to retry."}
          </Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: colors.primary, marginTop: 20 }]}
            onPress={() => refetch()}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList<Scenario>
          data={scenarios ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Platform.OS === "web" ? 50 : insets.bottom + 24 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            isAuthenticated && planCount > 0 ? (
              <Text style={styles.listSectionLabel}>YOUR PLANS</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <PlanCard scenario={item} onPress={() => handleViewPlan(item.id)} />
          )}
          ListEmptyComponent={
            isAuthenticated ? (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIconRing, { borderColor: colors.border }]}>
                  <Ionicons name="bar-chart-outline" size={32} color={colors.mutedForeground} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No plans yet</Text>
                <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
                  Create your first plan and see your retirement projections in under 60 seconds.
                </Text>
                <TouchableOpacity
                  style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
                  onPress={handleCreatePlan}
                  activeOpacity={0.85}
                >
                  <Text style={styles.emptyBtnText}>Get Started</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },

  hero: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  heroGreeting: {
    color: "#f8fafc",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  heroSubtitle: {
    color: "#94a3b8",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  heroBrandBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },

  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
  },
  heroStatBox: { flex: 1, alignItems: "center" },
  heroStatNumber: {
    color: "#f8fafc",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  heroStatLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  heroStatDivider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.12)" },

  guestCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
  },
  guestCardText: {
    flex: 1,
    color: "#94a3b8",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },

  heroCreateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 30,
    paddingVertical: 13,
  },
  heroCreateBtnText: {
    color: "#0f172a",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },

  list: { paddingHorizontal: 16, paddingTop: 20, gap: 12 },
  listSectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#94a3b8",
    letterSpacing: 1,
    marginBottom: 4,
  },

  planCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  planAccentBar: { width: 4 },
  planCardInner: { flex: 1, paddingVertical: 14, paddingHorizontal: 14, gap: 10 },
  planCardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  planIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  planMeta: { flex: 1 },
  planCardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#0f172a" },
  planCardDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748b", marginTop: 1 },
  planBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  planBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  planCardBottom: {},
  planCardCta: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#2563eb" },

  emptyState: { alignItems: "center", paddingTop: 48, paddingHorizontal: 36 },
  emptyIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 8 },
  emptyBody: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  emptyBtn: {
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
  },
  emptyBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
