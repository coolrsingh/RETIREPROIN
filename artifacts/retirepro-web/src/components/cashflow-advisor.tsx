import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Target, Lightbulb, ArrowUp, Calendar, PiggyBank } from "lucide-react";
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
  const fv = gap;
  const sipAmount = (fv * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
  return sipAmount;
}

function stepUpCorpus(monthlySip: number, annualStepUp: number, yearsToRetirement: number, returnRate = 0.12): number {
  let corpus = 0;
  let sip = monthlySip;
  for (let year = 0; year < yearsToRetirement; year++) {
    const monthlyRate = returnRate / 12;
    for (let month = 0; month < 12; month++) {
      corpus = corpus * (1 + monthlyRate) + sip;
    }
    sip = sip * (1 + annualStepUp);
  }
  return corpus;
}

export default function CashflowAdvisor({ calculations }: CashflowAdvisorProps) {
  const { summary, cashflowSeries } = calculations;
  const { requiredCorpusAtRetirement, projectedCorpusAtRetirement, gap, retirementYear, sipRequired } = summary;

  const yearsToRetirement = Math.max(1, retirementYear - new Date().getFullYear());
  const hasFundingGap = gap > 0;

  const sipFlat = useMemo(() => sipToCloseGap(gap, yearsToRetirement, 0.12), [gap, yearsToRetirement]);
  const sip10pct = useMemo(() => {
    if (!hasFundingGap) return 0;
    let low = 0, high = sipFlat * 2;
    for (let i = 0; i < 50; i++) {
      const mid = (low + high) / 2;
      const corpus = stepUpCorpus(mid, 0.10, yearsToRetirement, 0.12);
      if (corpus > gap) high = mid;
      else low = mid;
    }
    return (low + high) / 2;
  }, [sipFlat, gap, yearsToRetirement, hasFundingGap]);

  const currentAvgSurplus = useMemo(() => {
    const recent = cashflowSeries.slice(0, Math.min(5, cashflowSeries.length));
    if (!recent.length) return 0;
    return recent.reduce((s, r) => s + r.surplus, 0) / recent.length / 12;
  }, [cashflowSeries]);

  const savingsBoostNeeded = hasFundingGap && currentAvgSurplus > 0
    ? Math.min(100, Math.round((sipFlat / currentAvgSurplus) * 100))
    : null;

  const laterRetirementGap = useMemo(() => {
    if (!hasFundingGap) return null;
    return sipToCloseGap(gap, yearsToRetirement + 2, 0.12);
  }, [gap, yearsToRetirement, hasFundingGap]);

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-bold text-slate-900">Cashflow Advisor — What You Should Do</h2>
      </div>

      {/* Gap / Surplus Summary */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className={hasFundingGap ? "border-amber-300 bg-amber-50" : "border-emerald-300 bg-emerald-50"}>
          <CardContent className="pt-5">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${hasFundingGap ? "bg-amber-100" : "bg-emerald-100"}`}>
                {hasFundingGap ? <Target className="h-6 w-6 text-amber-700" /> : <TrendingUp className="h-6 w-6 text-emerald-700" />}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-lg ${hasFundingGap ? "text-amber-900" : "text-emerald-900"}`}>
                  {hasFundingGap ? "You have a retirement funding gap" : "You're on track — great work!"}
                </h3>
                {hasFundingGap ? (
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
                ) : (
                  <p className="text-emerald-700 text-sm mt-1">
                    Your projected corpus of <strong>{fmt(projectedCorpusAtRetirement)}</strong> exceeds the required <strong>{fmt(requiredCorpusAtRetirement)}</strong> — surplus of <strong>{fmt(Math.abs(gap))}</strong>. Consider increasing your equity allocation to maximise long-term growth.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

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
                    Start with <strong>{fmtM(sip10pct)}</strong> today and increase by <strong>10% every year</strong>. This mirrors your typical salary hike and closes the same gap with a lower starting commitment.
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
                    Delaying retirement by just <strong>2 years</strong> gives your corpus more time to grow and reduces your drawdown period. The same gap needs only <strong>{fmtM(laterRetirementGap ?? 0)}</strong>/month to close — a saving of <strong>{fmtM(sipFlat - (laterRetirementGap ?? 0))}</strong> per month.
                  </p>
                  <div className="mt-3 bg-purple-50 rounded-lg p-2 text-xs text-purple-700">
                    2 extra years = {fmt(gap - (laterRetirementGap ?? 0) * 12 * (yearsToRetirement + 2))} less to invest
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
                    <p className="text-slate-500 mt-0.5">Using the SIP future value formula: monthly SIP = Gap × monthly rate / ((1 + rate)^months − 1)</p>
                    <div className="mt-2 bg-slate-50 rounded-lg p-3 font-mono text-xs text-slate-600 border border-slate-200">
                      {fmt(gap)} × 1% / ((1.01)^{yearsToRetirement * 12} − 1) = <strong className="text-blue-700">{fmtM(sipFlat)}</strong>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="font-black text-2xl text-slate-200 leading-none w-8">3</span>
                  <div>
                    <p className="font-semibold text-slate-800">The step-up strategy lets you start smaller</p>
                    <p className="text-slate-500 mt-0.5">By increasing your SIP 10% each year (matching a typical salary hike), you start at just <strong className="text-emerald-700">{fmtM(sip10pct)}</strong> instead of <strong className="text-blue-700">{fmtM(sipFlat)}</strong>. Same corpus, lower starting EMI on your future.</p>
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
              <h3 className="font-bold text-lg mb-2">Our recommendation for you</h3>
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

      {!hasFundingGap && (
        <Card className="border-emerald-200">
          <CardContent className="pt-5">
            <h3 className="font-bold text-emerald-900 mb-2">You're ahead of schedule — here's what to do next</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p>✅ <strong>Increase equity allocation</strong> to maximise long-term growth — with a surplus, you can take more risk.</p>
              <p>✅ <strong>Add a step-up to your SIP</strong> — even 10% more each year turns your surplus into generational wealth.</p>
              <p>✅ <strong>Consider early retirement</strong> — your corpus may support retiring 1–2 years earlier than planned.</p>
              <p>✅ <strong>Set up a separate emergency fund</strong> — keep 6 months' expenses in liquid funds, not your retirement corpus.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
