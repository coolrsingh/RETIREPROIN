import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Area
} from "recharts";

interface SavingsInsightsChartProps {
  calculations: {
    cashflowSeries: { year: number; income: number; expenses: number; surplus: number }[];
    summary: {
      retirementYear: number;
    };
  };
}

const fmt = (v: number) => {
  const abs = Math.abs(v);
  if (abs >= 1_00_00_000) return `₹${(v / 1_00_00_000).toFixed(1)}Cr`;
  if (abs >= 1_00_000) return `₹${(v / 1_00_000).toFixed(1)}L`;
  if (abs >= 1_000) return `₹${(v / 1_000).toFixed(0)}K`;
  return `₹${v.toFixed(0)}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-4 min-w-[200px]">
      <p className="font-bold text-slate-800 mb-2">Year {label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4 text-sm">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-semibold text-slate-800">
            {p.name === "Savings Rate" ? `${p.value?.toFixed(1)}%` : fmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function SavingsInsightsChart({ calculations }: SavingsInsightsChartProps) {
  const { cashflowSeries, summary } = calculations;
  const retirementYear = summary.retirementYear;

  const preRetirement = cashflowSeries
    .filter(d => d.year < retirementYear)
    .map(d => {
      const annualIncome = d.income;
      const annualExpenses = d.expenses;
      const annualSurplus = d.surplus;
      const savingsRate = annualIncome > 0 ? (annualSurplus / annualIncome) * 100 : 0;
      return {
        year: d.year,
        Income: Math.round(annualIncome / 12),
        Expenses: Math.round(annualExpenses / 12),
        Savings: Math.round(annualSurplus / 12),
        "Savings Rate": Math.max(0, savingsRate),
      };
    });

  if (!preRetirement.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500">Monthly income, expenses, and savings (pre-retirement years)</p>
      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={preRetirement} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
            <defs>
              <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} width={65} />
            <YAxis yAxisId="right" orientation="right" fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={v => `${v.toFixed(0)}%`} width={45} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar yAxisId="left" dataKey="Income" fill="#3b82f620" stroke="#3b82f6" strokeWidth={1} radius={[3, 3, 0, 0]} />
            <Bar yAxisId="left" dataKey="Expenses" fill="#f97316" fillOpacity={0.15} stroke="#f97316" strokeWidth={1} radius={[3, 3, 0, 0]} />
            <Area yAxisId="left" type="monotone" dataKey="Savings" stroke="#10b981" strokeWidth={2} fill="url(#savingsGrad)" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="Savings Rate" stroke="#8b5cf6" strokeWidth={2} dot={false} strokeDasharray="4 2" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
