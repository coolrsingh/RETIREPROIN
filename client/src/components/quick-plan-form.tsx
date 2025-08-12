import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quickPlanSchema, type QuickPlan } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Trash2, Zap } from "lucide-react";

interface QuickPlanFormProps {
  onSubmit: (data: QuickPlan) => void;
  isLoading: boolean;
}

export default function QuickPlanForm({ onSubmit, isLoading }: QuickPlanFormProps) {
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
      assumptions: {
        returnPre: 12,
        returnPost: 8,
        inflationHeadline: 7
      }
    }
  });

  const addChild = () => {
    const newChild = {
      name: "",
      dob: "",
      eduTodaysCost: 0,
      marriageTodaysCost: 0
    };
    
    const updated = [...children, newChild];
    setChildren(updated);
    form.setValue("children", updated);
  };

  const removeChild = (index: number) => {
    const updated = children.filter((_, i) => i !== index);
    setChildren(updated);
    form.setValue("children", updated);
  };

  const handleSubmit = (data: QuickPlan) => {
    const cleanedData = {
      ...data,
      children
    };
    onSubmit(cleanedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Info Section */}
        <Card data-testid="card-basic-info">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Quick Plan - Basic Information
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
              <FormField
                control={form.control}
                name="monthlySavings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Savings (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="20000" 
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
            <CardDescription>Add children for education and marriage planning</CardDescription>
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
                    placeholder="Enter amount"
                    value={child.eduTodaysCost || ''}
                    onChange={(e) => {
                      const updated = [...children];
                      updated[index].eduTodaysCost = Number(e.target.value) || 0;
                      setChildren(updated);
                      form.setValue("children", updated);
                    }}
                    data-testid={`input-child-edu-cost-${index}`}
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
                No children added. This is optional for quick planning.
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
            {isLoading ? "Creating Plan..." : "Create Quick Plan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}