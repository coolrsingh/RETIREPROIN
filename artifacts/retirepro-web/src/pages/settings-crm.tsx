import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ChartLine, ArrowLeft, Save, Shield } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import { Link, useLocation } from "wouter";

const crmDefaultsSchema = z.object({
  inflationHeadline: z.number().min(0).max(20),
  inflationEdu: z.number().min(0).max(20),
  inflationHealth: z.number().min(0).max(20),
  returnPre: z.number().min(0).max(30),
  returnPost: z.number().min(0).max(30),
  lifeExpectancy: z.number().min(60).max(100),
});

type CrmDefaults = z.infer<typeof crmDefaultsSchema>;

export default function SettingsCrm() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: crmDefaults, isLoading: defaultsLoading } = useQuery({
    queryKey: ["/api/crm/defaults"],
    enabled: isAuthenticated,
  });

  const form = useForm<CrmDefaults>({
    resolver: zodResolver(crmDefaultsSchema),
    defaultValues: {
      inflationHeadline: 6.0,
      inflationEdu: 8.0,
      inflationHealth: 7.0,
      returnPre: 10.0,
      returnPost: 7.0,
      lifeExpectancy: 85,
    },
  });

  const updateDefaultsMutation = useMutation({
    mutationFn: async (data: CrmDefaults) => {
      return await apiRequest("PUT", "/api/crm/defaults", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/defaults"] });
      toast({
        title: "Settings Updated",
        description: "CRM defaults have been updated successfully.",
      });
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
        description: "Failed to update settings. Please try again.",
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

  useEffect(() => {
    if (crmDefaults) {
      form.reset({
        inflationHeadline: parseFloat(crmDefaults.inflationHeadline || '6.0'),
        inflationEdu: parseFloat(crmDefaults.inflationEdu || '8.0'),
        inflationHealth: parseFloat(crmDefaults.inflationHealth || '7.0'),
        returnPre: parseFloat(crmDefaults.returnPre || '10.0'),
        returnPost: parseFloat(crmDefaults.returnPost || '7.0'),
        lifeExpectancy: parseInt(crmDefaults.lifeExpectancy || '85'),
        taxRegime: crmDefaults.taxRegime || 'new',
      });
    }
  }, [crmDefaults, form]);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [user, navigate, toast]);

  const onSubmit = (data: CrmDefaults) => {
    updateDefaultsMutation.mutate(data);
  };

  if (isLoading || defaultsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F4F9FF] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F4F9FF] to-white flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
            <p className="text-slate-600 mb-4">You need admin privileges to access this page.</p>
            <Link href="/">
              <Button data-testid="button-back-home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4F9FF] to-white">
      {/* Header */}
      <header className="bg-white/85 backdrop-blur-xl shadow-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <BrandLogo textClassName="text-slate-800" />
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-slate-600 hover:text-primary-600 font-medium">
                  <a data-testid="link-dashboard">Dashboard</a>
                </Link>
                <span className="text-primary-600 font-medium">Settings</span>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-600" data-testid="text-username">
                {user?.firstName || user?.email || 'Admin'}
              </span>
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
            <Shield className="mr-3 h-8 w-8 text-primary-600" />
            CRM Settings
          </h1>
          <p className="text-slate-600 mt-2">Manage default assumptions used across all retirement plans</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Inflation Assumptions */}
            <Card>
              <CardHeader>
                <CardTitle>Inflation Assumptions</CardTitle>
                <CardDescription>Default inflation rates used for different categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="inflationHeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>General Inflation Rate</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              min="0" 
                              max="20" 
                              step="0.1"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-inflation-headline"
                            />
                            <span className="absolute right-3 top-2 text-slate-500">%</span>
                          </div>
                        </FormControl>
                        <FormDescription>Used for general expenses and cost of living</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="inflationEdu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education Inflation Rate</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              min="0" 
                              max="20" 
                              step="0.1"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-inflation-education"
                            />
                            <span className="absolute right-3 top-2 text-slate-500">%</span>
                          </div>
                        </FormControl>
                        <FormDescription>Used for children's education costs</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="inflationHealth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Healthcare Inflation Rate</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              min="0" 
                              max="20" 
                              step="0.1"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-inflation-health"
                            />
                            <span className="absolute right-3 top-2 text-slate-500">%</span>
                          </div>
                        </FormControl>
                        <FormDescription>Used for healthcare and medical expenses</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Return Assumptions */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Return Assumptions</CardTitle>
                <CardDescription>Default expected returns for different life phases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="returnPre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pre-Retirement Return</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              min="0" 
                              max="30" 
                              step="0.1"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-return-pre"
                            />
                            <span className="absolute right-3 top-2 text-slate-500">%</span>
                          </div>
                        </FormControl>
                        <FormDescription>Expected return during accumulation phase (equity-heavy)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="returnPost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Post-Retirement Return</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              min="0" 
                              max="30" 
                              step="0.1"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-return-post"
                            />
                            <span className="absolute right-3 top-2 text-slate-500">%</span>
                          </div>
                        </FormControl>
                        <FormDescription>Expected return during withdrawal phase (conservative)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Other Assumptions */}
            <Card>
              <CardHeader>
                <CardTitle>Other Planning Assumptions</CardTitle>
                <CardDescription>General assumptions for retirement planning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="lifeExpectancy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Life Expectancy</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              min="60" 
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-life-expectancy"
                            />
                            <span className="absolute right-3 top-2 text-slate-500">years</span>
                          </div>
                        </FormControl>
                        <FormDescription>Expected age for retirement planning calculations</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="taxRegime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Tax Regime</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-tax-regime">
                              <SelectValue placeholder="Select tax regime" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="old">Old Tax Regime</SelectItem>
                            <SelectItem value="new">New Tax Regime</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Default tax regime for new plans</FormDescription>
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
                onClick={() => form.reset()}
                data-testid="button-reset"
              >
                Reset to Defaults
              </Button>
              <Button 
                type="submit" 
                disabled={updateDefaultsMutation.isPending}
                className="px-8"
                data-testid="button-save"
              >
                {updateDefaultsMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
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
