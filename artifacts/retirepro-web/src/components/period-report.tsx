import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";

interface PeriodReportProps {
  calculations: {
    cashflowSeries: { year: number; income: number; expenses: number; emi: number; surplus: number }[];
    markers: { year: number; type: string; label: string }[];
    yearlyDetail?: {
      year: number;
      age: number;
      income: number;
      regularExpenses: number;
      emiExpenses: number;
      goalExpenses: number;
      totalExpenses: number;
      netSavings: number;
      portfolioReturn: number;
      netWorth: number;
      notes: string[];
    }[];
  };
}

const markerEmojis: Record<string, string> = {
  education: "🎓",
  marriage: "💍",
  retirement: "🧓",
  mini_retirement: "☕",
  other: "📍",
};

function fmt(val: number): string {
  const abs = Math.abs(val);
  if (abs >= 1_00_00_000) return `₹${(val / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `₹${(val / 1_00_000).toFixed(1)}L`;
  if (abs >= 1_000) return `₹${(val / 1_000).toFixed(0)}K`;
  return `₹${Math.round(val)}`;
}

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 min-w-[160px]">
      <p className="font-bold text-slate-800 mb-2 text-sm">Year {label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 text-xs mb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: p.fill }} />
            {p.name}
          </span>
          <span className="font-semibold" style={{ color: p.fill }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function PeriodReport({ calculations }: PeriodReportProps) {
  const [window, setWindow] = useState<5 | 10>(5);
  const currentYear = new Date().getFullYear();
  const endYear = currentYear + window;

  const periodData = calculations.cashflowSeries.filter(
    row => row.year >= currentYear && row.year < endYear
  );

  const totalIncome = periodData.reduce((s, r) => s + r.income, 0);
  const totalExpenses = periodData.reduce((s, r) => s + r.expenses + r.emi, 0);
  const totalSurplus = periodData.reduce((s, r) => s + r.surplus, 0);
  const avgAnnualSavings = periodData.length ? totalSurplus / periodData.length : 0;

  const eventsInPeriod = calculations.markers.filter(
    m => m.year >= currentYear && m.year < endYear
  );

  const chartData = periodData.map(row => ({
    year: row.year,
    Income: row.income,
    Expenses: row.expenses + row.emi,
    Surplus: Math.max(0, row.surplus),
  }));

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              Period Cashflow Report
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Deep-dive into income and expenses for the next {window} years — understand your near-term financial runway
            </p>
          </div>
          <div className="flex items-center gap-2">
            {([5, 10] as const).map(w => (
              <Button
                key={w}
                variant="outline"
                size="sm"
                onClick={() => setWindow(w)}
                className={window === w ? "border-indigo-400 bg-indigo-50 text-indigo-700 font-bold" : ""}
              >
                {w}Y Window
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">Total Income ({window}Y)</span>
            </div>
            <div className="text-xl font-black text-blue-800">{fmt(totalIncome)}</div>
            <div className="text-xs text-blue-600 mt-0.5">{fmt(totalIncome / window / 12)}/month avg</div>
          </div>
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-rose-600" />
              <span className="text-xs font-semibold text-rose-700">Total Outflow ({window}Y)</span>
            </div>
            <div className="text-xl font-black text-rose-800">{fmt(totalExpenses)}</div>
            <div className="text-xs text-rose-600 mt-0.5">{fmt(totalExpenses / window / 12)}/month avg</div>
          </div>
          <div className={`${totalSurplus >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"} border rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <PiggyBank className={`h-4 w-4 ${totalSurplus >= 0 ? "text-emerald-600" : "text-amber-600"}`} />
              <span className={`text-xs font-semibold ${totalSurplus >= 0 ? "text-emerald-700" : "text-amber-700"}`}>Net Savings ({window}Y)</span>
            </div>
            <div className={`text-xl font-black ${totalSurplus >= 0 ? "text-emerald-800" : "text-amber-800"}`}>{fmt(totalSurplus)}</div>
            <div className={`text-xs mt-0.5 ${totalSurplus >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
              {fmt(avgAnnualSavings)}/year avg
            </div>
          </div>
          <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-violet-600" />
              <span className="text-xs font-semibold text-violet-700">
                Savings Rate
              </span>
            </div>
            <div className="text-xl font-black text-violet-800">
              {totalIncome > 0 ? Math.round((totalSurplus / totalIncome) * 100) : 0}%
            </div>
            <div className="text-xs text-violet-600 mt-0.5">of total income saved</div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="w-full mb-5" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 4 }} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} width={68} />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend formatter={(value) => <span className="text-xs font-semibold text-slate-600">{value}</span>} />
              <Bar dataKey="Income" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Surplus" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Events in period */}
        {eventsInPeriod.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Key Events in this period</p>
            <div className="flex flex-wrap gap-2">
              {eventsInPeriod.map(m => (
                <span
                  key={m.type + m.year}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border"
                  style={{
                    borderColor: "rgba(99,102,241,0.3)",
                    background: "rgba(99,102,241,0.07)",
                    color: "#4338ca",
                  }}
                >
                  <span className="text-sm">{markerEmojis[m.type] || "📍"}</span>
                  {m.label}
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white ml-1">{m.year}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {eventsInPeriod.length === 0 && (
          <div className="text-xs text-slate-400 italic">No major milestones scheduled in this {window}-year window.</div>
        )}
      </CardContent>
    </Card>
  );
}
