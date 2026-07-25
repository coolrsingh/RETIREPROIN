import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartLine, ArrowLeft, FileSpreadsheet, Star, RefreshCw, Mail, Lock } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import { Link } from "wouter";
import PlanChart from "@/components/plan-chart";
import CashflowChart from "@/components/cashflow-chart";
import CashflowAdvisor from "@/components/cashflow-advisor";
import KpiCards from "@/components/kpi-cards";
import AssumptionsPanel from "@/components/assumptions-panel";
import SavingsInsightsChart from "@/components/savings-insights-chart";
import LeadCaptureModal from "@/components/lead-capture-modal";
import ProfileMenu from "@/components/profile-menu";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useGetScenario, getGetScenarioQueryKey, useGetCrmDefaults, getGetCrmDefaultsQueryKey } from "@workspace/api-client-react";

export default function PlanDashboard() {
  const [match, params] = useRoute("/plan/:id");
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [chartTimeRange, setChartTimeRange] = useState("25Y");

  // Live return rate override (user can tweak without saving a new plan)
  const [liveRates, setLiveRates] = useState<{ pre: string; post: string } | null>(null);

  const { data: scenario, isLoading: scenarioLoading } = useGetScenario(
    params?.id ?? "",
    { query: { queryKey: getGetScenarioQueryKey(params?.id ?? ""), enabled: isAuthenticated && !!params?.id } },
  );

  const { data: crmDefaults } = useGetCrmDefaults({
    query: { queryKey: getGetCrmDefaultsQueryKey(), enabled: isAuthenticated },
  });

  const { data: calculations, isLoading: calculationsLoading } = useQuery({
    queryKey: ["/api/calc", params?.id, liveRates],
    queryFn: async () => {
      const body = liveRates
        ? { overrideReturnPre: liveRates.pre, overrideReturnPost: liveRates.post }
        : {};
      const response = await fetch(`/api/calc/${params?.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Failed to calculate");
      return response.json();
    },
    enabled: !!scenario,
  });

  // Export nudge banner — shown once when calculations first load
  const [showExportBanner, setShowExportBanner] = useState(false);
  const exportBannerShown = useRef(false);

  // Initialise live rate inputs from loaded assumptions
  useEffect(() => {
    if (scenario?.assumptions && !liveRates) {
      setLiveRates({
        pre: String(scenario.assumptions.returnPre ?? 12),
        post: String(scenario.assumptions.returnPost ?? 8),
      });
    }
  }, [scenario]);

  useEffect(() => {
    if (calculations && !calculationsLoading && !exportBannerShown.current) {
      exportBannerShown.current = true;
      const timer = setTimeout(() => setShowExportBanner(true), 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [calculations, calculationsLoading]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Session expired",
        description: "Please sign in to view and manage your saved plans.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleExportPDF = () => {
    if (isAuthenticated) {
      window.open(`/api/export/pdf/${params?.id}`, '_blank');
    } else {
      setShowLeadModal(true);
    }
  };

  const handleRecalculate = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/calc", params?.id, liveRates] });
    toast({ title: "Recalculated", description: "Projections updated with your new return rates." });
  };

  if (isLoading || scenarioLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--ivory)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A24] mx-auto mb-4"></div>
          <p style={{ color: "var(--slate-mid)" }}>Loading your plan...</p>
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--ivory)" }}>
        <Card className="w-full max-w-md mx-4" style={{ border: "1px solid rgba(232,148,10,0.18)" }}>
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>Plan Not Found</h1>
            <p className="mb-4" style={{ color: "var(--slate-mid)" }}>The retirement plan you're looking for doesn't exist.</p>
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

  const isAdmin = (user as any)?.role === 'admin';

  return (
    <div className="min-h-screen" style={{ background: "var(--ivory)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: "rgba(251,248,242,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(232,148,10,0.18)",
          boxShadow: "0 1px 8px rgba(26,18,8,0.06)",
        }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <BrandLogo textClassName="text-slate-800" />
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="font-medium" style={{ color: "var(--slate-mid)" }} data-testid="link-dashboard">
                  Dashboard
                </Link>
                <span className="font-semibold" style={{ color: "var(--saffron)" }}>My Plans</span>
              </nav>
            </div>
            <ProfileMenu user={user} isAdmin={isAdmin} />
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div style={{ background: "rgba(251,248,242,0.6)", borderBottom: "1px solid rgba(232,148,10,0.12)" }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-auto p-0 bg-transparent">
              <TabsTrigger
                value="dashboard"
                className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-[#E8940A] data-[state=active]:text-[#92660A] rounded-none"
                data-testid="tab-dashboard"
              >
                <ChartLine className="mr-2 h-4 w-4" />
                Dashboard
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        {/* Scenario Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="button-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
                data-testid="text-scenario-name"
              >
                {scenario.name}
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <span style={{ color: "var(--slate-mid)" }}>
                  Last updated: {new Date(scenario.updatedAt ?? '').toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`/api/export/excel/${scenario.id}`}
                download
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </a>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    window.location.href = "/api/login";
                  }
                }}
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-colors"
                style={
                  isAuthenticated
                    ? { background: "#f1f5f9", color: "#475569", borderColor: "#e2e8f0", cursor: "not-allowed", opacity: 0.7 }
                    : { background: "#fef3e2", color: "#92660A", borderColor: "rgba(232,148,10,0.35)", cursor: "pointer" }
                }
                title={isAuthenticated ? "Email report — coming soon" : "Sign in to unlock"}
              >
                {isAuthenticated ? <Lock className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                Email report
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: isAuthenticated ? "#e2e8f0" : "rgba(232,148,10,0.2)", color: isAuthenticated ? "#64748b" : "#92660A" }}>
                  {isAuthenticated ? "Soon" : "Sign in"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Return Rate Adjuster */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-orange-800 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Adjust Return Rates &amp; Recalculate
            </CardTitle>
            <CardDescription className="text-orange-700 text-xs">
              Change the expected rates of return below to instantly see how it impacts your retirement outlook.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-orange-700 font-medium">Pre-retirement Return (%)</Label>
                <Input
                  type="number"
                  step="0.5"
                  min={0}
                  max={30}
                  className="w-36 bg-white border-orange-300"
                  value={liveRates?.pre ?? ""}
                  onChange={e => setLiveRates(r => ({ pre: e.target.value, post: r?.post ?? "8" }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-orange-700 font-medium">Post-retirement Return (%)</Label>
                <Input
                  type="number"
                  step="0.5"
                  min={0}
                  max={30}
                  className="w-36 bg-white border-orange-300"
                  value={liveRates?.post ?? ""}
                  onChange={e => setLiveRates(r => ({ pre: r?.pre ?? "12", post: e.target.value }))}
                />
              </div>
              <Button
                size="sm"
                className="bg-[#F15A24] hover:bg-[#d44d1e] text-white font-semibold shadow-sm"
                onClick={handleRecalculate}
                disabled={calculationsLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${calculationsLoading ? "animate-spin" : ""}`} />
                Recalculate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        {calculations && (
          <KpiCards calculations={calculations} />
        )}

        {/* Export nudge banner */}
        {showExportBanner && (
          <div className="mb-6 flex items-center justify-between gap-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FileSpreadsheet className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-900">Your plan is ready to export!</p>
                <p className="text-xs text-emerald-700 mt-0.5">Download all your numbers, projections, and year-by-year data to Excel for your records or to share with your advisor.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={`/api/export/excel/${params?.id}`}
                download
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Download Excel
              </a>
              <button
                onClick={() => setShowExportBanner(false)}
                className="text-emerald-500 hover:text-emerald-700 p-1 rounded"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Cashflow Advisor — What You Should Do (sits directly above the Net Worth projection) */}
        {calculations && !calculationsLoading && (
          <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="pt-4 pb-4">
              <CashflowAdvisor calculations={calculations} />
            </CardContent>
          </Card>
        )}

        {/* Net Worth Projection — full width */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <CardTitle>Net Worth Projection</CardTitle>
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  EXPORT
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                {["10Y", "25Y", "Life"].map(range => (
                  <Button
                    key={range}
                    variant="outline"
                    size="sm"
                    className={chartTimeRange === range ? "border" : ""}
                    style={chartTimeRange === range ? { background: "rgba(232,148,10,0.1)", color: "#92660A", borderColor: "rgba(232,148,10,0.35)" } : {}}
                    onClick={() => setChartTimeRange(range)}
                    data-testid={`button-chart-${range.toLowerCase()}`}
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {calculations && !calculationsLoading ? (
              <PlanChart calculations={calculations} timeRange={chartTimeRange} />
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Savings Insights + Assumptions — side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle>Savings Insights — Income, Expenses &amp; Rate</CardTitle>
                <p className="text-xs text-slate-500">How your monthly savings and savings rate evolve over time before retirement</p>
              </CardHeader>
              <CardContent>
                {calculations && !calculationsLoading ? (
                  <SavingsInsightsChart calculations={calculations} />
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            <AssumptionsPanel scenario={scenario} crmDefaults={crmDefaults} />
          </div>
        </div>

        {/* Cashflow Analysis — full width */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cashflow Analysis — Income vs Expenses</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Year-by-year cashflow showing income growth, expense inflation, and retirement spending</p>
          </CardHeader>
          <CardContent>
            {calculations && !calculationsLoading ? (
              <CashflowChart calculations={calculations} />
            ) : (
              <div className="h-64 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
                <div className="text-center">
                  <ChartLine className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">Loading cashflow analysis...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Expert Connect — fixed vertical right-side sidebar poster */}
      <a
        href={`https://wa.me/919819590598?text=${encodeURIComponent(`Hi, I just created my retirement plan on RetirePro for ${scenario?.name ?? "my household"}. Can you help me review it?`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3 py-5 px-2.5 rounded-l-2xl shadow-2xl transition-all duration-200 hover:px-4 hover:shadow-green-400/50 group"
        style={{ background: "#25D366", minHeight: "160px" }}
        title="Review your plan with a retirement advisor on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 flex-shrink-0 mt-1" style={{ fill: "white" }} xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="text-white font-bold text-[11px] tracking-widest uppercase leading-tight" style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}>
          Review with Advisor
        </span>
      </a>

      {/* Lead Capture Modal */}
      <LeadCaptureModal 
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        scenarioId={params?.id}
        onSuccess={() => {
          setShowLeadModal(false);
        }}
      />
    </div>
  );
}
