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
import { Plus, Trash2, Zap, Coffee, CreditCard, TrendingUp, Calculator, Lock, Target } from "lucide-react";

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

export default function QuickPlanForm({ onSubmit, isLoading, profileDefaults }: QuickPlanFormProps) {
  const [children, setChildren] = useState<any[]>([]);
  const [customGoals, setCustomGoals] = useState<{ name: string; todaysCost: number; yearsFromNow: number }[]>([]);
  const [hasMiniRetirement, setHasMiniRetirement] = useState(false);
  const [hasExistingEMI, setHasExistingEMI] = useState(false);
  const [savingsAutoMode, setSavingsAutoMode] = useState(true);

  const form = useForm<QuickPlan>({
    resolver: zodResolver(quickPlanSchema),
    defaultValues: {
      fullName: profileDefaults?.fullName || "",
      dob: profileDefaults?.dob || "",
      retirementAge: profileDefaults?.retirementAge || 60,
      spouseDob: "",
      isJointRetirement: false,
      spouseRetirementAge: 60,
      monthlyIncomeTotal: profileDefaults?.monthlyIncomeTotal || 0,
      monthlyExpenseTotal: profileDefaults?.monthlyExpenseTotal || 0,
      monthlySavings: profileDefaults?.monthlySavings || 0,
      incomeGrowthRate: profileDefaults?.incomeGrowthRate || 8,
      children: [],
      assetsLumpSum: profileDefaults?.assetsLumpSum || 0,
      assumptions: {
        returnPre: 12,
        returnPost: 8,
        inflationHeadline: 7
      }
    }
  });

  // Auto-calculate savings = income - expenses when in auto mode
  const income = form.watch("monthlyIncomeTotal");
  const expenses = form.watch("monthlyExpenseTotal");

  useEffect(() => {
    if (savingsAutoMode) {
      const computed = Math.max(0, (Number(income) || 0) - (Number(expenses) || 0));
      form.setValue("monthlySavings", computed, { shouldValidate: false });
    }
  }, [income, expenses, savingsAutoMode]);

  const addChild = () => {
    const newChild = { name: "", dob: "", eduTodaysCost: 0, marriageTodaysCost: 0 };
    const updated = [...children, newChild];
    setChildren(updated);
    form.setValue("children", updated);
  };

  const removeChild = (index: number) => {
    const updated = children.filter((_, i) => i !== index);
    setChildren(updated);
    form.setValue("children", updated);
  };

  const addCustomGoal = () => {
    setCustomGoals(prev => [...prev, { name: "", todaysCost: 0, yearsFromNow: 5 }]);
  };

  const removeCustomGoal = (index: number) => {
    setCustomGoals(prev => prev.filter((_, i) => i !== index));
  };

  const updateCustomGoal = (index: number, field: string, value: string | number) => {
    setCustomGoals(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = (data: QuickPlan) => {
    const cleanedData = {
      ...data,
      children,
      customGoals: customGoals.filter(g => g.name.trim() && g.todaysCost > 0 && g.yearsFromNow > 0),
      miniRetirement: hasMiniRetirement ? data.miniRetirement : undefined,
      existingEMI: hasExistingEMI ? data.existingEMI : undefined,
    };
    onSubmit(cleanedData);
  };

  const computedSavings = Math.max(0, (Number(income) || 0) - (Number(expenses) || 0));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Info Section */}
        <Card data-testid="card-basic-info">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Basic Information
            </CardTitle>
            <CardDescription>Get started with the essentials for your retirement planning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="retirementAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retirement Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="60"
                        data-testid="input-retirement-age"
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
        </Card>

        {/* Financial Overview - Quick Plan */}
        <Card data-testid="card-financial-overview">
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>Your current income, expenses, and how much you invest each month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Income + Expenses row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monthlyIncomeTotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Income (₹)</FormLabel>
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

            {/* Monthly Savings — auto-calculated with override option */}
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
                    <><Lock className="h-3 w-3" />Enter custom amount</>
                  ) : (
                    <><Calculator className="h-3 w-3" />Auto-calculate</>
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
                    Calculated as Income − Expenses. Click "Enter custom amount" to override.
                    {Number(income) > 0 && Number(expenses) > 0 && (
                      <span className="ml-1 font-medium">
                        ({Math.round((computedSavings / (Number(income) || 1)) * 100)}% savings rate)
                      </span>
                    )}
                  </p>
                  {/* hidden field keeps value in sync */}
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

            {/* Salary growth rate assumption */}
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                <span className="font-semibold text-sm text-amber-900">Salary Growth Assumption</span>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Optional</span>
              </div>
              <FormField
                control={form.control}
                name="incomeGrowthRate"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1" data-testid="salary-growth-row">
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          min={0}
                          max={30}
                          className="w-28 bg-white"
                          data-testid="input-income-growth-rate"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <span className="text-sm font-medium text-amber-800">% per year</span>
                    </div>
                    <p className="text-xs text-amber-600 mt-1">Average Indian salary hike is 8–10% / year</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Children Section - Simplified for Quick Plan */}
        <Card data-testid="card-children">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Children (Optional)</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addChild}
                data-testid="button-add-child"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Child
              </Button>
            </CardTitle>
            <CardDescription>Add children to automatically mark education and marriage milestones on your projection chart</CardDescription>
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

        {/* Custom Goals */}
        <Card data-testid="card-custom-goals">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-500" />
                Custom Goals (Optional)
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomGoal}
                data-testid="button-add-custom-goal"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </CardTitle>
            <CardDescription>
              Add any major financial goal (home renovation, world trip, business launch, etc.) — it will appear as a milestone on your projection chart and be factored into your plan
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
                    onChange={e => updateCustomGoal(index, "name", e.target.value)}
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
                    onChange={e => updateCustomGoal(index, "todaysCost", Number(e.target.value) || 0)}
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
                      onChange={e => updateCustomGoal(index, "yearsFromNow", Number(e.target.value) || 1)}
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

        {/* Current Assets */}
        <Card data-testid="card-current-assets">
          <CardHeader>
            <CardTitle>Current Assets</CardTitle>
            <CardDescription>Your existing savings and investments</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="assetsLumpSum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Current Assets (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1000000"
                      data-testid="input-current-assets"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Mini Retirement Section */}
        <Card data-testid="card-mini-retirement">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-amber-600" />
                  Mini Retirement (Optional)
                </CardTitle>
                <CardDescription>Planning a career break or sabbatical? During this period, no new savings will be added — your portfolio will only grow through investment returns.</CardDescription>
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
              <p className="text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded p-2">
                During a mini retirement, your investments continue to grow but no monthly savings are added to the corpus.
              </p>
            </CardContent>
          )}
        </Card>

        {/* Existing EMI Section */}
        <Card data-testid="card-existing-emi">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-rose-600" />
                  Existing EMI (Optional)
                </CardTitle>
                <CardDescription>Do you have an ongoing loan? This EMI will reduce your monthly savings capacity until the tenure ends.</CardDescription>
              </div>
              <Switch checked={hasExistingEMI} onCheckedChange={setHasExistingEMI} data-testid="toggle-existing-emi" className="mt-1 shrink-0" />
            </div>
          </CardHeader>
          {hasExistingEMI && (
            <CardContent className="space-y-4">
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
              <p className="text-xs text-slate-500 bg-rose-50 border border-rose-200 rounded p-2">
                The EMI will be deducted from your monthly surplus for the specified tenure and then automatically stops.
              </p>
            </CardContent>
          )}
        </Card>

        {/* Basic Assumptions */}
        <Card data-testid="card-assumptions">
          <CardHeader>
            <CardTitle>Planning Assumptions</CardTitle>
            <CardDescription>Basic financial projections (smart defaults applied)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="assumptions.inflationHeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Inflation (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="7"
                        data-testid="input-inflation"
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
                name="assumptions.returnPre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pre-retirement Return (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="12"
                        data-testid="input-pre-return"
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
                name="assumptions.returnPost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post-retirement Return (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="8"
                        data-testid="input-post-return"
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
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="px-8"
            data-testid="button-create-plan"
          >
            {isLoading ? "Generating your plan…" : "Generate My Plan →"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
