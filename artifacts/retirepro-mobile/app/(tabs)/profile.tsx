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
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/hooks/useApi";

function InfoRow({ label, value, colors }: { label: string; value?: string | number | null; colors: ReturnType<typeof useColors> }) {
  const display = value !== null && value !== undefined && String(value).trim() !== "" ? String(value) : "—";
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground }]}>{display}</Text>
    </View>
  );
}

interface EditField {
  key: string;
  label: string;
  placeholder: string;
  keyboardType: KeyboardTypeOptions;
  prefix?: string;
  suffix?: string;
}

const EDIT_FIELDS: EditField[] = [
  { key: "phone", label: "Phone Number", placeholder: "+91 9876543210", keyboardType: "phone-pad" },
  { key: "dob", label: "Date of Birth", placeholder: "YYYY-MM-DD", keyboardType: "default" },
  { key: "retirementAge", label: "Retirement Age", placeholder: "60", keyboardType: "numeric", suffix: "yrs" },
  { key: "monthlyIncome", label: "Monthly Income", placeholder: "50000", keyboardType: "numeric", prefix: "₹" },
  { key: "monthlyExpenses", label: "Monthly Expenses", placeholder: "30000", keyboardType: "numeric", prefix: "₹" },
  { key: "monthlySavings", label: "Monthly Savings", placeholder: "20000", keyboardType: "numeric", prefix: "₹" },
  { key: "currentAssets", label: "Current Assets", placeholder: "500000", keyboardType: "numeric", prefix: "₹" },
  { key: "incomeGrowthRate", label: "Income Growth Rate", placeholder: "8", keyboardType: "numeric", suffix: "%" },
];

function formatCurrency(val?: number | null) {
  if (val == null || val === 0) return null;
  return `₹${Number(val).toLocaleString("en-IN")}`;
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
        </View>
        <View style={styles.center}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.secondary }]}>
            <Ionicons name="person-outline" size={40} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.guestName, { color: colors.foreground }]}>Not signed in</Text>
          <Text style={[styles.guestSub, { color: colors.mutedForeground }]}>
            Log in via the RetirePro web app to view your profile here.
          </Text>
        </View>
      </View>
    );
  }

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (editing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setEditing(false)}>
            <Ionicons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.saveText, { color: colors.primary }]}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={[
            styles.editScroll,
            { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {EDIT_FIELDS.map((f) => (
            <View key={f.key} style={styles.editFieldGroup}>
              <Text style={[styles.editLabel, { color: colors.foreground }]}>{f.label}</Text>
              <View style={[styles.editInputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {f.prefix && <Text style={[styles.addon, { color: colors.mutedForeground }]}>{f.prefix}</Text>}
                <TextInput
                  style={[styles.editInput, { color: colors.foreground }]}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType={f.keyboardType}
                  value={form[f.key]}
                  onChangeText={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                  autoCorrect={false}
                />
                {f.suffix && <Text style={[styles.addon, { color: colors.mutedForeground }]}>{f.suffix}</Text>}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
        <TouchableOpacity onPress={startEditing}>
          <Ionicons name="pencil-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.avatarSection, { backgroundColor: colors.card }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={[styles.displayName, { color: colors.foreground }]}>{displayName}</Text>
          {user?.email && (
            <Text style={[styles.email, { color: colors.mutedForeground }]}>{user.email}</Text>
          )}
          {user?.role === "admin" && (
            <View style={[styles.adminBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="shield-checkmark" size={11} color="#fff" />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Contact</Text>
          <InfoRow label="Phone" value={user?.phone} colors={colors} />
          <InfoRow label="Date of Birth" value={user?.dob} colors={colors} />
          <InfoRow label="Retirement Age" value={user?.retirementAge ? `${user.retirementAge} years` : null} colors={colors} />
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Financial Summary</Text>
          <InfoRow label="Monthly Income" value={formatCurrency(user?.monthlyIncome)} colors={colors} />
          <InfoRow label="Monthly Expenses" value={formatCurrency(user?.monthlyExpenses)} colors={colors} />
          <InfoRow label="Monthly Savings" value={formatCurrency(user?.monthlySavings)} colors={colors} />
          <InfoRow label="Current Assets" value={formatCurrency(user?.currentAssets)} colors={colors} />
        </View>

        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: colors.secondary }]}
          onPress={startEditing}
          activeOpacity={0.8}
        >
          <Ionicons name="pencil-outline" size={18} color={colors.primary} />
          <Text style={[styles.editBtnText, { color: colors.primary }]}>Edit Financial Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  saveText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  scrollContent: { padding: 16, gap: 16 },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 28,
    borderRadius: 20,
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarInitials: { color: "#fff", fontSize: 30, fontFamily: "Inter_700Bold" },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  displayName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  email: { fontSize: 14, fontFamily: "Inter_400Regular" },
  guestName: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 8, textAlign: "center" },
  guestSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  adminBadgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  infoCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  cardTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 14, fontFamily: "Inter_500Medium", maxWidth: "55%", textAlign: "right" },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 30,
  },
  editBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  editScroll: { padding: 16, gap: 16 },
  editFieldGroup: { gap: 6 },
  editLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  editInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
  },
  addon: { fontSize: 15, fontFamily: "Inter_400Regular", paddingHorizontal: 4 },
  editInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
});
