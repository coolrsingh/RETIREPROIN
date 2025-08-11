import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quickPlanSchema, type QuickPlan } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Calculator, Heart, Building, Coins, Banknote } from "lucide-react";

interface EnhancedPlanFormProps {
  onSubmit: (data: QuickPlan) => void;
  isLoading: boolean;
  mode: 'quick' | 'detailed';
}

export default function EnhancedPlanForm({ onSubmit, isLoading, mode }: EnhancedPlanFormProps) {
  const [shortTermGoals, setShortTermGoals] = useState<any[]>([]);
  const [existingLoans, setExistingLoans] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);

  const form = useForm<QuickPlan>({
    resolver: zodResolver(quickPlanSchema),
    defaultValues: {
      fullName: "",
      dob: "",
      retirementAge: 60,
      spouseDob: "",
      isJointRetirement: false,
      spouseRetirementAge: 60,
      monthlyIncomeTotal: 0,
      monthlyExpenseTotal: 0,
      monthlySavings: 0,
      incomeGrowthRate: 8,
      children: [],
      assetsLumpSum: 0,
      assetAllocation: {
        equity: 50,
        debt: 30,
        realEstate: 15,
        gold: 5,
        cash: 0
      },
      expectedReturns: {
        equity: 14,
        debt: 8,
        realEstate: 10,
        gold: 6,
        cash: 4
      },
      shortTermGoals: [],
      existingLoans: [],
      assumptions: {
        returnPre: 12,
        returnPost: 8,
        inflationHeadline: 7,
        equityAllocation: 70,
        debtAllocation: 30,
        equityReturn: 14,
        debtReturn: 8
      }
    },
  });

  const isJointRetirement = form.watch("isJointRetirement");
  const currentAssetAllocation = form.watch("assetAllocation");

  const addShortTermGoal = () => {
    const newGoal = {
      name: "",
      type: "other" as const,
      targetMonth: new Date().getMonth() + 1,
      targetYear: new Date().getFullYear() + 1,
      estimatedCost: 0
    };
    const updatedGoals = [...shortTermGoals, newGoal];
    setShortTermGoals(updatedGoals);
    form.setValue("shortTermGoals", updatedGoals);
  };

  const removeShortTermGoal = (index: number) => {
    const updatedGoals = shortTermGoals.filter((_, i) => i !== index);
    setShortTermGoals(updatedGoals);
    form.setValue("shortTermGoals", updatedGoals);
  };

  const addExistingLoan = () => {
    const newLoan = {
      name: "",
      type: "personal_loan" as const,
      principalLeft: 0,
      interestRate: 10,
      tenureYears: 5,
      tenureMonths: 0,
      startDate: new Date().toISOString().split('T')[0],
      emi: 0
    };
    const updatedLoans = [...existingLoans, newLoan];
    setExistingLoans(updatedLoans);
    form.setValue("existingLoans", updatedLoans);
  };

  const removeExistingLoan = (index: number) => {
    const updatedLoans = existingLoans.filter((_, i) => i !== index);
    setExistingLoans(updatedLoans);
    form.setValue("existingLoans", updatedLoans);
  };

  const addChild = () => {
    const newChild = {
      name: "",
      dob: "",
      eduTodaysCost: 2000000,
      marriageTodaysCost: 2000000
    };
    const updatedChildren = [...children, newChild];
    setChildren(updatedChildren);
    form.setValue("children", updatedChildren);
  };

  const removeChild = (index: number) => {
    const updatedChildren = children.filter((_, i) => i !== index);
    setChildren(updatedChildren);
    form.setValue("children", updatedChildren);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card data-testid="card-basic-info">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Your personal details and retirement timeline</CardDescription>
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

            {/* Joint Retirement */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isJointRetirement"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-joint-retirement"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Joint Retirement Planning with Spouse
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {isJointRetirement && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
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
                  <FormField
                    control={form.control}
                    name="spouseRetirementAge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spouse Retirement Age</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="60" 
                            data-testid="input-spouse-retirement-age"
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
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card data-testid="card-financial-info">
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
            <CardDescription>Your current income, expenses, and savings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="monthlyIncomeTotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Income (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="100000" 
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
                        placeholder="70000" 
                        data-testid="input-monthly-expenses"
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
                name="monthlySavings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Savings (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="30000" 
                        data-testid="input-monthly-savings"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="incomeGrowthRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Income Growth Rate (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="8" 
                      data-testid="input-income-growth"
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

        {mode === 'detailed' && (
          <>
            {/* Asset Allocation */}
            <Card data-testid="card-asset-allocation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Asset Allocation & Expected Returns
                </CardTitle>
                <CardDescription>Define your investment mix and expected returns by asset class</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      Equity (%)
                    </Label>
                    <FormField
                      control={form.control}
                      name="assetAllocation.equity"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="50" 
                              data-testid="input-equity-allocation"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expectedReturns.equity"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="14" 
                              data-testid="input-equity-return"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <Label className="text-xs text-gray-500">Expected Return (%)</Label>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      Debt (%)
                    </Label>
                    <FormField
                      control={form.control}
                      name="assetAllocation.debt"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="30" 
                              data-testid="input-debt-allocation"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expectedReturns.debt"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="8" 
                              data-testid="input-debt-return"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <Label className="text-xs text-gray-500">Expected Return (%)</Label>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      Real Estate (%)
                    </Label>
                    <FormField
                      control={form.control}
                      name="assetAllocation.realEstate"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="15" 
                              data-testid="input-realestate-allocation"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expectedReturns.realEstate"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="10" 
                              data-testid="input-realestate-return"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <Label className="text-xs text-gray-500">Expected Return (%)</Label>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Coins className="w-3 h-3 text-yellow-500" />
                      Gold (%)
                    </Label>
                    <FormField
                      control={form.control}
                      name="assetAllocation.gold"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="5" 
                              data-testid="input-gold-allocation"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expectedReturns.gold"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="6" 
                              data-testid="input-gold-return"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <Label className="text-xs text-gray-500">Expected Return (%)</Label>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Banknote className="w-3 h-3 text-gray-500" />
                      Cash (%)
                    </Label>
                    <FormField
                      control={form.control}
                      name="assetAllocation.cash"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              data-testid="input-cash-allocation"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expectedReturns.cash"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="4" 
                              data-testid="input-cash-return"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <Label className="text-xs text-gray-500">Expected Return (%)</Label>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  Total allocation: {(currentAssetAllocation?.equity || 0) + (currentAssetAllocation?.debt || 0) + (currentAssetAllocation?.realEstate || 0) + (currentAssetAllocation?.gold || 0) + (currentAssetAllocation?.cash || 0)}%
                </div>
              </CardContent>
            </Card>

            {/* Short Term Goals */}
            <Card data-testid="card-short-term-goals">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Short Term Goals</span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addShortTermGoal}
                    data-testid="button-add-goal"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Goal
                  </Button>
                </CardTitle>
                <CardDescription>Car, bike, vacation, or other short-term financial goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {shortTermGoals.map((goal, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label>Goal Name</Label>
                      <Input 
                        placeholder="e.g., New Car"
                        value={goal.name}
                        onChange={(e) => {
                          const updated = [...shortTermGoals];
                          updated[index].name = e.target.value;
                          setShortTermGoals(updated);
                          form.setValue("shortTermGoals", updated);
                        }}
                        data-testid={`input-goal-name-${index}`}
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select 
                        value={goal.type} 
                        onValueChange={(value) => {
                          const updated = [...shortTermGoals];
                          updated[index].type = value;
                          setShortTermGoals(updated);
                          form.setValue("shortTermGoals", updated);
                        }}
                      >
                        <SelectTrigger data-testid={`select-goal-type-${index}`}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="car">Car</SelectItem>
                          <SelectItem value="bike">Bike</SelectItem>
                          <SelectItem value="tour">Tour/Vacation</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Target Month</Label>
                      <Input 
                        type="number" 
                        min="1" 
                        max="12"
                        value={goal.targetMonth}
                        onChange={(e) => {
                          const updated = [...shortTermGoals];
                          updated[index].targetMonth = Number(e.target.value);
                          setShortTermGoals(updated);
                          form.setValue("shortTermGoals", updated);
                        }}
                        data-testid={`input-goal-month-${index}`}
                      />
                    </div>
                    <div>
                      <Label>Target Year</Label>
                      <Input 
                        type="number" 
                        min="2024"
                        value={goal.targetYear}
                        onChange={(e) => {
                          const updated = [...shortTermGoals];
                          updated[index].targetYear = Number(e.target.value);
                          setShortTermGoals(updated);
                          form.setValue("shortTermGoals", updated);
                        }}
                        data-testid={`input-goal-year-${index}`}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label>Cost (₹)</Label>
                        <Input 
                          type="number"
                          value={goal.estimatedCost}
                          onChange={(e) => {
                            const updated = [...shortTermGoals];
                            updated[index].estimatedCost = Number(e.target.value);
                            setShortTermGoals(updated);
                            form.setValue("shortTermGoals", updated);
                          }}
                          data-testid={`input-goal-cost-${index}`}
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeShortTermGoal(index)}
                        data-testid={`button-remove-goal-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {shortTermGoals.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No short-term goals added yet. Click "Add Goal" to get started.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Existing Loans */}
            <Card data-testid="card-existing-loans">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Existing Loans</span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addExistingLoan}
                    data-testid="button-add-loan"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Loan
                  </Button>
                </CardTitle>
                <CardDescription>Home loans, personal loans, and other existing liabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {existingLoans.map((loan, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label>Loan Name</Label>
                      <Input 
                        placeholder="e.g., Home Loan"
                        value={loan.name}
                        onChange={(e) => {
                          const updated = [...existingLoans];
                          updated[index].name = e.target.value;
                          setExistingLoans(updated);
                          form.setValue("existingLoans", updated);
                        }}
                        data-testid={`input-loan-name-${index}`}
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select 
                        value={loan.type} 
                        onValueChange={(value) => {
                          const updated = [...existingLoans];
                          updated[index].type = value;
                          setExistingLoans(updated);
                          form.setValue("existingLoans", updated);
                        }}
                      >
                        <SelectTrigger data-testid={`select-loan-type-${index}`}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home_loan">Home Loan</SelectItem>
                          <SelectItem value="personal_loan">Personal Loan</SelectItem>
                          <SelectItem value="car_loan">Car Loan</SelectItem>
                          <SelectItem value="education_loan">Education Loan</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Principal Left (₹)</Label>
                      <Input 
                        type="number"
                        value={loan.principalLeft}
                        onChange={(e) => {
                          const updated = [...existingLoans];
                          updated[index].principalLeft = Number(e.target.value);
                          setExistingLoans(updated);
                          form.setValue("existingLoans", updated);
                        }}
                        data-testid={`input-loan-principal-${index}`}
                      />
                    </div>
                    <div>
                      <Label>Interest Rate (%)</Label>
                      <Input 
                        type="number"
                        step="0.1"
                        value={loan.interestRate}
                        onChange={(e) => {
                          const updated = [...existingLoans];
                          updated[index].interestRate = Number(e.target.value);
                          setExistingLoans(updated);
                          form.setValue("existingLoans", updated);
                        }}
                        data-testid={`input-loan-rate-${index}`}
                      />
                    </div>
                    <div>
                      <Label>Tenure (Years)</Label>
                      <Input 
                        type="number"
                        value={loan.tenureYears}
                        onChange={(e) => {
                          const updated = [...existingLoans];
                          updated[index].tenureYears = Number(e.target.value);
                          setExistingLoans(updated);
                          form.setValue("existingLoans", updated);
                        }}
                        data-testid={`input-loan-years-${index}`}
                      />
                    </div>
                    <div>
                      <Label>Tenure (Months)</Label>
                      <Input 
                        type="number"
                        min="0"
                        max="11"
                        value={loan.tenureMonths}
                        onChange={(e) => {
                          const updated = [...existingLoans];
                          updated[index].tenureMonths = Number(e.target.value);
                          setExistingLoans(updated);
                          form.setValue("existingLoans", updated);
                        }}
                        data-testid={`input-loan-months-${index}`}
                      />
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input 
                        type="date"
                        value={loan.startDate}
                        onChange={(e) => {
                          const updated = [...existingLoans];
                          updated[index].startDate = e.target.value;
                          setExistingLoans(updated);
                          form.setValue("existingLoans", updated);
                        }}
                        data-testid={`input-loan-start-${index}`}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label>EMI (₹)</Label>
                        <Input 
                          type="number"
                          value={loan.emi}
                          onChange={(e) => {
                            const updated = [...existingLoans];
                            updated[index].emi = Number(e.target.value);
                            setExistingLoans(updated);
                            form.setValue("existingLoans", updated);
                          }}
                          data-testid={`input-loan-emi-${index}`}
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeExistingLoan(index)}
                        data-testid={`button-remove-loan-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {existingLoans.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No existing loans added. Click "Add Loan" if you have any current liabilities.
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Children Section */}
        <Card data-testid="card-children">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Children</span>
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
            <CardDescription>Education and marriage expenses for your children</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {children.map((child, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                <div>
                  <Label>Child Name</Label>
                  <Input 
                    placeholder="Child's name"
                    value={child.name}
                    onChange={(e) => {
                      const updated = [...children];
                      updated[index].name = e.target.value;
                      setChildren(updated);
                      form.setValue("children", updated);
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
                      form.setValue("children", updated);
                    }}
                    data-testid={`input-child-dob-${index}`}
                  />
                </div>
                <div>
                  <Label>Education Cost Today (₹)</Label>
                  <Input 
                    type="number"
                    value={child.eduTodaysCost}
                    onChange={(e) => {
                      const updated = [...children];
                      updated[index].eduTodaysCost = Number(e.target.value);
                      setChildren(updated);
                      form.setValue("children", updated);
                    }}
                    data-testid={`input-child-edu-cost-${index}`}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label>Marriage Cost Today (₹)</Label>
                    <Input 
                      type="number"
                      value={child.marriageTodaysCost}
                      onChange={(e) => {
                        const updated = [...children];
                        updated[index].marriageTodaysCost = Number(e.target.value);
                        setChildren(updated);
                        form.setValue("children", updated);
                      }}
                      data-testid={`input-child-marriage-cost-${index}`}
                    />
                  </div>
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
                No children added. Click "Add Child" if you want to plan for their education and marriage expenses.
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

        {/* Assumptions */}
        <Card data-testid="card-assumptions">
          <CardHeader>
            <CardTitle>Planning Assumptions</CardTitle>
            <CardDescription>Financial projections and inflation assumptions</CardDescription>
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

            {mode === 'detailed' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="assumptions.equityAllocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equity Allocation (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="70" 
                          data-testid="input-equity-allocation-assumption"
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
                  name="assumptions.debtAllocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debt Allocation (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="30" 
                          data-testid="input-debt-allocation-assumption"
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
                  name="assumptions.equityReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equity Return (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="14" 
                          data-testid="input-equity-return-assumption"
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
                  name="assumptions.debtReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debt Return (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="8" 
                          data-testid="input-debt-return-assumption"
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
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="px-8"
            data-testid="button-create-plan"
          >
            {isLoading ? "Creating Plan..." : `Create ${mode === 'quick' ? 'Quick' : 'Detailed'} Plan`}
          </Button>
        </div>
      </form>
    </Form>
  );
}