import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartLine, Plus, FileText, Zap, List } from "lucide-react";
import { Link } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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

  if (isLoading || scenariosLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
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
              <Link href="/">
                <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
                  <ChartLine className="text-primary-600 h-8 w-8" />
                  <span className="text-xl font-bold text-slate-800">RetirePro</span>
                </div>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <span className="text-primary-600 font-medium">Dashboard</span>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-600" data-testid="text-username">
                {user?.firstName || user?.email || 'User'}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {user?.firstName || 'there'}!
          </h1>
          <p className="text-slate-600">
            Manage your retirement plans and track your financial goals
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-primary-200 bg-primary-50">
            <CardHeader>
              <CardTitle className="flex items-center text-primary-700">
                <Zap className="mr-2 h-5 w-5" />
                Quick Plan
              </CardTitle>
              <CardDescription>
                Create a retirement plan in under 60 seconds with smart defaults
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/plan?mode=quick">
                <Button className="w-full" data-testid="button-create-quick-plan">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Quick Plan
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-success-200 bg-success-50 relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-success-700">
                <div className="flex items-center">
                  <List className="mr-2 h-5 w-5" />
                  Detailed Plan
                </div>
                <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md">
                  COMING SOON
                </Badge>
              </CardTitle>
              <CardDescription>
                Comprehensive planning with all your financial details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-success-600 text-success-700 opacity-50 cursor-not-allowed" disabled data-testid="button-create-detailed-plan">
                <Plus className="mr-2 h-4 w-4" />
                Create Detailed Plan
              </Button>
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
                      <Badge variant={scenario.mode === 'quick' ? 'default' : 'secondary'}>
                        {scenario.mode === 'quick' ? 'Quick' : 'Detailed'}
                      </Badge>
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
                
                {/* Retirement Facts */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Did you know?</h4>
                  <p className="text-blue-800 text-sm">
                    Starting to save for retirement at age 25 vs 35 can result in 2x more wealth at retirement, 
                    thanks to the power of compound interest. Every year matters!
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/plan?mode=quick">
                    <Button data-testid="button-first-quick-plan">
                      <Zap className="mr-2 h-4 w-4" />
                      Create Quick Plan
                    </Button>
                  </Link>
                  <Link href="/plan?mode=detailed">
                    <Button variant="outline" data-testid="button-first-detailed-plan">
                      <List className="mr-2 h-4 w-4" />
                      Create Detailed Plan
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
