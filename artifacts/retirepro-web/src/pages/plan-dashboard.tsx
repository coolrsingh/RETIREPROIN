import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartLine, ArrowLeft, FileSpreadsheet, Star, RefreshCw } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import { Link } from "wouter";
import PlanChart from "@/components/plan-chart";
import CashflowChart from "@/components/cashflow-chart";
import CashflowAdvisor from "@/components/cashflow-advisor";
import KpiCards from "@/components/kpi-cards";
import AssumptionsPanel from "@/components/assumptions-panel";
import LeadCaptureModal from "@/components/lead-capture-modal";
import ProfileMenu from "@/components/profile-menu";
import { apiRequest } from "@/lib/queryClient";

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

  const { data: scenario, isLoading: scenarioLoading } = useQuery({
    queryKey: ["/api/scenarios", params?.id],
    enabled: isAuthenticated && !!params?.id,
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
      <div className="min-h-screen bg-gradient-to-b from-[#F4F9FF] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your plan...</p>
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F4F9FF] to-white flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Plan Not Found</h1>
            <p className="text-slate-600 mb-4">The retirement plan you're looking for doesn't exist.</p>
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
    <div className="min-h-screen bg-gradient-to-b from-[#F4F9FF] to-white">
      {/* Header */}
      <header className="bg-white/85 backdrop-blur-xl shadow-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <BrandLogo textClassName="text-slate-800" />
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-slate-600 hover:text-primary-600 font-medium" data-testid="link-dashboard">
                  Dashboard
                </Link>
                <span className="text-primary-600 font-medium">My Plans</span>
              </nav>
            </div>
            <ProfileMenu user={user} isAdmin={isAdmin} />
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-auto p-0 bg-transparent">
              <TabsTrigger 
                value="dashboard" 
                className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 rounded-none"
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
              <h1 className="text-3xl font-bold text-slate-900" data-testid="text-scenario-name">
                {scenario.name}
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-slate-600">
                  Last updated: {new Date(scenario.updatedAt).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            <a
              href={`/api/export/excel/${scenario.id}`}
              download
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Download Excel
            </a>
          </div>
        </div>

        {/* Live Return Rate Adjuster */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-blue-800 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Adjust Return Rates &amp; Recalculate
            </CardTitle>
            <CardDescription className="text-blue-700 text-xs">
              Change the expected rates of return below to instantly see how it impacts your retirement outlook.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-blue-700">Pre-retirement Return (%)</Label>
                <Input
                  type="number"
                  step="0.5"
                  min={0}
                  max={30}
                  className="w-36 bg-white border-blue-300"
                  value={liveRates?.pre ?? ""}
                  onChange={e => setLiveRates(r => ({ pre: e.target.value, post: r?.post ?? "8" }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-blue-700">Post-retirement Return (%)</Label>
                <Input
                  type="number"
                  step="0.5"
                  min={0}
                  max={30}
                  className="w-36 bg-white border-blue-300"
                  value={liveRates?.post ?? ""}
                  onChange={e => setLiveRates(r => ({ pre: r?.pre ?? "12", post: e.target.value }))}
                />
              </div>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
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

        {/* AI Insights — above the chart */}
        {calculations && !calculationsLoading && (
          <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="pt-4 pb-4">
              <CashflowAdvisor calculations={calculations} />
            </CardContent>
          </Card>
        )}

        {/* Charts and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Net Worth Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CardTitle>Net Worth Projection</CardTitle>
                    <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      EXPORT
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={chartTimeRange === "10Y" ? "bg-primary-100 text-primary-700" : ""}
                      onClick={() => setChartTimeRange("10Y")}
                      data-testid="button-chart-10y"
                    >
                      10Y
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={chartTimeRange === "25Y" ? "bg-primary-100 text-primary-700" : ""}
                      onClick={() => setChartTimeRange("25Y")}
                      data-testid="button-chart-25y"
                    >
                      25Y
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={chartTimeRange === "Life" ? "bg-primary-100 text-primary-700" : ""}
                      onClick={() => setChartTimeRange("Life")}
                      data-testid="button-chart-life"
                    >
                      Life
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {calculations && !calculationsLoading ? (
                  <PlanChart calculations={calculations} timeRange={chartTimeRange} />
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                      <p className="text-slate-500">Calculating projections...</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Assumptions Panel */}
          <div>
            <AssumptionsPanel scenario={scenario} />
          </div>
        </div>

        {/* Cashflow Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Cashflow Analysis — Income vs Expenses</CardTitle>
            </div>
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

      {/* WhatsApp Expert Connect — floating widget */}
      <a
        href={`https://wa.me/919867659000?text=${encodeURIComponent(`Hi, I just created my retirement plan on RetirePro for ${scenario?.name ?? "my household"}. Can you help me review it?`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 text-white font-semibold text-sm px-5 py-3 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 hover:shadow-green-400/40"
        style={{ background: "#25D366" }}
        title="Connect with a retirement advisor on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0" style={{ fill: "white" }} xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Talk to an Advisor
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
