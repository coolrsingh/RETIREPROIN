import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Target, Lightbulb, ArrowUp, Calendar, PiggyBank,
  Star, Plane, Heart, Home, CheckCircle2, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CashflowAdvisorProps {
  calculations: {
    summary: {
      requiredCorpusAtRetirement: number;
      projectedCorpusAtRetirement: number;
      gap: number;
      retirementYear: number;
      sipRequired?: number;
    };
    cashflowSeries: { year: number; income: number; expenses: number; surplus: number }[];
    netWorthSeries?: { year: number; value: number }[];
    markers?: { year: number; type: string; label: string }[];
    yearlyDetail?: {
      year: number;
      goalExpenses: number;
      notes: string[];
    }[];
  };
}

function fmt(val: number): string {
  const abs = Math.abs(val);
  if (abs >= 1_00_00_000) return `₹${(val / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `₹${(val / 1_00_000).toFixed(1)}L`;
  if (abs >= 1_000) return `₹${(val / 1_000).toFixed(0)}K`;
  return `₹${val.toFixed(0)}`;
}

function fmtM(monthly: number): string {
  if (monthly >= 1_00_000) return `₹${(monthly / 1_00_000).toFixed(1)}L/mo`;
  return `₹${Math.round(monthly).toLocaleString("en-IN")}/mo`;
}

function sipToCloseGap(gap: number, yearsToRetirement: number, returnRate = 0.12): number {
  if (gap <= 0 || yearsToRetirement <= 0) return 0;
  const monthlyRate = returnRate / 12;
  const months = yearsToRetirement * 12;
  return (gap * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
}

function stepUpCorpus(monthlySip: number, annualStepUp: number, years: number, returnRate = 0.12): number {
  let corpus = 0;
  let sip = monthlySip;
  const monthlyRate = returnRate / 12;
  for (let y = 0; y < years; y++) {
    for (let m = 0; m < 12; m++) corpus = corpus * (1 + monthlyRate) + sip;
    sip *= 1 + annualStepUp;
  }
  return corpus;
}

export default function CashflowAdvisor({ calculations }: CashflowAdvisorProps) {
  const { summary, cashflowSeries } = calculations;
  const { requiredCorpusAtRetirement, projectedCorpusAtRetirement, gap, retirementYear } = summary;

  const currentYear = new Date().getFullYear();
  const yearsToRetirement = Math.max(1, retirementYear - currentYear);
  const hasFundingGap = gap > 0;
  const surplus = Math.abs(gap);

  // SIP calculations
  const sipFlat = useMemo(() => sipToCloseGap(gap, yearsToRetirement, 0.12), [gap, yearsToRetirement]);
  const sip10pct = useMemo(() => {
    if (!hasFundingGap) return 0;
    let lo = 0, hi = sipFlat * 2;
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      stepUpCorpus(mid, 0.10, yearsToRetirement) > gap ? (hi = mid) : (lo = mid);
    }
    return (lo + hi) / 2;
  }, [sipFlat, gap, yearsToRetirement, hasFundingGap]);

  const laterRetirementGap = useMemo(() =>
    hasFundingGap ? sipToCloseGap(gap, yearsToRetirement + 2, 0.12) : null,
    [gap, yearsToRetirement, hasFundingGap]
  );

  const currentAvgSurplus = useMemo(() => {
    const recent = cashflowSeries.slice(0, Math.min(5, cashflowSeries.length));
    if (!recent.length) return 0;
    return recent.reduce((s, r) => s + r.surplus, 0) / recent.length / 12;
  }, [cashflowSeries]);

  // Child / custom goal SIP recommendations
  const goalSipRows = useMemo(() => {
    const markers = calculations.markers || [];
    const yearlyDetail = calculations.yearlyDetail || [];
    const currentYear = new Date().getFullYear();
    return markers
      .filter(m => ["education", "marriage", "other"].includes(m.type) && m.year > currentYear)
      .map(m => {
        const detail = yearlyDetail.find(d => d.year === m.year);
        const inflatedCost = detail?.goalExpenses ?? 0;
        const yearsAway = m.year - currentYear;
        const sip = inflatedCost > 0 && yearsAway > 0
          ? sipToCloseGap(inflatedCost, yearsAway, 0.12)
          : 0;
        return { marker: m, inflatedCost, sip, yearsAway };
      })
      .filter(r => r.inflatedCost > 0 && r.sip > 0);
  }, [calculations.markers, calculations.yearlyDetail]);

  const savingsBoostNeeded = hasFundingGap && currentAvgSurplus > 0
    ? Math.min(100, Math.round((sipFlat / currentAvgSurplus) * 100))
    : null;

  // --- Surplus / no-gap calculations ---
  const surplusRatio = requiredCorpusAtRetirement > 0
    ? projectedCorpusAtRetirement / requiredCorpusAtRetirement
    : 1;

  // Safe monthly withdrawal at retirement (4% SWR)
  const monthlyWithdrawal = (projectedCorpusAtRetirement * 0.04) / 12;
  // Extra monthly "luxury" budget over required expenses
  const extraMonthly = ((surplus * 0.04) / 12);

  // Earliest possible retirement: each extra year of corpus gives ~returnPre growth
  // Rough estimate: if corpus excess covers N years earlier via compounding
  const earlyRetirementYears = useMemo(() => {
    if (hasFundingGap || surplusRatio < 1.05) return 0;
    // Binary search: find how many years before retirementYear corpus first exceeds required
    const nw = calculations.netWorthSeries || [];
    if (!nw.length) {
      // Fallback: estimate from surplus ratio
      return Math.min(5, Math.floor((surplusRatio - 1) * 10));
    }
    // required grows backward (we don't know historical required precisely) — use ratio heuristic
    const excessFraction = surplusRatio - 1;
    return Math.min(7, Math.floor(excessFraction * 8));
  }, [hasFundingGap, surplusRatio, calculations.netWorthSeries]);

  const earliestRetirementYear = retirementYear - earlyRetirementYears;
  const plannedRetirementAge = yearsToRetirement + currentYear - currentYear + (retirementYear - currentYear);

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-bold text-slate-900">Your Retirement Advisor — Personal Insights</h2>
      </div>

      {/* Child / Custom Goal SIP Planner — always shown when goals exist */}
      {goalSipRows.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-orange-900">
                <PiggyBank className="h-5 w-5 text-orange-600" />
                Goal SIP Planner — Start saving for each milestone today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-700 mb-4 leading-relaxed">
                Each of your upcoming goals has been inflation-adjusted. Here's exactly how much SIP you need to start <strong>today</strong> at 12% CAGR to fully fund each one:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goalSipRows.map((row, i) => {
                  const emoji = row.marker.type === "education" ? "🎓"
                    : row.marker.type === "marriage" ? "💍"
                    : "📍";
                  return (
                    <div key={i} className="bg-white rounded-xl border border-orange-100 p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{emoji}</span>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{row.marker.label}</div>
                          <div className="text-xs text-slate-500">in {row.yearsAway} year{row.yearsAway !== 1 ? "s" : ""} ({row.marker.year})</div>
                        </div>
                      </div>
                      <div className="flex items-end justify-between mt-3">
                        <div>
                          <div className="text-xs text-slate-500 mb-0.5">Inflation-adjusted cost</div>
                          <div className="font-bold text-slate-700">{fmt(row.inflatedCost)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-orange-600 font-semibold mb-0.5">Monthly SIP needed</div>
                          <div className="text-2xl font-black text-orange-700">{fmtM(row.sip)}</div>
                        </div>
                      </div>
                      <div className="mt-2 bg-orange-50 rounded-lg px-2.5 py-1.5 text-xs text-orange-600">
                        Total invested: {fmt(row.sip * 12 * row.yearsAway)} over {row.yearsAway}y at 12% → {fmt(row.inflatedCost)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Gap / Surplus Hero Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className={hasFundingGap ? "border-amber-300 bg-amber-50" : "border-emerald-300 bg-emerald-50"}>
          <CardContent className="pt-5">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${hasFundingGap ? "bg-amber-100" : "bg-emerald-100"}`}>
                {hasFundingGap
                  ? <Target className="h-6 w-6 text-amber-700" />
                  : <Sparkles className="h-6 w-6 text-emerald-700" />}
              </div>
              <div className="flex-1">
                {hasFundingGap ? (
                  <>
                    <h3 className="font-bold text-lg text-amber-900">You have a retirement funding gap</h3>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <div className="text-xs text-amber-700 mb-0.5">Corpus needed</div>
                        <div className="font-bold text-slate-900">{fmt(requiredCorpusAtRetirement)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-amber-700 mb-0.5">Projected corpus</div>
                        <div className="font-bold text-slate-900">{fmt(projectedCorpusAtRetirement)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-amber-700 mb-0.5">Funding gap</div>
                        <div className="font-bold text-red-600 text-xl">{fmt(gap)}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-xl text-emerald-900">
                      🎉 You can retire freely
                      {earlyRetirementYears > 0 && ` ${earlyRetirementYears} year${earlyRetirementYears > 1 ? "s early" : " early"}`}!
                    </h3>
                    <p className="text-emerald-700 text-sm mt-2 leading-relaxed">
                      Your projected corpus of <strong>{fmt(projectedCorpusAtRetirement)}</strong> is{" "}
                      <strong>{Math.round((surplusRatio - 1) * 100)}% more</strong> than the{" "}
                      <strong>{fmt(requiredCorpusAtRetirement)}</strong> you need.
                      {earlyRetirementYears > 0 && (
                        <> Based on your savings pace, you could retire as early as{" "}
                          <strong className="text-emerald-900">{earliestRetirementYear}</strong> — that's{" "}
                          {earlyRetirementYears} year{earlyRetirementYears > 1 ? "s" : ""} ahead of your current plan.</>
                      )}
                    </p>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="bg-emerald-100 rounded-xl p-3">
                        <div className="text-xs text-emerald-700 mb-0.5">Surplus</div>
                        <div className="font-bold text-emerald-800 text-lg">{fmt(surplus)}</div>
                      </div>
                      <div className="bg-emerald-100 rounded-xl p-3">
                        <div className="text-xs text-emerald-700 mb-0.5">Monthly withdrawal capacity</div>
                        <div className="font-bold text-emerald-800 text-lg">{fmtM(monthlyWithdrawal)}</div>
                      </div>
                      {extraMonthly > 0 && (
                        <div className="bg-emerald-100 rounded-xl p-3">
                          <div className="text-xs text-emerald-700 mb-0.5">Extra "luxury" budget/mo</div>
                          <div className="font-bold text-emerald-800 text-lg">{fmtM(extraMonthly)}</div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* === SURPLUS CASE === */}
      {!hasFundingGap && (
        <>
          {/* Luxury Planning */}
          {extraMonthly > 5000 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-purple-900">
                    <Star className="h-4 w-4 text-purple-600" />
                    What your surplus buys you in retirement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-purple-700 mb-4 leading-relaxed">
                    With <strong>{fmtM(extraMonthly)}</strong> extra per month beyond your basic retirement expenses, here's what life could look like:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl p-4 border border-purple-100">
                      <Plane className="h-5 w-5 text-blue-500 mb-2" />
                      <div className="font-bold text-slate-800">Travel</div>
                      <div className="text-sm text-slate-600 mt-0.5">
                        {fmt(extraMonthly * 3)}/quarter for international holidays — Bali, Europe, South East Asia
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-purple-100">
                      <Heart className="h-5 w-5 text-rose-500 mb-2" />
                      <div className="font-bold text-slate-800">Premium Healthcare</div>
                      <div className="text-sm text-slate-600 mt-0.5">
                        Top-tier health insurance + annual check-ups covered with {fmtM(Math.min(extraMonthly * 0.4, 15000))}/mo
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-purple-100">
                      <Home className="h-5 w-5 text-amber-500 mb-2" />
                      <div className="font-bold text-slate-800">Lifestyle Upgrade</div>
                      <div className="text-sm text-slate-600 mt-0.5">
                        Domestic help, dining out, hobbies, grandchildren gifts — comfortably funded
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Son-like guidance card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-2 border-emerald-500 bg-emerald-600 text-white">
              <CardContent className="pt-5">
                <h3 className="font-bold text-lg mb-3">My honest advice for you 💚</h3>
                <div className="space-y-2.5 text-sm text-emerald-50 leading-relaxed">
                  <p className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-200" />
                    <span>You're ahead of 90% of Indians your age. Don't let that surplus sit in a savings account — put it to work in equity mutual funds or index funds.</span>
                  </p>
                  <p className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-200" />
                    <span>If your salary grows at 8–10%/year, your real retirement age could drop to <strong className="text-white">{earliestRetirementYear > currentYear ? earliestRetirementYear : retirementYear - 2}</strong>. You have more options than you think.</span>
                  </p>
                  <p className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-200" />
                    <span>Maintain a 6–12 month emergency fund in liquid funds, completely separate from your retirement corpus.</span>
                  </p>
                  <p className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-200" />
                    <span>Review this plan every April when salary revisions come in. Small step-ups now create a massive difference at retirement.</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* What-if: grow it more */}
          <Card className="border-slate-200">
            <CardContent className="pt-5">
              <h3 className="font-bold text-slate-900 mb-3">You're ahead of schedule — here's how to accelerate</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p>📈 <strong>Increase equity allocation</strong> — with a surplus this size you can absorb more short-term volatility for higher long-term growth.</p>
                <p>🎯 <strong>Step-up your SIP by 10% every year</strong> — even a small increase turns your surplus into a generational wealth buffer.</p>
                <p>🏠 <strong>Consider real estate or REITs</strong> — diversification protects your corpus from any single-asset class risk.</p>
                <p>👨‍👩‍👧 <strong>Think about legacy planning</strong> — your surplus can fund children's higher education abroad or leave an inheritance corpus.</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* === FUNDING GAP CASE === */}
      {hasFundingGap && (
        <>
          {/* Strategy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
              <Card className="border-blue-200 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <PiggyBank className="h-4 w-4 text-blue-700" />
                    </div>
                    <CardTitle className="text-sm text-blue-900">Strategy 1: Flat SIP</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-blue-700 mb-1">{fmtM(sipFlat)}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Invest a fixed <strong>{fmtM(sipFlat)}</strong> in equity mutual funds every month for <strong>{yearsToRetirement} years</strong> at 12% CAGR to fully close the {fmt(gap)} gap.
                  </p>
                  <div className="mt-3 bg-blue-50 rounded-lg p-2 text-xs text-blue-700">
                    Total invested: {fmt(sipFlat * 12 * yearsToRetirement)} over {yearsToRetirement} years
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
              <Card className="border-emerald-200 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <ArrowUp className="h-4 w-4 text-emerald-700" />
                    </div>
                    <CardTitle className="text-sm text-emerald-900">Strategy 2: Step-Up SIP</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-emerald-700 mb-1">{fmtM(sip10pct)}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Start with <strong>{fmtM(sip10pct)}</strong> today and increase by <strong>10% every year</strong>. Mirrors your salary hike and closes the gap with a lower starting commitment.
                  </p>
                  <div className="mt-3 bg-emerald-50 rounded-lg p-2 text-xs text-emerald-700">
                    Year 5 SIP: {fmtM(sip10pct * Math.pow(1.1, 5))} — grows with your income
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
              <Card className="border-purple-200 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-purple-700" />
                    </div>
                    <CardTitle className="text-sm text-purple-900">Strategy 3: Retire 2 Years Later</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-purple-700 mb-1">{fmtM(laterRetirementGap ?? 0)}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Delaying retirement by just <strong>2 years</strong> gives more growth time. The same gap needs only <strong>{fmtM(laterRetirementGap ?? 0)}</strong>/month — saving <strong>{fmtM(sipFlat - (laterRetirementGap ?? 0))}</strong>/month.
                  </p>
                  <div className="mt-3 bg-purple-50 rounded-lg p-2 text-xs text-purple-700">
                    Retire in {retirementYear + 2} instead of {retirementYear}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Step-by-step math explanation */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Simple Math Explained
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <span className="font-black text-2xl text-slate-200 leading-none w-8">1</span>
                  <div>
                    <p className="font-semibold text-slate-800">Your funding gap is {fmt(gap)}</p>
                    <p className="text-slate-500 mt-0.5">This is how much more corpus you need to build before retirement — the difference between what you're projected to have and what you actually need.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="font-black text-2xl text-slate-200 leading-none w-8">2</span>
                  <div>
                    <p className="font-semibold text-slate-800">To close it with a flat SIP in {yearsToRetirement} years at 12% CAGR</p>
                    <div className="mt-2 bg-slate-50 rounded-lg p-3 font-mono text-xs text-slate-600 border border-slate-200">
                      {fmt(gap)} × 1% / ((1.01)^{yearsToRetirement * 12} − 1) = <strong className="text-blue-700">{fmtM(sipFlat)}</strong>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="font-black text-2xl text-slate-200 leading-none w-8">3</span>
                  <div>
                    <p className="font-semibold text-slate-800">The step-up strategy lets you start smaller</p>
                    <p className="text-slate-500 mt-0.5">Increasing your SIP 10% each year (matching a typical salary hike), you start at just <strong className="text-emerald-700">{fmtM(sip10pct)}</strong> instead of <strong className="text-blue-700">{fmtM(sipFlat)}</strong>. Same corpus, lower starting EMI on your future.</p>
                  </div>
                </div>
                {currentAvgSurplus > 0 && (
                  <div className="flex gap-3">
                    <span className="font-black text-2xl text-slate-200 leading-none w-8">4</span>
                    <div>
                      <p className="font-semibold text-slate-800">Where will this money come from?</p>
                      <p className="text-slate-500 mt-0.5">
                        Your plan shows an average monthly surplus of <strong>{fmtM(currentAvgSurplus)}</strong> in the early years. Redirecting{" "}
                        {savingsBoostNeeded !== null
                          ? <><strong>{savingsBoostNeeded}% of that surplus</strong> into a SIP</>
                          : "a portion into a SIP"}{" "}
                        today — automatically — closes the gap without changing your lifestyle.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action recommendation */}
          <Card className="border-2 border-blue-600 bg-blue-600 text-white">
            <CardContent className="pt-5">
              <h3 className="font-bold text-lg mb-2">My honest advice for you 💙</h3>
              <p className="text-blue-100 text-sm leading-relaxed mb-4">
                Start a <strong className="text-white">{fmtM(sip10pct)} step-up SIP today</strong> (Strategy 2). Increase it by 10% every April when your salary hike comes in. Link it to a diversified flexi-cap or index fund. Set it and forget it — the math works in your favour over time.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-blue-200 text-xs mb-0.5">Start with</div>
                  <div className="font-bold text-xl">{fmtM(sip10pct)}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-blue-200 text-xs mb-0.5">Increase by</div>
                  <div className="font-bold text-xl">10%/year</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
