import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { quickPlanSchema, type QuickPlan } from "@shared/schema";
import EnhancedPlanForm from "@/components/enhanced-plan-form";
import QuickPlanForm from "@/components/quick-plan-form";
import ComingSoonDetailed from "@/components/coming-soon-detailed";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { ChartLine, ArrowLeft, Zap, List } from "lucide-react";
import { Link } from "wouter";
import ModernPlanLimitModal from "@/components/modern-plan-limit-modal";
import ProfileMenu from "@/components/profile-menu";

export default function PlanForm() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const [showPlanLimitModal, setShowPlanLimitModal] = useState(false);
  const queryClient = useQueryClient();

  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const mode = searchParams.get('mode') || 'quick';

  // Fetch saved profile to pre-fill the form
  const { data: profile } = useQuery<any>({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated,
  });

  const createPlanMutation = useMutation({
    mutationFn: async (data: QuickPlan) => {
      return await apiRequest("POST", "/api/plan/quick", data);
    },
    onSuccess: (scenario: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/scenarios"] });
      toast({
        title: "Plan Created Successfully",
        description: "Your retirement plan has been created and calculated.",
      });
      if (scenario?.id) {
        navigate(`/plan/${scenario.id}`);
      } else {
        navigate("/");
      }
    },
    onError: (error) => {
      console.error("Plan creation error:", error);
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
      
      if ((error as any).status === 402 || error.message.toLowerCase().includes("plan limit")) {
        setShowPlanLimitModal(true);
        return;
      }
      
      toast({
        title: "Error Creating Plan",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuickPlan) => {
    console.log("Form submitted with data:", data);
    createPlanMutation.mutate(data);
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your retirement planning dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isAdmin = (user as any)?.role === 'admin';

  // Build profile-based defaults
  const profileDefaults = profile ? {
    fullName: profile.firstName ? `${profile.firstName}${profile.lastName ? " " + profile.lastName : ""}` : "",
    dob: profile.dob || "",
    retirementAge: profile.retirementAge || 60,
    monthlyIncomeTotal: profile.monthlyIncome ? Number(profile.monthlyIncome) : 0,
    monthlyExpenseTotal: profile.monthlyExpenses ? Number(profile.monthlyExpenses) : 0,
    monthlySavings: profile.monthlySavings ? Number(profile.monthlySavings) : 0,
    incomeGrowthRate: profile.incomeGrowthRate ? Number(profile.incomeGrowthRate) : 8,
    assetsLumpSum: profile.currentAssets ? Number(profile.currentAssets) : 0,
  } : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <Link href="/">
                <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
                  <ChartLine className="h-8 w-8 text-primary" />
                  <span className="text-xl font-bold text-slate-900">RetirePro</span>
                </div>
              </Link>
              <nav className="flex space-x-1">
                <Link href="/plan?mode=quick">
                  <Button variant={mode === 'quick' ? 'default' : 'ghost'} size="sm">
                    Quick Plan
                  </Button>
                </Link>
                <Link href="/plan?mode=detailed">
                  <Button variant={mode === 'detailed' ? 'default' : 'ghost'} size="sm">
                    Detailed Plan
                  </Button>
                </Link>
              </nav>
            </div>
            <ProfileMenu user={user} isAdmin={isAdmin} />
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

          {profile && (profile.monthlyIncome || profile.dob) && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              ✅ Your saved profile data has been pre-filled below. Review and adjust before creating your plan.
            </div>
          )}

          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            {mode === 'quick' ? (
              <>
                <Zap className="mr-3 h-8 w-8 text-primary-600" />
                Quick Retirement Plan
              </>
            ) : (
              <>
                <List className="mr-3 h-8 w-8 text-success-600" />
                Detailed Retirement Plan
              </>
            )}
          </h1>
          <p className="text-slate-600 mt-2">
            {mode === 'quick' 
              ? 'Get your retirement plan ready in under 60 seconds with smart defaults'
              : 'Comprehensive planning with detailed asset allocation and investment strategies'
            }
          </p>
        </div>

        {mode === 'quick' ? (
          <QuickPlanForm 
            onSubmit={onSubmit}
            isLoading={createPlanMutation.isPending}
            profileDefaults={profileDefaults}
          />
        ) : (
          <ComingSoonDetailed />
        )}
      </main>
      
      <ModernPlanLimitModal 
        isOpen={showPlanLimitModal}
        onClose={() => setShowPlanLimitModal(false)}
      />
    </div>
  );
}
