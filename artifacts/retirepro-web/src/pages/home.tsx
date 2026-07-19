import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

interface ScenarioSummary {
  id: string;
  name: string;
  updatedAt: string | Date;
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartLine, Plus, FileText, Zap, Users, BookOpen, HelpCircle } from "lucide-react";
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

  const { data: scenarios, isLoading: scenariosLoading } = useQuery<ScenarioSummary[]>({
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--ivory)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8940A] mx-auto mb-4"></div>
          <p style={{ color: "var(--slate-mid)" }}>Loading your dashboard...</p>
        </div>
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
              <nav className="hidden md:flex space-x-6 items-center">
                <span className="font-semibold" style={{ color: "var(--saffron)" }}>Dashboard</span>
                <Link href="/blog" className="font-medium hover:opacity-80 flex items-center gap-1.5" style={{ color: "var(--slate-mid)" }}>
                  <BookOpen className="h-4 w-4" />
                  Blog
                </Link>
                <Link href="/faq" className="font-medium hover:opacity-80 flex items-center gap-1.5" style={{ color: "var(--slate-mid)" }}>
                  <HelpCircle className="h-4 w-4" />
                  FAQ
                </Link>
                <Link href="/landing" className="font-medium hover:opacity-80 flex items-center gap-1.5" style={{ color: "var(--slate-mid)" }}>
                  <ChartLine className="h-4 w-4" />
                  About
                </Link>
                {isAdmin && (
                  <Link href="/leads" className="font-medium hover:opacity-80 flex items-center gap-1" style={{ color: "var(--slate-mid)" }}>
                    <Users className="h-4 w-4" />
                    Ad Leads
                  </Link>
                )}
              </nav>
            </div>
            <ProfileMenu user={user} isAdmin={isAdmin} />
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
          >
            Welcome back, {(user as any)?.firstName || 'there'}!
          </h1>
          <p style={{ color: "var(--slate-mid)" }}>
            Manage your retirement plans and track your financial goals
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div
            className="rounded-2xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(232,148,10,0.10) 0%, rgba(251,159,11,0.06) 100%)",
              border: "1px solid rgba(232,148,10,0.22)",
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <Zap className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "var(--saffron)" }} />
              <div>
                <h2
                  className="text-lg font-semibold mb-1"
                  style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
                >
                  Create a New Retirement Plan
                </h2>
                <p className="text-sm" style={{ color: "var(--slate-mid)" }}>
                  Fill in your household income, savings, children and goals — get a full year-by-year projection instantly
                </p>
              </div>
            </div>
            <Link href="/plan?mode=quick">
              <Button
                className="text-white font-semibold px-6"
                style={{ background: "var(--saffron)", borderColor: "transparent" }}
                data-testid="button-create-quick-plan"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Retirement Plan
              </Button>
            </Link>
          </div>
        </div>

        {/* Existing Plans */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
            >
              Your Plans
            </h2>
            {scenarios && scenarios.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                style={{ borderColor: "rgba(232,148,10,0.35)", color: "var(--saffron)" }}
                data-testid="button-view-all"
              >
                <FileText className="mr-2 h-4 w-4" />
                View All
              </Button>
            )}
          </div>

          {scenarios && scenarios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scenarios.map((scenario: any) => (
                <div
                  key={scenario.id}
                  className="rounded-2xl p-5 transition-shadow hover:shadow-md"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(232,148,10,0.18)",
                    boxShadow: "0 1px 6px rgba(26,18,8,0.05)",
                  }}
                  data-testid={`card-scenario-${scenario.id}`}
                >
                  <div className="mb-1">
                    <h3
                      className="text-lg font-semibold"
                      style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
                    >
                      {scenario.name}
                    </h3>
                    <p className="text-sm mt-0.5" style={{ color: "var(--slate-mid)" }}>
                      Last updated: {new Date(scenario.updatedAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link href={`/plan/${scenario.id}`}>
                      <Button
                        size="sm"
                        className="text-white font-medium"
                        style={{ background: "var(--saffron)", borderColor: "transparent" }}
                        data-testid={`button-view-${scenario.id}`}
                      >
                        <ChartLine className="mr-2 h-4 w-4" />
                        View Plan
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="rounded-2xl text-center py-14 px-6"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(232,148,10,0.18)",
                boxShadow: "0 1px 6px rgba(26,18,8,0.05)",
              }}
            >
              <ChartLine className="h-14 w-14 mx-auto mb-4" style={{ color: "rgba(232,148,10,0.3)" }} />
              <h3
                className="text-xl font-semibold mb-2"
                style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
              >
                No plans yet
              </h3>
              <p className="mb-5 text-sm" style={{ color: "var(--slate-mid)" }}>
                Get started by creating your first retirement plan
              </p>

              <div
                className="inline-block rounded-xl px-5 py-3 mb-6 text-left max-w-md"
                style={{
                  background: "rgba(232,148,10,0.08)",
                  border: "1px solid rgba(232,148,10,0.20)",
                }}
              >
                <h4
                  className="font-semibold text-sm mb-1"
                  style={{ color: "var(--ink)" }}
                >
                  💡 Did you know?
                </h4>
                <p className="text-sm" style={{ color: "var(--slate-mid)" }}>
                  Starting to save for retirement at age 25 vs 35 can result in 2× more wealth at retirement,
                  thanks to the power of compound interest. Every year matters!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/plan?mode=quick">
                  <Button
                    className="text-white font-semibold"
                    style={{ background: "var(--saffron)", borderColor: "transparent" }}
                    data-testid="button-first-quick-plan"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Create Retirement Plan
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
