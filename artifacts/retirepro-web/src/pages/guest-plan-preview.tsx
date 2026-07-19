import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartLine, ArrowLeft, Zap, Lock } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import KpiCards from "@/components/kpi-cards";
import PlanChart from "@/components/plan-chart";
import CashflowChart from "@/components/cashflow-chart";
import CashflowAdvisor from "@/components/cashflow-advisor";

interface GuestForm {
  fullName: string;
  dob: string;
  retirementAge: string;
  monthlyIncomeTotal: string;
  monthlyExpenseTotal: string;
  monthlySavings: string;
  assetsLumpSum: string;
  returnPre: string;
  inflationRate: string;
}

export default function GuestPlanPreview() {
  const [, navigate] = useLocation();
  const [calculations, setCalculations] = useState<any>(null);
  const [guestForm, setGuestForm] = useState<GuestForm | null>(null);
  const [chartTimeRange, setChartTimeRange] = useState("25Y");
  const [expert, setExpert] = useState({ name: "", phone: "", email: "" });
  const [expertStatus, setExpertStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    const raw = sessionStorage.getItem("guestCalcResult");
    const rawForm = sessionStorage.getItem("guestCalcForm");
    if (!raw) {
      navigate("/");
      return;
    }
    try {
      setCalculations(JSON.parse(raw));
      if (rawForm) {
        const parsed = JSON.parse(rawForm);
        setGuestForm(parsed);
        if (parsed?.fullName) setExpert(p => ({ ...p, name: parsed.fullName }));
      }
    } catch {
      navigate("/");
    }
  }, [navigate]);

  const saveLead = async () => {
    if (!expert.phone.trim()) return;
    try {
      setExpertStatus("saving");
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: expert.name.trim() || "Expert enquiry",
          phone: expert.phone.trim(),
          email: expert.email.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setExpertStatus("saved");
    } catch {
      setExpertStatus("error");
    }
  };

  const handleWhatsApp = () => {
    void saveLead();
    const msg = encodeURIComponent(
      `Hi Nidesh Financial, I'd like a free review of my retirement plan${expert.name ? ` (${expert.name})` : ""}.`,
    );
    window.open(`https://wa.me/919819590598?text=${msg}`, "_blank", "noopener,noreferrer");
  };

  const handleEmail = () => {
    void saveLead();
    const subject = encodeURIComponent("Retirement plan review enquiry");
    const body = encodeURIComponent(
      `Hi Nidesh Financial,\n\nI'd like a free, no-obligation review of my retirement plan.\n\nName: ${expert.name || ""}\nPhone: ${expert.phone || ""}\n`,
    );
    window.location.href = `mailto:investments.nidesh@outlook.com?subject=${subject}&body=${body}`;
  };

  if (!calculations) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--ivory)" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  const planName = guestForm?.fullName ? `${guestForm.fullName}'s Retirement Plan` : "Your Retirement Plan";

  const assumptions = {
    inflationHeadline: guestForm?.inflationRate ?? "6",
    returnPre: guestForm?.returnPre ?? "12",
    returnPost: "8",
    lifeExpectancy: 85,
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
            onClick={() => { window.location.href = "/api/login"; }}
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
              You're viewing a preview plan.{" "}
              <button
                onClick={() => { window.location.href = "/api/login"; }}
                className="font-semibold text-[#F15A24] hover:underline"
              >
                Sign in
              </button>{" "}
              to save your plan and unlock Excel export.
            </span>
          </div>
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

        {/* KPI Cards */}
        <KpiCards calculations={calculations} />

        {/* Charts + Assumptions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Net Worth Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Net Worth Projection</CardTitle>
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
                    { label: "Return (Pre-retirement)", value: `${assumptions.returnPre}%` },
                    { label: "Return (Post-retirement)", value: `${assumptions.returnPost}%` },
                    { label: "Life Expectancy", value: `${assumptions.lifeExpectancy} years` },
                    { label: "Retirement Age", value: `${guestForm?.retirementAge ?? 60} years` },
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
                    onClick={() => { window.location.href = "/api/login"; }}
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

        {/* Cashflow Advisor */}
        <Card className="mt-2 mb-8">
          <CardContent className="pt-4">
            <CashflowAdvisor calculations={calculations} />
          </CardContent>
        </Card>

        {/* Talk to an Expert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="expert-card" data-testid="expert-card">
            <div className="expert-card-inner">
              <div className="expert-left">
                <span className="expert-badge">AMFI-Registered Advisor</span>
                <h3 className="expert-title">Want a human to review your plan?</h3>
                <p className="expert-desc">
                  Talk to <strong>Nidesh Financial</strong> — an AMFI-registered mutual fund advisor — for a free,
                  no-obligation review of your retirement projection. Get personalised guidance on SIPs, asset
                  allocation, and how to close your funding gap.
                </p>
                <div className="expert-stats">
                  <span>✅ AMFI-Registered</span>
                  <span>🇮🇳 India-focused</span>
                  <span>💬 Free first consult</span>
                </div>
              </div>
              <div className="expert-right">
                <input
                  className="expert-input"
                  placeholder="Your name"
                  value={expert.name}
                  onChange={e => setExpert(p => ({ ...p, name: e.target.value }))}
                  data-testid="input-expert-name"
                />
                <input
                  className="expert-input"
                  placeholder="Phone / WhatsApp number"
                  value={expert.phone}
                  onChange={e => setExpert(p => ({ ...p, phone: e.target.value }))}
                  data-testid="input-expert-phone"
                />
                <input
                  className="expert-input"
                  type="email"
                  placeholder="Email (optional)"
                  value={expert.email}
                  onChange={e => setExpert(p => ({ ...p, email: e.target.value }))}
                  data-testid="input-expert-email"
                />
                <button className="expert-cta-primary" onClick={handleWhatsApp} data-testid="button-expert-whatsapp">
                  💬 Talk on WhatsApp
                </button>
                <button className="expert-cta-secondary" onClick={handleEmail} data-testid="button-expert-email">
                  ✉️ Email the advisor
                </button>
                {expertStatus === "saved" && (
                  <p style={{ fontSize: 12, color: "#166534", textAlign: "center" }}>
                    Thanks! Your details have been shared with the advisor.
                  </p>
                )}
                {expertStatus === "error" && (
                  <p style={{ fontSize: 12, color: "#B91C1C", textAlign: "center" }}>
                    Couldn't save your details — please use WhatsApp or email directly.
                  </p>
                )}
                <p className="expert-disclaimer">
                  By sharing your details you agree to be contacted by Nidesh Financial. Mutual fund investments are
                  subject to market risks; read all scheme-related documents carefully.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

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
            Create a free account to save your plan, adjust assumptions, download your full Excel report, and get year-by-year projections.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              className="text-white rounded-full px-8 h-12 text-base font-bold"
              style={{ background: "var(--orange)" }}
              onClick={() => { window.location.href = "/api/login"; }}
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
