import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { type QuickPlan } from "@shared/schema";
import QuickPlanForm from "@/components/quick-plan-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import { Link } from "wouter";
import ModernPlanLimitModal from "@/components/modern-plan-limit-modal";
import ProfileMenu from "@/components/profile-menu";

export default function PlanForm() {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const [showPlanLimitModal, setShowPlanLimitModal] = useState(false);
  const queryClient = useQueryClient();

  const [guestFormData] = useState<Record<string, string> | null>(() => {
    const raw = sessionStorage.getItem("guestCalcForm");
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      sessionStorage.removeItem("guestCalcForm");
      sessionStorage.removeItem("guestCalcResult");
      return parsed;
    } catch {
      return null;
    }
  });

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
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
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
    createPlanMutation.mutate(data);
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F4F9FF] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading your retirement planning dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const isAdmin = (user as any)?.role === "admin";

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

  const effectiveDefaults = guestFormData ? {
    fullName: guestFormData.fullName || profileDefaults?.fullName || "",
    dob: guestFormData.dob || profileDefaults?.dob || "",
    retirementAge: Number(guestFormData.retirementAge) || profileDefaults?.retirementAge || 60,
    monthlyIncomeTotal: Number(guestFormData.monthlyIncomeTotal) || profileDefaults?.monthlyIncomeTotal || 0,
    monthlyExpenseTotal: Number(guestFormData.monthlyExpenseTotal) || profileDefaults?.monthlyExpenseTotal || 0,
    monthlySavings: Number(guestFormData.monthlySavings) || profileDefaults?.monthlySavings || 0,
    assetsLumpSum: Number(guestFormData.assetsLumpSum) || profileDefaults?.assetsLumpSum || 0,
    incomeGrowthRate: profileDefaults?.incomeGrowthRate || 8,
  } : profileDefaults;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4F9FF] to-white">
      <header className="bg-white/85 backdrop-blur-xl shadow-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <BrandLogo textClassName="text-slate-900" />
          <ProfileMenu user={user} isAdmin={isAdmin} />
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

          {guestFormData && (
            <div className="mb-4 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              ✅ Your details from the preview calculator have been pre-filled below. Complete the optional sections and create your plan.
            </div>
          )}
          {!guestFormData && profile && (profile.monthlyIncome || profile.dob) && (
            <div className="mb-4 px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              ✅ Your saved profile data has been pre-filled below. Review and adjust before creating your plan.
            </div>
          )}

          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <Zap className="mr-3 h-8 w-8 text-orange-500" />
            Retirement Planner
          </h1>
          <p className="text-slate-600 mt-2">
            Complete all the sections below to generate your personalised retirement plan.
          </p>
        </div>

        <QuickPlanForm
          onSubmit={onSubmit}
          isLoading={createPlanMutation.isPending}
          profileDefaults={effectiveDefaults}
        />
      </main>

      <ModernPlanLimitModal
        isOpen={showPlanLimitModal}
        onClose={() => setShowPlanLimitModal(false)}
      />
    </div>
  );
}
