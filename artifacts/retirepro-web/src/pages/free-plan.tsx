import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import BrandLogo from "@/components/brand-logo";
import QuickPlanForm from "@/components/quick-plan-form";
import { type QuickPlan } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Zap, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function FreePlan() {
  usePageMeta({
    title: "Free Retirement Calculator India — No Login | RetirePro",
    description: "Calculate your retirement corpus for free. India-specific assumptions — EPF, NPS, SIP, inflation. Takes 60 seconds. No account needed.",
    canonical: "https://retirepro.in/free-plan",
    ogUrl: "https://retirepro.in/free-plan",
    ogType: "website",
  });

  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data: QuickPlan) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/plan/try", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message || "Calculation failed. Please check your inputs.");
      }
      const result = await res.json();
      sessionStorage.setItem("guestCalcResult", JSON.stringify(result));
      sessionStorage.setItem("guestCalcForm", JSON.stringify({
        fullName: data.fullName,
        dob: data.dob,
        retirementAge: String(data.retirementAge),
        monthlyIncomeTotal: String(data.monthlyIncomeTotal),
        monthlyExpenseTotal: String(data.monthlyExpenseTotal),
        monthlySavings: String(data.monthlySavings),
        assetsLumpSum: String(data.assetsLumpSum ?? 0),
        returnPre: String(data.assumptions?.returnPre ?? 12),
        inflationRate: String(data.assumptions?.inflationHeadline ?? 7),
      }));
      navigate("/plan/preview");
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white/85 backdrop-blur-xl shadow-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <BrandLogo textClassName="text-slate-900" />
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
              <CheckCircle className="h-3.5 w-3.5" />
              100% FREE
            </span>
          </div>
          <Button
            onClick={() => { window.location.href = "/api/login"; }}
            className="bg-[#F15A24] hover:bg-[#d44d1e] text-white rounded-full px-5 h-9 text-sm font-semibold"
          >
            <Lock className="h-3.5 w-3.5 mr-1.5" />
            Sign In to Save
          </Button>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 border-b border-amber-200"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-amber-800 flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-500 flex-shrink-0" />
            Fill in everything below — your plan is calculated instantly.{" "}
            <button
              onClick={() => { window.location.href = "/api/login"; }}
              className="font-semibold text-[#F15A24] hover:underline"
            >
              Sign in
            </button>{" "}
            to save it permanently and export to Excel.
          </p>
          <Button
            size="sm"
            onClick={() => { window.location.href = "/api/login"; }}
            className="bg-[#F15A24] hover:bg-[#d44d1e] text-white rounded-full text-xs flex-shrink-0"
          >
            <Zap className="h-3 w-3 mr-1" />
            Create Free Account
          </Button>
        </div>
      </motion.div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/">
              <button className="text-sm text-slate-500 hover:text-slate-800 transition-colors">← Back</button>
            </Link>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle className="h-4 w-4" />
                Free — No account needed
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Zap className="h-8 w-8 text-orange-500" />
              Full Retirement Planner
            </h1>
            <p className="text-slate-600 mt-2">
              Include children, mini-retirement, EMI and more — get a complete personalised plan instantly.
            </p>
          </div>

          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-wrap gap-x-6 gap-y-2">
            {[
              "Children's education & marriage costs",
              "Mini-retirement / career break",
              "Existing loan EMI impact",
              "Year-by-year projections",
              "Funding gap analysis",
            ].map(f => (
              <span key={f} className="flex items-center gap-1.5 text-sm text-emerald-800">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                {f}
              </span>
            ))}
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <QuickPlanForm onSubmit={handleSubmit} isLoading={isLoading} />
        </motion.div>

        <div className="mt-10 bg-gradient-to-r from-[#0A1628] to-[#0D1B2A] rounded-2xl p-6 text-center text-white">
          <h2 className="text-lg font-bold mb-1">Want to save this plan and track your progress?</h2>
          <p className="text-slate-400 text-sm mb-4">
            Create a free account — takes 10 seconds with Google. Your plan, saved forever.
          </p>
          <Button
            className="bg-[#F15A24] hover:bg-[#d44d1e] text-white rounded-full px-8 h-11 font-bold"
            onClick={() => { window.location.href = "/api/login"; }}
          >
            <Zap className="mr-2 h-4 w-4" />
            Create Free Account — Save My Plan
          </Button>
        </div>
      </main>
    </div>
  );
}
