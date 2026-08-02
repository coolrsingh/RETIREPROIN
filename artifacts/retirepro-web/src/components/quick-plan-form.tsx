import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quickPlanSchema, type QuickPlan } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { SliderField } from "@/components/slider-field";
import {
  Plus, Trash2, Zap, Coffee, CreditCard, TrendingUp,
  Calculator, Lock, Target, Users, HandCoins, PiggyBank,
} from "lucide-react";

// ── Goal definitions ──────────────────────────────────────────────────────────

const GOALS = [
  {
    key: "fire" as const,
    icon: "🔥",
    label: "Retire Early",
    sublabel: "FIRE lifestyle",
    multiplier: 0.6,
    color: "border-orange-400 bg-orange-50 text-orange-900",
    selectedColor: "border-orange-500 bg-orange-100 ring-2 ring-orange-400",
    desc: "0.6× current expenses",
  },
  {
    key: "lean" as const,
    icon: "🎯",
    label: "Lean & Simple",
    sublabel: "Essential comfort",
    multiplier: 0.75,
    color: "border-teal-300 bg-teal-50 text-teal-900",
    selectedColor: "border-teal-500 bg-teal-100 ring-2 ring-teal-400",
    desc: "0.75× current expenses",
  },
  {
    key: "comfortable" as const,
    icon: "😌",
    label: "Comfortable",
    sublabel: "Same as today",
    multiplier: 1.0,
    color: "border-blue-300 bg-blue-50 text-blue-900",
    selectedColor: "border-blue-500 bg-blue-100 ring-2 ring-blue-400",
    desc: "1× current expenses",
  },
  {
    key: "lavish" as const,
    icon: "🥂",
    label: "Lavish",
    sublabel: "Premium lifestyle",
    multiplier: 1.3,
    color: "border-purple-300 bg-purple-50 text-purple-900",
    selectedColor: "border-purple-500 bg-purple-100 ring-2 ring-purple-400",
    desc: "1.3× current expenses",
  },
] as const;

type PersonaMode = "accumulating" | "retired";
type GoalKey = "fire" | "lean" | "comfortable" | "lavish";

// ── Component props ───────────────────────────────────────────────────────────

interface QuickPlanFormProps {
  onSubmit: (data: QuickPlan) => void;
  isLoading: boolean;
  profileDefaults?: {
    fullName?: string;
    dob?: string;
    retirementAge?: number;
    monthlyIncomeTotal?: number;
    monthlyExpenseTotal?: number;
    monthlySavings?: number;
    incomeGrowthRate?: number;
    assetsLumpSum?: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function QuickPlanForm({ onSubmit, isLoading, profileDefaults }: QuickPlanFormProps) {
  // ── Local state ────────────────────────────────────────────────────────────
  const [personaMode, setPersonaMode] = useState<PersonaMode>("accumulating");
  const [retirementGoal, setRetirementGoal] = useState<GoalKey>("comfortable");
  const [hasSpouse, setHasSpouse] = useState(false);
  const [children, setChildren] = useState<any[]>([]);
  const [customGoals, setCustomGoals] = useState<{ name: string; todaysCost: number; yearsFromNow: number }[]>([]);
  const [hasMiniRetirement, setHasMiniRetirement] = useState(false);
  const [hasExistingEMI, setHasExistingEMI] = useState(false);
  const [savingsAutoMode, setSavingsAutoMode] = useState(true);

  // ── Form ──────────────────────────────────────────────────────────────────
  const form = useForm<QuickPlan>({
    resolver: zodResolver(quickPlanSchema),
    defaultValues: {
      fullName: profileDefaults?.fullName ?? "",
      dob: profileDefaults?.dob ?? "",
      retirementAge: profileDefaults?.retirementAge ?? 60,
      spouseDob: "",
      spouseName: "",
      spouseMonthlyIncome: 0,
      spouseRetirementAge: 60,
      isJointRetirement: false,
      monthlyIncomeTotal: profileDefaults?.monthlyIncomeTotal ?? 0,
      monthlyExpenseTotal: profileDefaults?.monthlyExpenseTotal ?? 0,
      monthlySavings: profileDefaults?.monthlySavings ?? 0,
      incomeGrowthRate: profileDefaults?.incomeGrowthRate ?? 8,
      children: [],
      assetsLumpSum: profileDefaults?.assetsLumpSum ?? 0,
      assetsLumpSumReturn: 12,
      epfCorpus: 0,
      epfReturn: 8.25,
      epfMonthlyContribution: 0,
      npsCorpus: 0,
      npsReturn: 10,
      npsMonthlyContribution: 0,
      currentCorpus: 0,
      monthlyWithdrawal: 0,
      yearsToCover: 25,
      assumptions: {
        returnPre: 12,
        returnPost: 8,
        inflationHeadline: 7,
      },
    },
  });

  // ── Watchers ──────────────────────────────────────────────────────────────
  const income = form.watch("monthlyIncomeTotal");
  const expenses = form.watch("monthlyExpenseTotal");
  const retirementAge = form.watch("retirementAge");
  const inflationPct = form.watch("assumptions.inflationHeadline") ?? 7;
  const returnPre = form.watch("assumptions.returnPre") ?? 12;
  const returnPost = form.watch("assumptions.returnPost") ?? 8;
  const incomeGrowthRate = form.watch("incomeGrowthRate") ?? 8;
  const epfMonthlyContributionWatch = form.watch("epfMonthlyContribution") ?? 0;
  const npsMonthlyContributionWatch = form.watch("npsMonthlyContribution") ?? 0;

  // EPF/NPS contributions are tracked as their own line items, so they're
  // deducted here — the remaining amount is what actually goes toward
  // "Other Investments".
  const computedSavings = Math.max(
    0,
    (Number(income) || 0) - (Number(expenses) || 0) - (Number(epfMonthlyContributionWatch) || 0) - (Number(npsMonthlyContributionWatch) || 0)
  );

  // ── Goal multiplier display ────────────────────────────────────────────────
  const selectedGoal = GOALS.find((g) => g.key === retirementGoal)!;
  const postRetirementEstimate = Math.round((Number(expenses) || 0) * selectedGoal.multiplier);

  // ── Effects ───────────────────────────────────────────────────────────────
  // Auto-calculate savings
  useEffect(() => {
    if (savingsAutoMode && personaMode === "accumulating") {
      form.setValue("monthlySavings", computedSavings, { shouldValidate: false });
    }
  }, [income, expenses, savingsAutoMode, personaMode]);

  // When switching modes, sync the hidden personaMode RHF field so superRefine sees the right value
  useEffect(() => {
    form.setValue("personaMode", personaMode as any, { shouldValidate: false });
    if (personaMode === "retired") {
      form.setValue("monthlyIncomeTotal", 0, { shouldValidate: false });
    }
  }, [personaMode]);

  // ── Children helpers ──────────────────────────────────────────────────────
  const addChild = () => {
    const updated = [...children, { name: "", dob: "", eduTodaysCost: 0, marriageTodaysCost: 0 }];
    setChildren(updated);
    form.setValue("children", updated);
  };
  const removeChild = (index: number) => {
    const updated = children.filter((_, i) => i !== index);
    setChildren(updated);
    form.setValue("children", updated);
  };

  // ── Custom goal helpers ───────────────────────────────────────────────────
  const addCustomGoal = () => setCustomGoals((p) => [...p, { name: "", todaysCost: 0, yearsFromNow: 5 }]);
  const removeCustomGoal = (index: number) => setCustomGoals((p) => p.filter((_, i) => i !== index));
  const updateCustomGoal = (index: number, field: string, value: string | number) => {
    setCustomGoals((p) => {
      const updated = [...p];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (data: QuickPlan) => {
    const isRetired = personaMode === "retired";
    const cleanedData: QuickPlan = {
      ...data,
      personaMode,
      retirementGoal,
      children,
      customGoals: customGoals.filter((g) => g.name.trim() && g.todaysCost > 0 && g.yearsFromNow > 0),
      miniRetirement: hasMiniRetirement && !isRetired ? data.miniRetirement : undefined,
      existingEMI: hasExistingEMI ? data.existingEMI : undefined,
      // Spouse — only send if section is open
      spouseName: hasSpouse ? (data.spouseName || undefined) : undefined,
      spouseDob: hasSpouse ? (data.spouseDob || undefined) : undefined,
      spouseMonthlyIncome: hasSpouse ? (data.spouseMonthlyIncome ?? 0) : undefined,
      spouseRetirementAge: hasSpouse ? (data.spouseRetirementAge ?? 60) : undefined,
      isJointRetirement: hasSpouse,
      // Retired mode: zero out accumulation-specific fields
      monthlyIncomeTotal: isRetired ? 0 : data.monthlyIncomeTotal,
      incomeGrowthRate: isRetired ? 0 : (data.incomeGrowthRate ?? 8),
      monthlySavings: isRetired ? 0 : data.monthlySavings,
    };
    onSubmit(cleanedData);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

        {/* ── 1. PERSONA TOGGLE ──────────────────────────────────────────── */}
        <Card data-testid="card-persona-toggle">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-slate-500" />
              What's your situation?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  {
                    mode: "accumulating" as const,
                    icon: <TrendingUp className="h-5 w-5" />,
                    title: "I'm still building my corpus",
                    desc: "Working, saving & investing toward retirement",
                    accent: "border-blue-400 bg-blue-50",
                    selected: "border-blue-500 bg-blue-100 ring-2 ring-blue-400",
                  },
                  {
                    mode: "retired" as const,
                    icon: <Coffee className="h-5 w-5" />,
                    title: "I'm already retired",
                    desc: "Living off my savings & investments",
                    accent: "border-amber-300 bg-amber-50",
                    selected: "border-amber-500 bg-amber-100 ring-2 ring-amber-400",
                  },
                ] as const
              ).map(({ mode, icon, title, desc, accent, selected }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setPersonaMode(mode);
                    form.setValue("personaMode", mode as any, { shouldValidate: false });
                    if (mode === "retired") form.setValue("monthlyIncomeTotal", 0, { shouldValidate: false });
                  }}
                  data-testid={`persona-${mode}`}
                  className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
                    personaMode === mode ? selected : `${accent} hover:opacity-80`
                  }`}
                >
                  <span className={`mt-0.5 ${personaMode === mode ? "text-blue-700" : "text-slate-500"}`}>
                    {icon}
                  </span>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── 2. GOAL SELECTOR (accumulating only) ──────────────────────── */}
        {personaMode === "accumulating" && (
          <Card data-testid="card-goal-selector">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-5 w-5 text-indigo-500" />
                Retirement lifestyle goal
              </CardTitle>
              <CardDescription>
                Pick the lifestyle you want in retirement — this sets a target expense level.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {GOALS.map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setRetirementGoal(g.key)}
                    data-testid={`goal-${g.key}`}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all cursor-pointer ${
                      retirementGoal === g.key ? g.selectedColor : `${g.color} hover:opacity-80`
                    }`}
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <span className="font-bold text-sm">{g.label}</span>
                    <span className="text-[11px] opacity-70">{g.sublabel}</span>
                  </button>
                ))}
              </div>

              {/* Display estimate */}
              {Number(expenses) > 0 && (
                <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-slate-600">
                    {selectedGoal.icon} At <strong>{selectedGoal.label}</strong>, your target retirement monthly spend:
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    ₹{postRetirementEstimate.toLocaleString("en-IN")}/mo
                    <span className="ml-1.5 text-xs font-normal text-slate-400">
                      ({selectedGoal.desc}, before inflation)
                    </span>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── 3. BASIC INFO ─────────────────────────────────────────────── */}
        <Card data-testid="card-basic-info">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Basic Information
            </CardTitle>
            <CardDescription>Get started with the essentials for your retirement planning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" data-testid="input-full-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" data-testid="input-dob" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Retirement age — slider, accumulating only */}
            {personaMode === "accumulating" && (
              <FormField
                control={form.control}
                name="retirementAge"
                render={({ field }) => (
                  <FormItem>
                    <SliderField
                      label="Target Retirement Age"
                      value={field.value}
                      onChange={field.onChange}
                      min={40}
                      max={75}
                      step={1}
                      unit=" yrs"
                      lowLabel="Early (40)"
                      highLabel="Late (75)"
                      hint="Default is 60 for India-based plans"
                      testId="input-retirement-age"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* ── 4. SPOUSE SECTION ──────────────────────────────────────────── */}
        <Card data-testid="card-spouse">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-pink-500" />
                  Spouse / Partner (Optional)
                </CardTitle>
                <CardDescription>
                  Add your spouse's income to include both incomes in the household projection.
                </CardDescription>
              </div>
              <Switch
                checked={hasSpouse}
                onCheckedChange={setHasSpouse}
                data-testid="toggle-spouse"
                className="mt-1 shrink-0"
              />
            </div>
          </CardHeader>
          {hasSpouse && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="spouseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spouse Name (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Priya" data-testid="input-spouse-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="spouseDob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spouse Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" data-testid="input-spouse-dob" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="spouseMonthlyIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spouse Monthly Income (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="40000"
                          data-testid="input-spouse-income"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="spouseRetirementAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spouse Works Until Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="58"
                          min={18}
                          max={80}
                          data-testid="input-spouse-retirement-age"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <p className="text-xs text-slate-500 mt-1">
                        Spouse income stops at this age in the projection.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* ── 5. FINANCIAL OVERVIEW ─────────────────────────────────────── */}
        <Card data-testid="card-financial-overview">
          <CardHeader>
            <CardTitle>
              {personaMode === "retired" ? "Your Financial Position" : "Financial Overview"}
            </CardTitle>
            <CardDescription>
              {personaMode === "retired"
                ? "Tell us your current corpus and how much you plan to withdraw each month."
                : "Your current income, expenses, and how much you invest each month"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {personaMode === "accumulating" ? (
              /* ── ACCUMULATING MODE ─────────────────────────────────────── */
              <>
                {/* Income + Expenses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="monthlyIncomeTotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Monthly Income (₹)
                          {hasSpouse && (
                            <span className="ml-1.5 text-xs font-normal text-slate-400">— your income only</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50000"
                            data-testid="input-monthly-income"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="monthlyExpenseTotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Expenses (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="30000"
                            data-testid="input-monthly-expense"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Existing EMI */}
                <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-rose-600" />
                      <span className="font-semibold text-sm text-rose-900">Existing EMI</span>
                      <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">Optional</span>
                    </div>
                    <Switch checked={hasExistingEMI} onCheckedChange={setHasExistingEMI} data-testid="toggle-existing-emi" />
                  </div>
                  {hasExistingEMI && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="existingEMI.emiAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly EMI Amount (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="25000"
                                className="bg-white"
                                data-testid="input-emi-amount"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="existingEMI.tenureRemainingMonths"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tenure Remaining (months)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="60"
                                min={0}
                                className="bg-white"
                                data-testid="input-emi-tenure"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Monthly Savings — auto-calculated with override */}
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-y-2 mb-3" data-testid="savings-header-row">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-sm text-blue-900">Monthly Savings / Investment</span>
                      {savingsAutoMode && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">Auto</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSavingsAutoMode(!savingsAutoMode)}
                      className="flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-900 transition-colors"
                    >
                      {savingsAutoMode ? (
                        <><Lock className="h-3 w-3" /> Enter custom amount</>
                      ) : (
                        <><Calculator className="h-3 w-3" /> Auto-calculate</>
                      )}
                    </button>
                  </div>

                  {savingsAutoMode ? (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-blue-700">
                          ₹{computedSavings.toLocaleString("en-IN")}
                        </span>
                        <span className="text-sm text-blue-600">/month</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Calculated as Income − Expenses.{" "}
                        {Number(income) > 0 && Number(expenses) > 0 && (
                          <span className="font-medium">
                            ({Math.round((computedSavings / (Number(income) || 1)) * 100)}% savings rate)
                          </span>
                        )}
                      </p>
                      <input type="hidden" {...form.register("monthlySavings", { valueAsNumber: true })} />
                    </div>
                  ) : (
                    <FormField
                      control={form.control}
                      name="monthlySavings"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={String(computedSavings || 20000)}
                              data-testid="input-monthly-savings"
                              className="bg-white"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-slate-500 mt-1">
                            Income − Expenses = ₹{computedSavings.toLocaleString("en-IN")}. You're entering a custom amount.
                          </p>
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Salary Growth slider */}
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-4 w-4 text-amber-600" />
                    <span className="font-semibold text-sm text-amber-900">Salary Growth Assumption</span>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Optional</span>
                  </div>
                  <FormField
                    control={form.control}
                    name="incomeGrowthRate"
                    render={({ field }) => (
                      <FormItem>
                        <SliderField
                          label="Annual salary growth"
                          value={field.value ?? 8}
                          onChange={field.onChange}
                          min={0}
                          max={20}
                          step={0.5}
                          unit="%"
                          lowLabel="0% (flat)"
                          highLabel="20%"
                          hint="Average Indian salary hike is 8–10% / year"
                          testId="input-income-growth-rate"
                          rowTestId="salary-growth-row"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            ) : (
              /* ── RETIRED / DRAWDOWN MODE ────────────────────────────────── */
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="currentCorpus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <PiggyBank className="h-4 w-4 text-emerald-600" />
                          Current Corpus (₹)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="5000000"
                            data-testid="input-current-corpus"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <p className="text-xs text-slate-500 mt-1">Total investments + EPF + NPS today.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="monthlyWithdrawal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <HandCoins className="h-4 w-4 text-rose-500" />
                          Monthly Withdrawal (₹)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="60000"
                            data-testid="input-monthly-withdrawal"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <p className="text-xs text-slate-500 mt-1">How much you plan to spend each month.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="monthlyExpenseTotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Expenses (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="60000"
                            data-testid="input-monthly-expense"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="yearsToCover"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years Corpus Should Last</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="25"
                            min={1}
                            max={60}
                            data-testid="input-years-to-cover"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <p className="text-xs text-slate-500 mt-1">
                          e.g. 25 years if you're 60 and plan to 85.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Existing EMI */}
                <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-rose-600" />
                      <span className="font-semibold text-sm text-rose-900">Existing EMI</span>
                      <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">Optional</span>
                    </div>
                    <Switch checked={hasExistingEMI} onCheckedChange={setHasExistingEMI} data-testid="toggle-existing-emi-retired" />
                  </div>
                  {hasExistingEMI && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="existingEMI.emiAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly EMI Amount (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="25000"
                                className="bg-white"
                                data-testid="input-emi-amount-retired"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="existingEMI.tenureRemainingMonths"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tenure Remaining (months)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="60"
                                min={0}
                                className="bg-white"
                                data-testid="input-emi-tenure-retired"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                  The projection shows how long your corpus lasts given your withdrawal rate and investment return.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* ── 6. CHILDREN ───────────────────────────────────────────────── */}
        <Card data-testid="card-children">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Children (Optional)</span>
              <Button type="button" variant="outline" size="sm" onClick={addChild} data-testid="button-add-child">
                <Plus className="h-4 w-4 mr-2" /> Add Child
              </Button>
            </CardTitle>
            <CardDescription>
              Add children to automatically mark education and marriage milestones on your projection chart
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {children.map((child, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                <div>
                  <Label>Child Name</Label>
                  <Input
                    placeholder="Child's name"
                    value={child.name}
                    onChange={(e) => {
                      const updated = [...children];
                      updated[index].name = e.target.value;
                      setChildren(updated);
                      form.setValue("children", updated, { shouldValidate: true });
                    }}
                    data-testid={`input-child-name-${index}`}
                  />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={child.dob}
                    onChange={(e) => {
                      const updated = [...children];
                      updated[index].dob = e.target.value;
                      setChildren(updated);
                      form.setValue("children", updated, { shouldValidate: true });
                    }}
                    data-testid={`input-child-dob-${index}`}
                  />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(form.formState.errors.children as any)?.[index]?.dob?.message && (
                    <p className="text-sm text-red-500 mt-1" data-testid={`error-child-dob-${index}`}>
                      {(form.formState.errors.children as any)[index].dob.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Education Cost Today (₹)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={child.eduTodaysCost || ""}
                    onChange={(e) => {
                      const updated = [...children];
                      updated[index].eduTodaysCost = Number(e.target.value) || 0;
                      setChildren(updated);
                      form.setValue("children", updated);
                    }}
                    data-testid={`input-child-edu-cost-${index}`}
                  />
                </div>
                <div>
                  <Label>Marriage Cost Today (₹)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={child.marriageTodaysCost || ""}
                    onChange={(e) => {
                      const updated = [...children];
                      updated[index].marriageTodaysCost = Number(e.target.value) || 0;
                      setChildren(updated);
                      form.setValue("children", updated);
                    }}
                    data-testid={`input-child-marriage-cost-${index}`}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeChild(index)}
                    data-testid={`button-remove-child-${index}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {children.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No children added. Education 🎓 and marriage 💍 milestones will appear on the chart when you add a child.
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── 7. CUSTOM GOALS ───────────────────────────────────────────── */}
        <Card data-testid="card-custom-goals">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-500" />
                Custom Goals (Optional)
              </span>
              <Button type="button" variant="outline" size="sm" onClick={addCustomGoal} data-testid="button-add-custom-goal">
                <Plus className="h-4 w-4 mr-2" /> Add Goal
              </Button>
            </CardTitle>
            <CardDescription>
              Add any major financial goal (home renovation, world trip, business launch, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {customGoals.map((goal, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 border rounded-xl bg-indigo-50/40">
                <div>
                  <Label className="text-xs font-semibold text-indigo-700 mb-1 block">Goal Name</Label>
                  <Input
                    placeholder="e.g. Home Renovation, World Trip"
                    value={goal.name}
                    onChange={(e) => updateCustomGoal(index, "name", e.target.value)}
                    data-testid={`input-goal-name-${index}`}
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-indigo-700 mb-1 block">Amount Today (₹)</Label>
                  <Input
                    type="number"
                    placeholder="500000"
                    value={goal.todaysCost || ""}
                    onChange={(e) => updateCustomGoal(index, "todaysCost", Number(e.target.value) || 0)}
                    data-testid={`input-goal-cost-${index}`}
                    className="bg-white"
                  />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs font-semibold text-indigo-700 mb-1 block">Years from Now</Label>
                    <Input
                      type="number"
                      placeholder="5"
                      min={1}
                      max={50}
                      value={goal.yearsFromNow || ""}
                      onChange={(e) => updateCustomGoal(index, "yearsFromNow", Number(e.target.value) || 1)}
                      data-testid={`input-goal-years-${index}`}
                      className="bg-white"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCustomGoal(index)}
                    data-testid={`button-remove-goal-${index}`}
                    className="mb-0.5"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {customGoals.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-sm">
                No custom goals added. Add a goal and it will appear as a 📍 milestone on your retirement projection chart.
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── 8. CURRENT ASSETS (with EPF / NPS) ───────────────────────── */}
        <Card data-testid="card-current-assets">
          <CardHeader>
            <CardTitle>Current Assets & Retirement Accounts</CardTitle>
            <CardDescription>
              Your existing savings, investments, and retirement account balances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="assetsLumpSum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Investments (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1000000"
                          data-testid="input-current-assets"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <p className="text-xs text-slate-500 mt-1">Mutual funds, FDs, stocks, etc.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assetsLumpSumReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-slate-500">Expected annual return (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="12"
                          className="h-9"
                          data-testid="input-assets-lump-sum-return"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <p className="text-xs text-slate-400 mt-1">Typically 12–14% for equity-heavy mutual funds.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="epfCorpus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        EPF Corpus (₹)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="500000"
                          data-testid="input-epf-corpus"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <p className="text-xs text-slate-500 mt-1">Check your UAN passbook for balance.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="epfReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-slate-500">Expected annual return (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="8.25"
                          className="h-9"
                          data-testid="input-epf-return"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <p className="text-xs text-slate-400 mt-1">EPFO declares 8–8.5% most years.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="npsCorpus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        NPS Corpus (₹)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="300000"
                          data-testid="input-nps-corpus"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <p className="text-xs text-slate-500 mt-1">From your CRA / NPS account statement.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="npsReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-slate-500">Expected annual return (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="10"
                          className="h-9"
                          data-testid="input-nps-return"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <p className="text-xs text-slate-400 mt-1">Varies 8–12% based on your equity allocation.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* EPF / NPS monthly contributions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <PiggyBank className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold text-sm text-emerald-900">EPF Monthly Contribution</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Optional</span>
                </div>
                <FormField
                  control={form.control}
                  name="epfMonthlyContribution"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-wrap items-center gap-3">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="3000"
                            className="w-36 bg-white"
                            data-testid="input-epf-contribution"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <span className="text-sm text-emerald-800 font-medium">₹/month</span>
                      </div>
                      <p className="text-xs text-emerald-700 mt-1">
                        Your + employer's EPF deduction. Deducted from Monthly Savings above.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <PiggyBank className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold text-sm text-emerald-900">NPS Monthly Contribution</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Optional</span>
                </div>
                <FormField
                  control={form.control}
                  name="npsMonthlyContribution"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-wrap items-center gap-3">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="5000"
                            className="w-36 bg-white"
                            data-testid="input-nps-contribution"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <span className="text-sm text-emerald-800 font-medium">₹/month</span>
                      </div>
                      <p className="text-xs text-emerald-700 mt-1">
                        Your monthly NPS deduction (80CCD(1B) gives extra ₹50,000 tax benefit). Deducted from Monthly Savings above.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── 9. MINI RETIREMENT (accumulating only) ────────────────────── */}
        {personaMode === "accumulating" && (
          <Card data-testid="card-mini-retirement">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Coffee className="h-5 w-5 text-amber-600" />
                    Mini Retirement (Optional)
                  </CardTitle>
                  <CardDescription>
                    Planning a career break or sabbatical? During this period, no new savings will be added — your portfolio will only grow through investment returns.
                  </CardDescription>
                </div>
                <Switch checked={hasMiniRetirement} onCheckedChange={setHasMiniRetirement} data-testid="toggle-mini-retirement" className="mt-1 shrink-0" />
              </div>
            </CardHeader>
            {hasMiniRetirement && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="miniRetirement.startYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={String(new Date().getFullYear() + 5)}
                            data-testid="input-mini-retirement-start"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="miniRetirement.durationMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (months)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="12"
                            min={1}
                            max={120}
                            data-testid="input-mini-retirement-duration"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* ── 11. PLANNING ASSUMPTIONS (all sliders) ────────────────────── */}
        <Card data-testid="card-assumptions">
          <CardHeader>
            <CardTitle>Planning Assumptions</CardTitle>
            <CardDescription>Adjust these to match your expectations — smart defaults applied</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="assumptions.inflationHeadline"
              render={({ field }) => (
                <FormItem>
                  <SliderField
                    label="Annual Inflation"
                    value={field.value ?? 7}
                    onChange={field.onChange}
                    min={3}
                    max={12}
                    step={0.5}
                    unit="%"
                    lowLabel="3% (optimistic)"
                    highLabel="12% (severe)"
                    hint="Historical India CPI averages 5–7%. Retirement planning typically uses 6–7%."
                    testId="input-inflation"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {personaMode === "accumulating" && (
              <FormField
                control={form.control}
                name="assumptions.returnPre"
                render={({ field }) => (
                  <FormItem>
                    <SliderField
                      label="Pre-retirement Investment Return"
                      value={field.value ?? 12}
                      onChange={field.onChange}
                      min={4}
                      max={18}
                      step={0.5}
                      unit="%"
                      lowLabel="4% (FD-only)"
                      highLabel="18% (aggressive)"
                      hint="Nifty 50 has returned ~13% CAGR over 20 years. 10–12% is a balanced assumption."
                      testId="input-pre-return"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="assumptions.returnPost"
              render={({ field }) => (
                <FormItem>
                  <SliderField
                    label="Post-retirement Investment Return"
                    value={field.value ?? 8}
                    onChange={field.onChange}
                    min={3}
                    max={12}
                    step={0.5}
                    unit="%"
                    lowLabel="3% (bonds only)"
                    highLabel="12%"
                    hint="Conservative 6–8% is recommended for post-retirement (debt-heavy allocation)."
                    testId="input-post-return"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── 12. SUBMIT ────────────────────────────────────────────────── */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="px-8"
            data-testid="button-create-plan"
          >
            {isLoading
              ? "Generating your plan…"
              : personaMode === "retired"
              ? "Show My Drawdown Projection →"
              : "Generate My Plan →"}
          </Button>
        </div>

      </form>
    </Form>
  );
}
