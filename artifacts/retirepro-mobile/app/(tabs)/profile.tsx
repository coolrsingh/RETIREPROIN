import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardTypeOptions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/hooks/useApi";

function fmt(val?: number | null, prefix = "₹") {
  if (val == null || val === 0) return null;
  const n = Number(val);
  if (n >= 1_00_00_000) return `${prefix}${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000) return `${prefix}${(n / 1_00_000).toFixed(1)}L`;
  return `${prefix}${n.toLocaleString("en-IN")}`;
}

interface EditFieldDef {
  key: string;
  label: string;
  placeholder: string;
  keyboardType: KeyboardTypeOptions;
  prefix?: string;
  suffix?: string;
}

const EDIT_FIELDS: EditFieldDef[] = [
  { key: "phone", label: "Phone Number", placeholder: "+91 9876543210", keyboardType: "phone-pad" },
  { key: "dob", label: "Date of Birth", placeholder: "YYYY-MM-DD", keyboardType: "default" },
  { key: "retirementAge", label: "Retirement Age", placeholder: "60", keyboardType: "numeric", suffix: "yrs" },
  { key: "monthlyIncome", label: "Monthly Income", placeholder: "50000", keyboardType: "numeric", prefix: "₹" },
  { key: "monthlyExpenses", label: "Monthly Expenses", placeholder: "30000", keyboardType: "numeric", prefix: "₹" },
  { key: "monthlySavings", label: "Monthly Savings", placeholder: "20000", keyboardType: "numeric", prefix: "₹" },
  { key: "currentAssets", label: "Current Assets", placeholder: "500000", keyboardType: "numeric", prefix: "₹" },
  { key: "incomeGrowthRate", label: "Income Growth Rate", placeholder: "8", keyboardType: "numeric", suffix: "%" },
];

function MetricTile({ label, value, icon, accent }: { label: string; value: string; icon: string; accent: string }) {
  return (
    <View style={[styles.metricTile, { borderColor: accent + "30" }]}>
      <View style={[styles.metricIconBox, { backgroundColor: accent + "15" }]}>
        <Ionicons name={icon as any} size={16} color={accent} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, isLoading, refetch } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const startEditing = () => {
    setForm({
      phone: user?.phone ?? "",
      dob: user?.dob ?? "",
      retirementAge: user?.retirementAge ? String(user.retirementAge) : "",
      monthlyIncome: user?.monthlyIncome ? String(user.monthlyIncome) : "",
      monthlyExpenses: user?.monthlyExpenses ? String(user.monthlyExpenses) : "",
      monthlySavings: user?.monthlySavings ? String(user.monthlySavings) : "",
      currentAssets: user?.currentAssets ? String(user.currentAssets) : "",
      incomeGrowthRate: "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await apiFetch("/api/profile", {
        method: "PUT",
        body: JSON.stringify({
          phone: form.phone || null,
          dob: form.dob || null,
          retirementAge: form.retirementAge ? Number(form.retirementAge) : null,
          monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : null,
          monthlyExpenses: form.monthlyExpenses ? Number(form.monthlyExpenses) : null,
          monthlySavings: form.monthlySavings ? Number(form.monthlySavings) : null,
          currentAssets: form.currentAssets ? Number(form.currentAssets) : null,
          incomeGrowthRate: form.incomeGrowthRate ? Number(form.incomeGrowthRate) : null,
        }),
      });
      await refetch();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEditing(false);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={["#0f172a", "#1e3a5f"]}
          style={[styles.heroShort, { paddingTop: topPad + 16 }]}
        >
          <Text style={styles.heroTitle}>My Profile</Text>
        </LinearGradient>
        <View style={styles.guestState}>
          <View style={[styles.guestAvatarRing, { borderColor: colors.border }]}>
            <Ionicons name="person-outline" size={32} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.guestTitle, { color: colors.text }]}>Not signed in</Text>
          <Text style={[styles.guestBody, { color: colors.mutedForeground }]}>
            Log in via the RetirePro web app to view and edit your financial profile.
          </Text>
        </View>
      </View>
    );
  }

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";
  const initials = displayName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  if (editing) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={["#0f172a", "#1e3a5f"]}
          style={[styles.heroShort, { paddingTop: topPad + 16 }]}
        >
          <View style={styles.editHeroRow}>
            <TouchableOpacity onPress={() => setEditing(false)} style={styles.editHeroBack}>
              <Ionicons name="chevron-back" size={22} color="#f8fafc" />
            </TouchableOpacity>
            <Text style={styles.heroTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.editSaveBtn}>
              {saving ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                <Text style={styles.editSaveBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={[
            styles.editScrollContent,
            { paddingBottom: Platform.OS === "web" ? 40 : insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {EDIT_FIELDS.map((f) => (
            <View key={f.key} style={styles.editField}>
              <Text style={styles.editLabel}>{f.label}</Text>
              <View style={styles.editInputBox}>
                {f.prefix && <Text style={styles.editAddon}>{f.prefix}</Text>}
                <TextInput
                  style={styles.editInput}
                  placeholder={f.placeholder}
                  placeholderTextColor="#94a3b8"
                  keyboardType={f.keyboardType}
                  value={form[f.key]}
                  onChangeText={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                  autoCorrect={false}
                />
                {f.suffix && <Text style={styles.editAddonSuffix}>{f.suffix}</Text>}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  const savingsRate =
    user?.monthlyIncome && user?.monthlySavings
      ? Math.round((user.monthlySavings / user.monthlyIncome) * 100)
      : null;

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#0f172a", "#1e3a5f"]}
        style={[styles.heroProfile, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.avatarRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.avatarName}>{displayName}</Text>
            {user?.email && <Text style={styles.avatarEmail}>{user.email}</Text>}
            {user?.role === "admin" && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={10} color="#fbbf24" />
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.editIconBtn} onPress={startEditing} activeOpacity={0.7}>
            <Ionicons name="pencil" size={16} color="#93c5fd" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 40 : insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.metricsGrid}>
          <MetricTile
            label="Monthly Income"
            value={fmt(user?.monthlyIncome) ?? "—"}
            icon="trending-up-outline"
            accent="#2563eb"
          />
          <MetricTile
            label="Monthly Savings"
            value={fmt(user?.monthlySavings) ?? "—"}
            icon="save-outline"
            accent="#10b981"
          />
          <MetricTile
            label="Current Assets"
            value={fmt(user?.currentAssets) ?? "—"}
            icon="briefcase-outline"
            accent="#7c3aed"
          />
          <MetricTile
            label="Savings Rate"
            value={savingsRate != null ? `${savingsRate}%` : "—"}
            icon="pie-chart-outline"
            accent="#f59e0b"
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>PERSONAL DETAILS</Text>
          {[
            { label: "Phone", value: user?.phone },
            { label: "Date of Birth", value: user?.dob },
            { label: "Retire at Age", value: user?.retirementAge ? `${user.retirementAge} years` : null },
          ].map((row) => (
            <View key={row.label} style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>{row.label}</Text>
              <Text style={styles.infoRowValue}>{row.value ?? "—"}</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>FINANCES</Text>
          {[
            { label: "Monthly Income", value: fmt(user?.monthlyIncome) },
            { label: "Monthly Expenses", value: fmt(user?.monthlyExpenses) },
            { label: "Monthly Savings", value: fmt(user?.monthlySavings) },
            { label: "Current Assets", value: fmt(user?.currentAssets) },
          ].map((row) => (
            <View key={row.label} style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>{row.label}</Text>
              <Text style={[styles.infoRowValue, row.value ? { color: "#0f172a" } : {}]}>
                {row.value ?? "—"}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.updateBtn} onPress={startEditing} activeOpacity={0.85}>
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.updateBtnText}>Update Financial Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },

  heroShort: { paddingHorizontal: 20, paddingBottom: 20 },
  heroProfile: { paddingHorizontal: 20, paddingBottom: 24 },
  heroTitle: { color: "#f8fafc", fontSize: 22, fontFamily: "Inter_700Bold" },

  avatarRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
  },
  avatarInitials: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold" },
  avatarInfo: { flex: 1, gap: 2 },
  avatarName: { color: "#f8fafc", fontSize: 18, fontFamily: "Inter_700Bold" },
  avatarEmail: { color: "#94a3b8", fontSize: 13, fontFamily: "Inter_400Regular" },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(251,191,36,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  adminBadgeText: { color: "#fbbf24", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  editIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
  },

  scrollContent: { padding: 16, gap: 16 },

  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricTile: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  metricIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  metricValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#0f172a" },
  metricLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#64748b" },

  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  infoCardTitle: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#94a3b8",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#f1f5f9",
  },
  infoRowLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#64748b" },
  infoRowValue: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#94a3b8", maxWidth: "55%", textAlign: "right" },

  updateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563eb",
    paddingVertical: 15,
    borderRadius: 30,
  },
  updateBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },

  guestState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 36 },
  guestAvatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  guestTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 8 },
  guestBody: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },

  editHeroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  editHeroBack: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  editSaveBtn: {
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  editSaveBtnText: { color: "#2563eb", fontSize: 14, fontFamily: "Inter_600SemiBold" },

  editScrollContent: { padding: 16, gap: 14 },
  editField: { gap: 6 },
  editLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#334155" },
  editInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    height: 50,
  },
  editAddon: { fontSize: 16, fontFamily: "Inter_400Regular", color: "#64748b", marginRight: 4 },
  editAddonSuffix: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#64748b", marginLeft: 4 },
  editInput: { flex: 1, fontSize: 16, fontFamily: "Inter_400Regular", color: "#0f172a" },
});
