import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quickPlanSchema, type QuickPlan } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ChartLine, ArrowLeft, Plus, Trash2, Zap } from "lucide-react";
import { Link } from "wouter";

export default function PlanForm() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [children, setChildren] = useState<any[]>([]);

  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const mode = searchParams.get('mode') || 'quick';

  const form = useForm<QuickPlan>({
    resolver: zodResolver(quickPlanSchema),
    defaultValues: {
      fullName: "",
      dob: "",
      retirementAge: 60,
      spouseDob: "",
      monthlyExpenseTotal: 0,
      children: [],
      assetsLumpSum: 0,
      assumptions: {
        returnPre: 10,
        returnPost: 7,
        inflationHeadline: 6,
      },
      miniRetirement: {
        start: undefined,
        months: 12,
        incomeDuring: 0,
        expenseDeltaPct: 0,
      },
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async (data: QuickPlan) => {
      return await apiRequest("POST", "/api/plan/quick", data);
    },
    onSuccess: async (response) => {
      const scenario = await response.json();
      toast({
        title: "Plan Created Successfully",
        description: "Your retirement plan has been created and calculated.",
      });
      navigate(`/plan/${scenario.id}`);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const addChild = () => {
    setChildren([...children, { name: "", dob: "", eduTodaysCost: 0, marriageTodaysCost: 0 }]);
  };

  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChild = (index: number, field: string, value: any) => {
    const updatedChildren = children.map((child, i) => 
      i === index ? { ...child, [field]: value } : child
    );
    setChildren(updatedChildren);
  };

  const onSubmit = (data: QuickPlan) => {
    const formData = {
      ...data,
      children: children.filter(child => child.name), // Only include children with names
    };
    createPlanMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <ChartLine className="text-primary-600 h-8 w-8" />
                <span className="text-xl font-bold text-slate-800">RetirePro</span>
              </div>
              <nav className="flex items-center space-x-6">
                <Link href="/" className="text-slate-600 hover:text-primary-600 font-medium">
                  <a data-testid="link-dashboard">Dashboard</a>
                </Link>
                <Badge variant={mode === 'quick' ? 'default' : 'secondary'}>
                  {mode === 'quick' ? 'Quick Plan' : 'Detailed Plan'}
                </Badge>
              </nav>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
              data-testid="button-logout"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="button-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <Zap className="mr-3 h-8 w-8 text-primary-600" />
            Quick Retirement Plan
          </h1>
          <p className="text-slate-600 mt-2">Get your retirement plan ready in under 60 seconds with smart defaults</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic details about you and your family</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} data-testid="input-fullname" />
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
                        <FormLabel>Date of Birth *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-dob" />
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
                        <FormLabel>Planned Retirement Age *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="50" 
                            max="75"
                            placeholder="60"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-retirement-age"
                          />
                        </FormControl>
                        <FormDescription>Typical range: 55-65 years</FormDescription>
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
                          <Input type="date" {...field} data-testid="input-spouse-dob" />
                        </FormControl>
                        <FormDescription>Optional - for joint planning</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Financial Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Your current financial situation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="monthlyExpenseTotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Monthly Expenses *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-slate-500">₹</span>
                            <Input 
                              type="number" 
                              min="0"
                              placeholder="50,000"
                              className="pl-8"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-monthly-expenses"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Include all household expenses</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="assetsLumpSum"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Assets Value</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-slate-500">₹</span>
                            <Input 
                              type="number" 
                              min="0"
                              placeholder="10,00,000"
                              className="pl-8"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-assets"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Investments, savings, property value</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Children Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Children (Optional)</CardTitle>
                    <CardDescription>Add children for education and marriage planning</CardDescription>
                  </div>
                  <Button type="button" variant="outline" onClick={addChild} data-testid="button-add-child">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Child
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {children.map((child, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Child {index + 1}</h4>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeChild(index)}
                        data-testid={`button-remove-child-${index}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Child's Name</Label>
                        <Input 
                          placeholder="Child's name" 
                          value={child.name}
                          onChange={(e) => updateChild(index, 'name', e.target.value)}
                          data-testid={`input-child-name-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Education Cost (Today's Value)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-slate-500">₹</span>
                          <Input 
                            type="number" 
                            min="0"
                            placeholder="15,00,000"
                            className="pl-8"
                            value={child.eduTodaysCost}
                            onChange={(e) => updateChild(index, 'eduTodaysCost', parseInt(e.target.value) || 0)}
                            data-testid={`input-child-education-${index}`}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Marriage Cost (Today's Value)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-slate-500">₹</span>
                          <Input 
                            type="number" 
                            min="0"
                            placeholder="10,00,000"
                            className="pl-8"
                            value={child.marriageTodaysCost}
                            onChange={(e) => updateChild(index, 'marriageTodaysCost', parseInt(e.target.value) || 0)}
                            data-testid={`input-child-marriage-${index}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {children.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <p>No children added yet. Click "Add Child" to include children in your planning.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Investment Assumptions */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Assumptions (Optional)</CardTitle>
                <CardDescription>Leave blank to use our research-backed defaults</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="assumptions.returnPre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Return (Pre-retirement)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              min="0" 
                              max="30" 
                              step="0.5"
                              placeholder="10.0"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              data-testid="input-return-pre"
                            />
                            <span className="absolute right-3 top-2 text-slate-500">%</span>
                          </div>
                        </FormControl>
                        <FormDescription>Default: 10% (equity-heavy portfolio)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="assumptions.returnPost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Return (Post-retirement)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              min="0" 
                              max="30" 
                              step="0.5"
                              placeholder="7.0"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              data-testid="input-return-post"
                            />
                            <span className="absolute right-3 top-2 text-slate-500">%</span>
                          </div>
                        </FormControl>
                        <FormDescription>Default: 7% (conservative portfolio)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="assumptions.inflationHeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>General Inflation Rate</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              min="0" 
                              max="20" 
                              step="0.5"
                              placeholder="6.0"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              data-testid="input-inflation"
                            />
                            <span className="absolute right-3 top-2 text-slate-500">%</span>
                          </div>
                        </FormControl>
                        <FormDescription>Default: 6% (historical average)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-between items-center">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate("/")}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createPlanMutation.isPending}
                className="px-8"
                data-testid="button-create-plan"
              >
                {createPlanMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Plan...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Create My Plan
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
