import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useGetCrmDefaults, getGetCrmDefaultsQueryKey } from "@workspace/api-client-react";
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
import { ArrowLeft, Save, Shield } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import { Link, useLocation } from "wouter";

const crmDefaultsSchema = z.object({
  inflationHeadline: z.number().min(0).max(20),
  inflationEdu: z.number().min(0).max(20),
  inflationHealth: z.number().min(0).max(20),
  returnPre: z.number().min(0).max(30),
  returnPost: z.number().min(0).max(30),
  lifeExpectancy: z.number().min(60).max(100),
  taxRegime: z.enum(["old", "new"]).default("new"),
});

type CrmDefaults = z.infer<typeof crmDefaultsSchema>;

export default function SettingsCrm() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: crmDefaults, isLoading: defaultsLoading } = useGetCrmDefaults({
    query: { queryKey: getGetCrmDefaultsQueryKey(), enabled: isAuthenticated },
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
        lifeExpectancy: crmDefaults.lifeExpectancy ?? 85,
        taxRegime: crmDefaults.taxRegime || 'new',
      });
    }
  }, [crmDefaults, form]);

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--ivory)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "var(--saffron)" }}></div>
          <p style={{ color: "var(--slate-mid)" }}>Loading settings…</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--ivory)" }}>
        <Card className="w-full max-w-md mx-4 border-0 shadow-lg" style={{ background: "white" }}>
          <CardContent className="pt-6 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4" style={{ color: "var(--orange)" }} />
            <h1 className="text-2xl font-serif font-bold mb-2" style={{ color: "var(--ink)" }}>Access Denied</h1>
            <p className="mb-4" style={{ color: "var(--slate-mid)" }}>You need admin privileges to access this page.</p>
            <Link href="/">
              <Button
                data-testid="button-back-home"
                style={{ background: "var(--saffron)", borderColor: "transparent" }}
                className="text-white hover:opacity-90"
              >
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
    <div className="min-h-screen" style={{ background: "var(--ivory)" }}>
      {/* Header */}
      <header
        className="backdrop-blur-xl shadow-sm sticky top-0 z-50"
        style={{ background: "rgba(251,248,242,0.90)", borderBottom: "1px solid rgba(232,148,10,0.18)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <BrandLogo textClassName="text-slate-800" />
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="font-medium hover:opacity-80" style={{ color: "var(--slate-mid)" }}>
                  <a data-testid="link-dashboard">Dashboard</a>
                </Link>
                <span className="font-semibold" style={{ color: "var(--saffron)" }}>Settings</span>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span style={{ color: "var(--slate-mid)" }} data-testid="text-username">
                {user?.firstName || user?.email || 'Admin'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                data-testid="button-logout"
                className="hover:bg-amber-50"
                style={{ color: "var(--slate-mid)" }}
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
              <Button
                variant="outline"
                size="sm"
                data-testid="button-back"
                className="hover:bg-amber-50"
                style={{ borderColor: "rgba(232,148,10,0.35)", color: "var(--saffron)" }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-serif font-bold flex items-center" style={{ color: "var(--ink)" }}>
            <Shield className="mr-3 h-8 w-8" style={{ color: "var(--saffron)" }} />
            CRM Settings
          </h1>
          <p className="mt-2" style={{ color: "var(--slate-mid)" }}>Manage default assumptions used across all retirement plans</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Inflation Assumptions */}
            <Card className="border-0 shadow-sm" style={{ background: "white" }}>
              <CardHeader className="pb-4" style={{ borderBottom: "1px solid rgba(232,148,10,0.12)" }}>
                <CardTitle className="font-serif text-lg" style={{ color: "var(--ink)" }}>Inflation Assumptions</CardTitle>
                <CardDescription style={{ color: "var(--slate-mid)" }}>Default inflation rates used for different categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="inflationHeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: "var(--ink)" }}>General Inflation Rate</FormLabel>
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
                              className="focus-visible:ring-amber-400"
                            />
                            <span className="absolute right-3 top-2 text-sm" style={{ color: "var(--slate-mid)" }}>%</span>
                          </div>
                        </FormControl>
                        <FormDescription style={{ color: "var(--slate-mid)" }}>Used for general expenses and cost of living</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inflationEdu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: "var(--ink)" }}>Education Inflation Rate</FormLabel>
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
                              className="focus-visible:ring-amber-400"
                            />
                            <span className="absolute right-3 top-2 text-sm" style={{ color: "var(--slate-mid)" }}>%</span>
                          </div>
                        </FormControl>
                        <FormDescription style={{ color: "var(--slate-mid)" }}>Used for children's education costs</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inflationHealth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: "var(--ink)" }}>Healthcare Inflation Rate</FormLabel>
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
                              className="focus-visible:ring-amber-400"
                            />
                            <span className="absolute right-3 top-2 text-sm" style={{ color: "var(--slate-mid)" }}>%</span>
                          </div>
                        </FormControl>
                        <FormDescription style={{ color: "var(--slate-mid)" }}>Used for healthcare and medical expenses</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Return Assumptions */}
            <Card className="border-0 shadow-sm" style={{ background: "white" }}>
              <CardHeader className="pb-4" style={{ borderBottom: "1px solid rgba(232,148,10,0.12)" }}>
                <CardTitle className="font-serif text-lg" style={{ color: "var(--ink)" }}>Investment Return Assumptions</CardTitle>
                <CardDescription style={{ color: "var(--slate-mid)" }}>Default expected returns for different life phases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="returnPre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: "var(--ink)" }}>Pre-Retirement Return</FormLabel>
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
                              className="focus-visible:ring-amber-400"
                            />
                            <span className="absolute right-3 top-2 text-sm" style={{ color: "var(--slate-mid)" }}>%</span>
                          </div>
                        </FormControl>
                        <FormDescription style={{ color: "var(--slate-mid)" }}>Expected return during accumulation phase (equity-heavy)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="returnPost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: "var(--ink)" }}>Post-Retirement Return</FormLabel>
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
                              className="focus-visible:ring-amber-400"
                            />
                            <span className="absolute right-3 top-2 text-sm" style={{ color: "var(--slate-mid)" }}>%</span>
                          </div>
                        </FormControl>
                        <FormDescription style={{ color: "var(--slate-mid)" }}>Expected return during withdrawal phase (conservative)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Other Assumptions */}
            <Card className="border-0 shadow-sm" style={{ background: "white" }}>
              <CardHeader className="pb-4" style={{ borderBottom: "1px solid rgba(232,148,10,0.12)" }}>
                <CardTitle className="font-serif text-lg" style={{ color: "var(--ink)" }}>Other Planning Assumptions</CardTitle>
                <CardDescription style={{ color: "var(--slate-mid)" }}>General assumptions for retirement planning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="lifeExpectancy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: "var(--ink)" }}>Life Expectancy</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              min="60"
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-life-expectancy"
                              className="focus-visible:ring-amber-400"
                            />
                            <span className="absolute right-3 top-2 text-sm" style={{ color: "var(--slate-mid)" }}>years</span>
                          </div>
                        </FormControl>
                        <FormDescription style={{ color: "var(--slate-mid)" }}>Expected age for retirement planning calculations</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxRegime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: "var(--ink)" }}>Default Tax Regime</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-tax-regime" className="focus:ring-amber-400">
                              <SelectValue placeholder="Select tax regime" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="old">Old Tax Regime</SelectItem>
                            <SelectItem value="new">New Tax Regime</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription style={{ color: "var(--slate-mid)" }}>Default tax regime for new plans</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                data-testid="button-reset"
                className="hover:bg-amber-50"
                style={{ borderColor: "rgba(232,148,10,0.35)", color: "var(--slate-mid)" }}
              >
                Reset to Defaults
              </Button>
              <Button
                type="submit"
                disabled={updateDefaultsMutation.isPending}
                className="px-8 text-white hover:opacity-90"
                data-testid="button-save"
                style={{ background: "var(--saffron)", borderColor: "transparent" }}
              >
                {updateDefaultsMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving…
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
