import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartLine, ArrowLeft, Download, Settings } from "lucide-react";
import { Link } from "wouter";
import PlanChart from "@/components/plan-chart";
import CashflowChart from "@/components/cashflow-chart";
import KpiCards from "@/components/kpi-cards";
import AssumptionsPanel from "@/components/assumptions-panel";
import LeadCaptureModal from "@/components/lead-capture-modal";

export default function PlanDashboard() {
  const [match, params] = useRoute("/plan/:id");
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [chartTimeRange, setChartTimeRange] = useState("25Y");

  const { data: scenario, isLoading: scenarioLoading } = useQuery({
    queryKey: ["/api/scenarios", params?.id],
    enabled: isAuthenticated && !!params?.id,
  });

  const { data: calculations, isLoading: calculationsLoading } = useQuery({
    queryKey: ["/api/calc", params?.id],
    queryFn: async () => {
      const response = await fetch(`/api/calc/${params?.id}`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to calculate");
      return response.json();
    },
    enabled: !!scenario,
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

  const handleExportPDF = () => {
    // Authenticated users bypass lead capture, guests need lead capture or existing leadId
    if (isAuthenticated || scenario?.leadId) {
      window.open(`/api/export/pdf/${params?.id}`, '_blank');
    } else {
      setShowLeadModal(true);
    }
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
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-slate-600 hover:text-primary-600 font-medium">
                  <a data-testid="link-dashboard">Dashboard</a>
                </Link>
                <span className="text-primary-600 font-medium">My Plans</span>
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
                  Last updated: {new Date(scenario.updatedAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
            <Button 
              onClick={handleExportPDF}
              className="bg-primary-600 hover:bg-primary-700"
              data-testid="button-export-pdf"
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

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
                  <CardTitle>Net Worth Projection</CardTitle>
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
