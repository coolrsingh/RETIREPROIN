import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardTypeOptions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";

interface FormField {
  key: string;
  label: string;
  placeholder: string;
  keyboardType: KeyboardTypeOptions;
  prefix?: string;
  suffix?: string;
  hint?: string;
}

const FIELDS: FormField[] = [
  { key: "fullName", label: "Full Name", placeholder: "e.g. Rahul Sharma", keyboardType: "default" },
  { key: "dob", label: "Date of Birth", placeholder: "YYYY-MM-DD", keyboardType: "default", hint: "Format: YYYY-MM-DD" },
  { key: "retirementAge", label: "Retirement Age", placeholder: "60", keyboardType: "numeric", suffix: "yrs" },
  { key: "monthlyIncomeTotal", label: "Monthly Income", placeholder: "50000", keyboardType: "numeric", prefix: "₹" },
  { key: "monthlyExpenseTotal", label: "Monthly Expenses", placeholder: "30000", keyboardType: "numeric", prefix: "₹" },
  { key: "monthlySavings", label: "Monthly Savings", placeholder: "20000", keyboardType: "numeric", prefix: "₹" },
  { key: "assetsLumpSum", label: "Current Assets", placeholder: "500000", keyboardType: "numeric", prefix: "₹" },
  { key: "incomeGrowthRate", label: "Income Growth Rate", placeholder: "8", keyboardType: "numeric", suffix: "%" },
  { key: "returnPre", label: "Pre-retirement Returns", placeholder: "12", keyboardType: "numeric", suffix: "%", hint: "Expected annual return before retirement" },
  { key: "returnPost", label: "Post-retirement Returns", placeholder: "8", keyboardType: "numeric", suffix: "%", hint: "Expected annual return after retirement" },
  { key: "inflationRate", label: "Inflation Rate", placeholder: "7", keyboardType: "numeric", suffix: "%" },
];

type FormData = Record<string, string>;

const DEFAULTS: FormData = {
  fullName: "",
  dob: "",
  retirementAge: "60",
  monthlyIncomeTotal: "",
  monthlyExpenseTotal: "",
  monthlySavings: "",
  assetsLumpSum: "0",
  incomeGrowthRate: "8",
  returnPre: "12",
  returnPost: "8",
  inflationRate: "7",
};

function FieldInput({
  field,
  value,
  onChange,
  colors,
}: {
  field: FormField;
  value: string;
  onChange: (v: string) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{field.label}</Text>
      <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {field.prefix && (
          <Text style={[styles.inputAddon, { color: colors.mutedForeground }]}>{field.prefix}</Text>
        )}
        <TextInput
          style={[styles.input, { color: colors.foreground, flex: 1 }]}
          placeholder={field.placeholder}
          placeholderTextColor={colors.mutedForeground}
          keyboardType={field.keyboardType}
          value={value}
          onChangeText={onChange}
          autoCorrect={false}
        />
        {field.suffix && (
          <Text style={[styles.inputAddon, { color: colors.mutedForeground }]}>{field.suffix}</Text>
        )}
      </View>
      {field.hint && (
        <Text style={[styles.fieldHint, { color: colors.mutedForeground }]}>{field.hint}</Text>
      )}
    </View>
  );
}

export default function NewPlanScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormData>({
    ...DEFAULTS,
    fullName: user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "",
    dob: user?.dob ?? "",
    retirementAge: user?.retirementAge ? String(user.retirementAge) : "60",
    monthlyIncomeTotal: user?.monthlyIncome ? String(user.monthlyIncome) : "",
    monthlyExpenseTotal: user?.monthlyExpenses ? String(user.monthlyExpenses) : "",
    monthlySavings: user?.monthlySavings ? String(user.monthlySavings) : "",
    assetsLumpSum: user?.currentAssets ? String(user.currentAssets) : "0",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): string | null => {
    if (!form.fullName.trim()) return "Please enter your full name.";
    if (!form.dob.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(form.dob.trim()))
      return "Date of birth must be in YYYY-MM-DD format.";
    if (!form.monthlyIncomeTotal || Number(form.monthlyIncomeTotal) <= 0)
      return "Please enter your monthly income.";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      Alert.alert("Missing info", err);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        dob: form.dob.trim(),
        retirementAge: Number(form.retirementAge) || 60,
        monthlyIncomeTotal: Number(form.monthlyIncomeTotal) || 0,
        monthlyExpenseTotal: Number(form.monthlyExpenseTotal) || 0,
        monthlySavings: Number(form.monthlySavings) || 0,
        incomeGrowthRate: Number(form.incomeGrowthRate) || 8,
        assetsLumpSum: Number(form.assetsLumpSum) || 0,
        children: [],
        assumptions: {
          returnPre: Number(form.returnPre) || 12,
          returnPost: Number(form.returnPost) || 8,
          inflationHeadline: Number(form.inflationRate) || 7,
        },
      };
      const scenario = await apiFetch<{ id: number }>("/api/plan/quick", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      await queryClient.invalidateQueries({ queryKey: ["scenarios"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push(`/plan/${scenario.id}` as any);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", e.message ?? "Failed to create plan. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>New Plan</Text>
        </View>
        <View style={styles.center}>
          <View style={[styles.lockIconBg, { backgroundColor: colors.secondary }]}>
            <Ionicons name="lock-closed-outline" size={36} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.lockTitle, { color: colors.foreground }]}>Sign in required</Text>
          <Text style={[styles.lockSubtitle, { color: colors.mutedForeground }]}>
            Please log in via the RetirePro web app to create a retirement plan.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>New Plan</Text>
        <View style={[styles.headerBadge, { backgroundColor: colors.secondary }]}>
          <Ionicons name="flash" size={13} color={colors.primary} />
          <Text style={[styles.headerBadgeText, { color: colors.primary }]}>Quick</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>
          Fill in your details to generate a personalized retirement projection in seconds.
        </Text>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Basic Information</Text>
          </View>
          {FIELDS.slice(0, 3).map((f) => (
            <FieldInput key={f.key} field={f} value={form[f.key]} onChange={(v) => handleChange(f.key, v)} colors={colors} />
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="wallet-outline" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Finances</Text>
          </View>
          {FIELDS.slice(3, 8).map((f) => (
            <FieldInput key={f.key} field={f} value={form[f.key]} onChange={(v) => handleChange(f.key, v)} colors={colors} />
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up-outline" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Assumptions</Text>
          </View>
          {FIELDS.slice(8).map((f) => (
            <FieldInput key={f.key} field={f} value={form[f.key]} onChange={(v) => handleChange(f.key, v)} colors={colors} />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: isSubmitting ? colors.mutedForeground : colors.primary },
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="calculator-outline" size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Calculate My Plan</Text>
            </>
          )}
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
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  headerBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  scrollContent: { padding: 16, gap: 16 },
  sectionHint: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 4 },
  section: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 16,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  fieldHint: { fontSize: 11, fontFamily: "Inter_400Regular" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
  },
  inputAddon: { fontSize: 15, fontFamily: "Inter_400Regular", paddingHorizontal: 4 },
  input: { fontSize: 15, fontFamily: "Inter_400Regular" },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 8,
  },
  submitBtnText: { color: "#fff", fontSize: 17, fontFamily: "Inter_600SemiBold" },
  lockIconBg: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  lockTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 8, textAlign: "center" },
  lockSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
});
