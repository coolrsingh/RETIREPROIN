import React, { useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";

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

interface StepFieldDef {
  key: string;
  label: string;
  placeholder: string;
  keyboardType: KeyboardTypeOptions;
  prefix?: string;
  suffix?: string;
  hint?: string;
  icon: string;
}

const STEPS: { title: string; subtitle: string; icon: string; fields: StepFieldDef[] }[] = [
  {
    title: "About You",
    subtitle: "Let's start with the basics",
    icon: "person-circle-outline",
    fields: [
      { key: "fullName", label: "Full Name", placeholder: "Rahul Sharma", keyboardType: "default", icon: "person-outline" },
      { key: "dob", label: "Date of Birth", placeholder: "YYYY-MM-DD", keyboardType: "default", icon: "calendar-outline", hint: "Format: YYYY-MM-DD" },
      { key: "retirementAge", label: "Target Retirement Age", placeholder: "60", keyboardType: "numeric", suffix: "yrs", icon: "hourglass-outline" },
    ],
  },
  {
    title: "Your Finances",
    subtitle: "Income, expenses & existing wealth",
    icon: "wallet-outline",
    fields: [
      { key: "monthlyIncomeTotal", label: "Monthly Income", placeholder: "50,000", keyboardType: "numeric", prefix: "₹", icon: "trending-up-outline" },
      { key: "monthlyExpenseTotal", label: "Monthly Expenses", placeholder: "30,000", keyboardType: "numeric", prefix: "₹", icon: "receipt-outline" },
      { key: "monthlySavings", label: "Monthly Savings / SIP", placeholder: "20,000", keyboardType: "numeric", prefix: "₹", icon: "save-outline" },
      { key: "assetsLumpSum", label: "Existing Investments / Assets", placeholder: "5,00,000", keyboardType: "numeric", prefix: "₹", icon: "briefcase-outline" },
    ],
  },
  {
    title: "Assumptions",
    subtitle: "Fine-tune your projections",
    icon: "options-outline",
    fields: [
      { key: "incomeGrowthRate", label: "Annual Income Growth", placeholder: "8", keyboardType: "numeric", suffix: "%", icon: "arrow-up-outline" },
      { key: "returnPre", label: "Pre-retirement Returns", placeholder: "12", keyboardType: "numeric", suffix: "%", icon: "stats-chart-outline", hint: "Expected portfolio return before retirement" },
      { key: "returnPost", label: "Post-retirement Returns", placeholder: "8", keyboardType: "numeric", suffix: "%", icon: "shield-checkmark-outline", hint: "Safe withdrawal rate after retirement" },
      { key: "inflationRate", label: "Inflation Rate", placeholder: "7", keyboardType: "numeric", suffix: "%", icon: "flame-outline" },
    ],
  },
];

function StepField({
  field,
  value,
  onChange,
}: {
  field: StepFieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      <View style={styles.fieldLabelRow}>
        <Ionicons name={field.icon as any} size={14} color="#64748b" />
        <Text style={styles.fieldLabel}>{field.label}</Text>
      </View>
      <View style={styles.inputBox}>
        {field.prefix && <Text style={styles.addonText}>{field.prefix}</Text>}
        <TextInput
          style={styles.input}
          placeholder={field.placeholder}
          placeholderTextColor="#94a3b8"
          keyboardType={field.keyboardType}
          value={value}
          onChangeText={onChange}
          autoCorrect={false}
        />
        {field.suffix && <Text style={styles.addonSuffix}>{field.suffix}</Text>}
      </View>
      {field.hint && <Text style={styles.fieldHint}>{field.hint}</Text>}
    </View>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.progressTrack}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.progressSegment,
            { backgroundColor: i < step ? "#2563eb" : "#e2e8f0" },
          ]}
        />
      ))}
    </View>
  );
}

export default function NewPlanScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
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
  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validateStep = (): string | null => {
    if (step === 0) {
      if (!form.fullName.trim()) return "Please enter your full name.";
      if (!form.dob.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(form.dob.trim()))
        return "Date of birth must be in YYYY-MM-DD format.";
    }
    if (step === 1) {
      if (!form.monthlyIncomeTotal || Number(form.monthlyIncomeTotal) <= 0)
        return "Please enter your monthly income.";
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { Alert.alert("", err); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { Alert.alert("", err); return; }
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
      Alert.alert("Something went wrong", e.message ?? "Failed to create plan. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={["#0f172a", "#1e3a5f"]}
          style={[styles.hero, { paddingTop: topPad + 16 }]}
        >
          <Text style={styles.heroTitle}>Plan Calculator</Text>
          <Text style={styles.heroSub}>Build your personalised retirement projection</Text>
        </LinearGradient>
        <View style={styles.guestLock}>
          <View style={[styles.lockRing, { borderColor: colors.border }]}>
            <Ionicons name="lock-closed" size={28} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.lockTitle, { color: colors.text }]}>Sign in to continue</Text>
          <Text style={[styles.lockBody, { color: colors.mutedForeground }]}>
            Log in via the RetirePro web app, then return here to create your plan.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#0f172a", "#1e3a5f"]}
        style={[styles.hero, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.heroTitle}>Plan Calculator</Text>
            <Text style={styles.heroSub}>Step {step + 1} of {STEPS.length}</Text>
          </View>
          <View style={[styles.stepIconCircle]}>
            <Ionicons name={currentStep.icon as any} size={22} color="#93c5fd" />
          </View>
        </View>
        <ProgressBar step={step + 1} total={STEPS.length} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 40 : insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepCard}>
          <View style={styles.stepCardHeader}>
            <Text style={styles.stepCardTitle}>{currentStep.title}</Text>
            <Text style={styles.stepCardSubtitle}>{currentStep.subtitle}</Text>
          </View>
          <View style={styles.fieldsContainer}>
            {currentStep.fields.map((f) => (
              <StepField
                key={f.key}
                field={f}
                value={form[f.key]}
                onChange={(v) => handleChange(f.key, v)}
              />
            ))}
          </View>
        </View>

        <View style={styles.navRow}>
          {step > 0 && (
            <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.75}>
              <Ionicons name="arrow-back" size={18} color="#2563eb" />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.nextBtn,
              step === 0 && { marginLeft: "auto" as any },
              isSubmitting && { opacity: 0.7 },
            ]}
            onPress={isLastStep ? handleSubmit : handleNext}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.nextBtnText}>
                  {isLastStep ? "Calculate Plan" : "Continue"}
                </Text>
                {!isLastStep && <Ionicons name="arrow-forward" size={18} color="#fff" />}
                {isLastStep && <Ionicons name="calculator" size={18} color="#fff" />}
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },

  hero: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroTitle: { color: "#f8fafc", fontSize: 22, fontFamily: "Inter_700Bold" },
  heroSub: { color: "#94a3b8", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  stepIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
  },
  progressTrack: { flexDirection: "row", gap: 6 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },

  scrollContent: { padding: 16, gap: 16 },

  stepCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    gap: 20,
  },
  stepCardHeader: { gap: 4 },
  stepCardTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#0f172a" },
  stepCardSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#64748b" },
  fieldsContainer: { gap: 18 },

  fieldWrap: { gap: 6 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#334155" },
  fieldHint: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#94a3b8" },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    height: 50,
  },
  addonText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: "#64748b",
    marginRight: 4,
  },
  addonSuffix: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#64748b",
    marginLeft: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#0f172a",
  },

  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#2563eb",
  },
  backBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#2563eb" },
  nextBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 30,
  },
  nextBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },

  guestLock: { flex: 1, alignItems: "center", justifyContent: "center", padding: 36 },
  lockRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  lockTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 8, textAlign: "center" },
  lockBody: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
});
