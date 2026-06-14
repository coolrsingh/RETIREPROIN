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
    if (isAuthenticated || scenario?.leadId) {
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your plan...</p>
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/">
                <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
                  <ChartLine className="text-primary-600 h-8 w-8" />
                  <span className="text-xl font-bold text-slate-800">RetirePro</span>
                </div>
              </Link>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <Badge variant={scenario.mode === 'quick' ? 'default' : 'secondary'}>
                  {scenario.mode === 'quick' ? 'Quick Plan' : 'Detailed Plan'}
                </Badge>
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
              <CardTitle>Cashflow Analysis</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="bg-primary-100 text-primary-700" data-testid="button-cashflow-income">
                  Income vs Expenses
                </Button>
              </div>
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

        {/* Cashflow Advisor — actionable gap-closing advice */}
        {calculations && !calculationsLoading && (
          <Card className="mt-2">
            <CardContent className="pt-2">
              <CashflowAdvisor calculations={calculations} />
            </CardContent>
          </Card>
        )}
      </main>

      {/* Lead Capture Modal */}
      <LeadCaptureModal 
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        scenarioId={params?.id}
        onSuccess={() => {
          setShowLeadModal(false);
          window.open(`/api/export/pdf/${params?.id}`, '_blank');
        }}
      />
    </div>
  );
}
