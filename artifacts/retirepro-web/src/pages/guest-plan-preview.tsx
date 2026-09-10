import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Zap, Lock, Mail, Send, CheckCircle2, LoaderCircle } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import KpiCards from "@/components/kpi-cards";
import PlanChart from "@/components/plan-chart";
import CashflowChart from "@/components/cashflow-chart";
import CashflowAdvisor from "@/components/cashflow-advisor";
import AdvisorSection from "@/components/advisor-section";
import { trackEvent, trackLoginIntent } from "@/lib/analytics";

interface GuestForm {
  fullName: string;
  personaMode?: "accumulating" | "retired";
  dob: string;
  retirementAge: string;
  monthlyIncomeTotal: string;
  monthlyExpenseTotal: string;
  monthlySavings: string;
  assetsLumpSum: string;
  currentCorpus?: string;
  monthlyWithdrawal?: string;
  yearsToCover?: string;
  returnPre: string;
  returnPost?: string;
  inflationRate: string;
}

const formatCurrency = (value: number) => {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(1)} Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(1)} L`;
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
};

export function getDrawdownSummary(calculations: any, guestForm: GuestForm | null) {
  const currentYear = new Date().getFullYear();
  const series: { year: number; value: number }[] = calculations?.netWorthSeries ?? [];
  const startingCorpus = Number(guestForm?.currentCorpus)
    || Number(calculations?.summary?.projectedCorpusAtRetirement)
    || 0;
  const monthlyWithdrawal = Number(guestForm?.monthlyWithdrawal)
    || Number(guestForm?.monthlyExpenseTotal)
    || 0;
  const annualWithdrawalRate = startingCorpus > 0
    ? (monthlyWithdrawal * 12 / startingCorpus) * 100
    : 0;
  const exhaustionPoint = series.find((point, index) =>
    point.value <= 0 && (index === 0 || series[index - 1].value > 0)
  );
  const finalYear = series.at(-1)?.year ?? currentYear;
  const yearsLasting = exhaustionPoint
    ? Math.max(0, exhaustionPoint.year - currentYear)
    : Math.max(0, finalYear - currentYear);

  return {
    startingCorpus,
    monthlyWithdrawal,
    annualWithdrawalRate,
    safeWithdrawalRate: 4,
    isWithinSafeRate: annualWithdrawalRate <= 4,
    exhaustionYear: exhaustionPoint?.year ?? null,
    yearsLasting,
    lastsThroughProjection: !exhaustionPoint,
  };
}

function DrawdownSummary({ calculations, guestForm }: { calculations: any; guestForm: GuestForm | null }) {
  const summary = getDrawdownSummary(calculations, guestForm);
  const cardStyle: React.CSSProperties = {
    background: "#FFFFFF",
    border: "1px solid rgba(232,148,10,0.18)",
    boxShadow: "0 2px 12px rgba(26,18,8,0.06)",
  };

  return (
    <section className="mb-8" aria-labelledby="drawdown-summary-title" data-testid="drawdown-summary">
      <div className="mb-4">
        <h2 id="drawdown-summary-title" className="text-2xl font-bold text-slate-900">
          Your retirement drawdown outlook
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Based on your current corpus, monthly withdrawal, inflation, and expected returns.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl p-5" style={cardStyle} data-testid="drawdown-starting-corpus">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Corpus at start</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(summary.startingCorpus)}</p>
          <p className="mt-2 text-xs text-slate-500">Available to fund retirement today</p>
        </div>
        <div className="rounded-2xl p-5" style={cardStyle} data-testid="drawdown-exhaustion-year">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Projected exhaustion</p>
          <p className={`mt-2 text-2xl font-bold ${summary.exhaustionYear ? "text-orange-700" : "text-emerald-700"}`}>
            {summary.exhaustionYear ?? "Not projected"}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {summary.exhaustionYear ? "First year the corpus reaches zero" : "Corpus remains above zero for the full projection"}
          </p>
        </div>
        <div className="rounded-2xl p-5" style={cardStyle} data-testid="drawdown-years-lasting">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Corpus lasts</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {summary.lastsThroughProjection ? `${summary.yearsLasting}+ years` : `${summary.yearsLasting} years`}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {summary.lastsThroughProjection ? "Through the selected planning horizon" : "At the current withdrawal plan"}
          </p>
        </div>
        <div
          className="rounded-2xl p-5"
          style={{
            ...cardStyle,
            background: summary.isWithinSafeRate ? "rgba(22,163,74,0.05)" : "rgba(241,90,36,0.05)",
            borderColor: summary.isWithinSafeRate ? "rgba(22,163,74,0.25)" : "rgba(241,90,36,0.25)",
          }}
          data-testid="drawdown-withdrawal-check"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Withdrawal check</p>
          <p className={`mt-2 text-2xl font-bold ${summary.isWithinSafeRate ? "text-emerald-700" : "text-orange-700"}`}>
            {summary.annualWithdrawalRate.toFixed(1)}% / year
          </p>
          <p className={`mt-2 text-xs ${summary.isWithinSafeRate ? "text-emerald-700" : "text-orange-700"}`}>
            {summary.isWithinSafeRate ? "Within" : "Above"} the 4% safe-withdrawal guideline
          </p>
        </div>
      </div>
    </section>
  );
}

export default function GuestPlanPreview() {
  const [, navigate] = useLocation();
  const [calculations, setCalculations] = useState<any>(null);
  const [guestForm, setGuestForm] = useState<GuestForm | null>(null);
  const [chartTimeRange, setChartTimeRange] = useState("25Y");
  const [email, setEmail] = useState("");
  const [hasEmailConsent, setHasEmailConsent] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("guestCalcResult");
    const rawForm = sessionStorage.getItem("guestCalcForm");
    if (!raw) {
      navigate("/");
      return;
    }
    try {
      setCalculations(JSON.parse(raw));
      trackEvent("guest_preview_viewed", { calculator_type: "guest" });
      if (rawForm) {
        const parsed = JSON.parse(rawForm);
        setGuestForm(parsed);
      }
    } catch {
      navigate("/");
    }
  }, [navigate]);

  if (!calculations) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--ivory)" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  const planName = guestForm?.fullName ? `${guestForm.fullName}'s Retirement Plan` : "Your Retirement Plan";
  const isRetired = guestForm?.personaMode === "retired";

  const assumptions = {
    inflationHeadline: guestForm?.inflationRate ?? "6",
    returnPre: guestForm?.returnPre ?? "12",
    returnPost: guestForm?.returnPost ?? "8",
    lifeExpectancy: 85,
  };

  const captureEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError("Enter a valid email address to continue.");
      setEmailStatus("error");
      return;
    }

    setEmailStatus("loading");
    setEmailError("");
    try {
      const summary = calculations.summary;
      const response = await fetch("/api/leads/email-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          marketingConsent: hasEmailConsent,
          source: "plan_preview_email_card",
          planSnapshot: {
            name: planName,
            requiredCorpus: Number(summary.requiredCorpusAtRetirement) || 0,
            projectedCorpus: Number(summary.projectedCorpusAtRetirement) || 0,
            fundingGap: Math.max(0, Number(summary.gap) || 0),
            yearsToRetire: Math.max(0, Number(summary.retirementYear) - new Date().getFullYear()),
            retirementAge: Number(guestForm?.retirementAge) || 60,
            monthlyIncome: Number(guestForm?.monthlyIncomeTotal) || 0,
            monthlyExpenses: Number(guestForm?.monthlyExpenseTotal) || 0,
            monthlySavings: Number(guestForm?.monthlySavings) || 0,
            currentAssets: Number(guestForm?.assetsLumpSum) || 0,
            inflationRate: Number(guestForm?.inflationRate) || 6,
            preRetirementReturn: Number(guestForm?.returnPre) || 12,
            postRetirementReturn: 8,
            lifeExpectancy: 85,
          },
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setEmailError(
          response.status === 400
            ? "Enter a valid email address to continue."
            : payload.message || "Something went wrong — please try again.",
        );
        setEmailStatus("error");
        return;
      }

      setEmailStatus("success");
      trackEvent("guest_plan_email_sent", { source: "guest_plan_preview", marketing_consent: hasEmailConsent });
    } catch {
      setEmailError("Something went wrong — please try again.");
      setEmailStatus("error");
    }
  };

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
        <div className="max-w-[1280px] mx-auto px-6 flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <BrandLogo textClassName="text-slate-900" />
            <nav className="hidden md:flex gap-6">
              <Link href="/" className="font-medium text-sm" style={{ color: "var(--slate-mid)" }}>Dashboard</Link>
              <span className="font-semibold text-sm" style={{ color: "var(--saffron)" }}>Preview Plan</span>
            </nav>
          </div>
          <Button
            onClick={() => { trackLoginIntent("guest_preview_header"); window.location.href = "/api/login"; }}
            className="text-white rounded-full px-5 h-9 text-sm font-semibold"
            style={{ background: "var(--orange)" }}
          >
            Sign In to Save
          </Button>
        </div>
      </header>

      {/* Guest CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 border-b border-amber-200"
      >
        <div className="max-w-[1280px] mx-auto px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <Lock className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span>
              This calculator is just the preview — log in to download the full year-by-year Excel behind your plan.
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => { trackLoginIntent("guest_preview_export"); window.location.href = "/api/login"; }}
            className="bg-[#F15A24] hover:bg-[#d44d1e] text-white rounded-full text-xs flex-shrink-0"
            data-testid="button-login-to-export"
          >
            <Lock className="h-3.5 w-3.5 mr-1.5" />
            Log in now to export
          </Button>
        </div>
      </motion.div>

      <main className="max-w-[1280px] mx-auto px-6 py-8">
        {/* Plan Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
              >
                {planName}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge
                  className="border"
                  style={{ background: "rgba(232,148,10,0.1)", color: "#92660A", borderColor: "rgba(232,148,10,0.3)" }}
                >
                  Preview Plan
                </Badge>
                <span className="text-sm" style={{ color: "var(--slate-mid)" }}>Calculated just now · Not saved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Persona-specific summary */}
        {isRetired
          ? <DrawdownSummary calculations={calculations} guestForm={guestForm} />
          : <KpiCards calculations={calculations} />}

        <section
          className="mb-6 overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-r from-[#fff8ec] via-white to-[#fff1e8] shadow-sm"
          aria-label="Email your retirement plan"
          data-testid="guest-email-plan-cta"
        >
          <div className="p-5 sm:p-6">
            {emailStatus === "success" ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[#1a1208]">✓ Sent to {email.trim().toLowerCase()}. Check your inbox.</h2>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={captureEmail}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f15a24] text-white shadow-sm">
                      <Mail className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-[#1a1208]">Want a copy of your plan emailed to you?</h2>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-[#66594b]">
                        Enter your email and we&apos;ll send your retirement plan summary as a PDF — right away, no login needed.
                      </p>
                    </div>
                  </div>
                  <div className="flex w-full shrink-0 flex-col gap-2 sm:w-[300px]">
                    <Input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      disabled={emailStatus === "loading"}
                      data-testid="input-guest-plan-email"
                    />
                    <Button
                      type="submit"
                      className="bg-[#f15a24] font-semibold text-white hover:bg-[#d94d1b]"
                      disabled={emailStatus === "loading"}
                      data-testid="button-capture-guest-plan-email"
                    >
                      {emailStatus === "loading" ? <LoaderCircle className="animate-spin" /> : <Send className="h-4 w-4" />}
                      {emailStatus === "loading" ? "Sending…" : "Email Me My Plan"}
                    </Button>
                    <p className="text-xs text-[#66594b]">We&apos;ll only use this to send your plan.</p>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-2">
                  <Checkbox
                    id="guest-plan-email-consent"
                    checked={hasEmailConsent}
                    onCheckedChange={(checked) => setHasEmailConsent(checked === true)}
                    disabled={emailStatus === "loading"}
                    data-testid="checkbox-guest-plan-email-consent"
                  />
                  <Label htmlFor="guest-plan-email-consent" className="text-xs leading-5 text-[#66594b]">
                    Also send me retirement planning articles and updates from RetirePro. I can unsubscribe anytime.
                  </Label>
                </div>
                {emailStatus === "error" && (
                  <p className="mt-2 text-sm text-red-700" role="alert">{emailError}</p>
                )}
              </form>
            )}
          </div>
        </section>

        {/* Charts + Assumptions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Net Worth Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{isRetired ? "Corpus Drawdown Projection" : "Net Worth Projection"}</CardTitle>
                  <div className="flex items-center gap-2">
                    {["10Y", "25Y", "Life"].map(range => (
                      <Button
                        key={range}
                        variant="outline"
                        size="sm"
                        className={chartTimeRange === range ? "bg-orange-100 text-orange-700 border-orange-300" : ""}
                        onClick={() => setChartTimeRange(range)}
                      >
                        {range}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <PlanChart calculations={calculations} timeRange={chartTimeRange} />
              </CardContent>
            </Card>
          </div>

          {/* Assumptions — read-only for guests */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Active Assumptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Inflation (General)", value: `${assumptions.inflationHeadline}%` },
                    ...(!isRetired ? [{ label: "Return (Pre-retirement)", value: `${assumptions.returnPre}%` }] : []),
                    { label: "Return (Post-retirement)", value: `${assumptions.returnPost}%` },
                    ...(isRetired
                      ? [{ label: "Planning Horizon", value: `${guestForm?.yearsToCover ?? 25} years` }]
                      : [
                          { label: "Life Expectancy", value: `${assumptions.lifeExpectancy} years` },
                          { label: "Retirement Age", value: `${guestForm?.retirementAge ?? 60} years` },
                        ]),
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">{item.label}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                        <span className="text-xs text-slate-400 block">(user set)</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs text-amber-700 mb-2 font-medium">Want to adjust these?</p>
                  <p className="text-xs text-amber-600">
                    Sign in to save your plan and tweak assumptions to see how they affect your retirement outlook.
                  </p>
                  <Button
                    size="sm"
                    className="mt-3 w-full bg-[#F15A24] hover:bg-[#d44d1e] text-white text-xs rounded-lg"
                    onClick={() => { trackLoginIntent("guest_preview_save"); window.location.href = "/api/login"; }}
                  >
                    Sign In — It's Free
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cashflow Analysis */}
        <Card className="mb-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Cashflow Analysis</CardTitle>
              <Button variant="outline" size="sm" className="bg-orange-50 text-orange-700 border-orange-200">
                Income vs Expenses
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CashflowChart calculations={calculations} hideExportButton />
          </CardContent>
        </Card>

        {/* Cashflow Advisor is accumulation-specific */}
        {!isRetired && (
          <Card className="mt-2 mb-8">
            <CardContent className="pt-4">
              <CashflowAdvisor calculations={calculations} />
            </CardContent>
          </Card>
        )}

        {/* Talk to an Expert */}
        <AdvisorSection defaultName={guestForm?.fullName ?? ""} />

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl p-8 text-center text-white mb-8"
          style={{ background: "linear-gradient(135deg, #1A1208 0%, #2C1F0A 100%)" }}
        >
          <h2
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: "var(--font-serif)", color: "#FBF8F2" }}
          >
            Save this plan and track your progress
          </h2>
          <p className="mb-6 max-w-xl mx-auto" style={{ color: "rgba(251,248,242,0.72)" }}>
            Create a free account to save your plan, adjust assumptions, and revisit your projections any time.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              className="text-white rounded-full px-8 h-12 text-base font-bold"
              style={{ background: "var(--orange)" }}
              onClick={() => { trackLoginIntent("guest_preview_footer"); window.location.href = "/api/login"; }}
            >
              <Zap className="mr-2 h-5 w-5" />
              Create Free Account
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-8 h-12 text-base"
              style={{ borderColor: "rgba(251,248,242,0.3)", color: "#FBF8F2", background: "transparent" }}
              onClick={() => navigate("/")}
            >
              Recalculate
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
