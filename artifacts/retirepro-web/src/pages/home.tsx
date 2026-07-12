import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartLine, Plus, FileText, Zap, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import ProfileMenu from "@/components/profile-menu";
import BrandLogo from "@/components/brand-logo";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: scenarios, isLoading: scenariosLoading } = useQuery({
    queryKey: ["/api/scenarios"],
    enabled: isAuthenticated,
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

  // After login: if the user had filled the guest calculator, redirect to the
  // Quick Plan form so we can pre-fill it with their data.
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const raw = sessionStorage.getItem("guestCalcForm");
      if (raw) {
        navigate("/plan?mode=quick");
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || scenariosLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A24] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const isAdmin = (user as any)?.role === 'admin';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <BrandLogo textClassName="text-slate-800" />
              <nav className="hidden md:flex space-x-6">
                <span className="text-primary-600 font-medium">Dashboard</span>
                {isAdmin && (
                  <Link href="/leads" className="text-slate-600 hover:text-primary-600 font-medium flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Ad Leads
                  </Link>
                )}
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <ProfileMenu user={user} isAdmin={isAdmin} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {(user as any)?.firstName || 'there'}!
          </h1>
          <p className="text-slate-600">
            Manage your retirement plans and track your financial goals
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 col-span-full">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700">
                <Zap className="mr-2 h-5 w-5 text-orange-500" />
                Create a New Retirement Plan
              </CardTitle>
              <CardDescription>
                Fill in your household income, savings, children and goals — get a full year-by-year projection instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/plan?mode=quick">
                <Button className="bg-[#F15A24] hover:bg-[#d44d1e] text-white font-semibold px-6" data-testid="button-create-quick-plan">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Retirement Plan
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Existing Plans */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Your Plans</h2>
            {scenarios && scenarios.length > 0 && (
              <Button variant="outline" size="sm" data-testid="button-view-all">
                <FileText className="mr-2 h-4 w-4" />
                View All
              </Button>
            )}
          </div>

          {scenarios && scenarios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scenarios.map((scenario: any) => (
                <Card key={scenario.id} className="hover:shadow-md transition-shadow" data-testid={`card-scenario-${scenario.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    </div>
                    <CardDescription>
                      Last updated: {new Date(scenario.updatedAt).toLocaleDateString('en-IN')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <Link href={`/plan/${scenario.id}`}>
                        <Button size="sm" className="flex-1" data-testid={`button-view-${scenario.id}`}>
                          <ChartLine className="mr-2 h-4 w-4" />
                          View Plan
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <ChartLine className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No plans yet</h3>
                <p className="text-slate-600 mb-4">
                  Get started by creating your first retirement plan
                </p>
                
                <div className="bg-orange-50 rounded-lg px-4 py-3 mb-6 border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-2">💡 Did you know?</h4>
                  <p className="text-orange-800 text-sm">
                    Starting to save for retirement at age 25 vs 35 can result in 2x more wealth at retirement, 
                    thanks to the power of compound interest. Every year matters!
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/plan?mode=quick">
                    <Button className="bg-[#F15A24] hover:bg-[#d44d1e] text-white" data-testid="button-first-quick-plan">
                      <Zap className="mr-2 h-4 w-4" />
                      Create Retirement Plan
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
