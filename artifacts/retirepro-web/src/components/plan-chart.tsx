import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface PlanChartProps {
  calculations: {
    netWorthSeries: { year: number; value: number }[];
    markers: { year: number; type: string; label: string }[];
  };
  timeRange?: string;
}

const markerColors: Record<string, string> = {
  education: "#F15A24",
  marriage: "#ec4899",
  retirement: "#10b981",
  mini_retirement: "#8b5cf6",
  other: "#6366f1",
};

const markerEmojis: Record<string, string> = {
  education: "🎓",
  marriage: "💍",
  retirement: "🧓",
  mini_retirement: "☕",
  other: "📍",
};

const formatValue = (value: number) => {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(1)}Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(1)}L`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(0)}K`;
  return `₹${value.toFixed(0)}`;
};

const CustomTooltip = ({ active, payload, label, markers }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  const markerList: any[] = (markers || []).filter((m: any) => m.year === label);
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-4 min-w-[180px]">
      <p className="font-bold text-slate-800 mb-1">Year {label}</p>
      <p className="text-blue-700 font-semibold text-lg">{formatValue(data?.value ?? 0)}</p>
      {markerList.map((m: any) => (
        <div key={m.type + m.year} className="mt-2 rounded-lg px-2 py-1 text-sm font-medium" style={{ background: markerColors[m.type] + "20", color: markerColors[m.type] }}>
          {markerEmojis[m.type] || "📍"} {m.label}
        </div>
      ))}
    </div>
  );
};

// Custom vertical milestone label rendered above the chart
const MilestoneLabel = ({ viewBox, label, color, emoji }: any) => {
  if (!viewBox) return null;
  const { x } = viewBox;
  return (
    <g>
      <rect x={x - 2} y={4} width={4} height={16} rx={2} fill={color} />
      <text x={x} y={22} textAnchor="middle" fontSize={11} fontWeight={700} fill={color}>
        {emoji}
      </text>
      <text x={x} y={34} textAnchor="middle" fontSize={9} fill={color} fontWeight={600} style={{ whiteSpace: "nowrap" }}>
        {label.length > 10 ? label.slice(0, 9) + "…" : label}
      </text>
    </g>
  );
};

export default function PlanChart({ calculations, timeRange = "25Y" }: PlanChartProps) {
  if (!calculations?.netWorthSeries?.length) {
    return (
      <div className="w-full h-80 flex items-center justify-center" data-testid="chart-net-worth">
        <p className="text-slate-500">Loading chart data…</p>
      </div>
    );
  }

  const markers = calculations.markers || [];
  const currentYear = new Date().getFullYear();

  let maxYear = currentYear + 25;
  if (timeRange === "10Y") maxYear = currentYear + 10;
  else if (timeRange === "Life" && calculations.netWorthSeries.length > 0)
    maxYear = Math.max(...calculations.netWorthSeries.map(i => i.year));

  const retirementYear = markers.find(m => m.type === "retirement")?.year;
  const filteredData = calculations.netWorthSeries.filter(i => i.year <= maxYear);
  const filteredMarkers = markers.filter(m => m.year <= maxYear);

  const chartData = filteredData.map(item => ({
    year: item.year,
    value: item.value,
    postRetirement: retirementYear ? (item.year > retirementYear ? item.value : undefined) : undefined,
    preRetirement: retirementYear ? (item.year <= retirementYear ? item.value : undefined) : item.value,
  }));

  if (!chartData.length) {
    return (
      <div className="w-full h-80 flex items-center justify-center" data-testid="chart-net-worth">
        <p className="text-slate-500">No data available</p>
      </div>
    );
  }

  return (
    <div data-testid="chart-net-worth">
      {/* Milestone legend pills */}
      {filteredMarkers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filteredMarkers.map(m => (
            <span
              key={m.type + m.year}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: markerColors[m.type] + "18", color: markerColors[m.type], border: `1px solid ${markerColors[m.type]}40` }}
            >
              {markerEmojis[m.type] || "📍"} {m.label} ({m.year})
            </span>
          ))}
        </div>
      )}

      <div className="w-full" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 40, right: 20, left: 20, bottom: 10 }}>
            <defs>
              <linearGradient id="corpusGradientPre" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="corpusGradientPost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} type="number" domain={["dataMin", "dataMax"]} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatValue} width={70} />
            <Tooltip content={<CustomTooltip markers={filteredMarkers} />} />

            {/* Pre-retirement corpus */}
            <Area type="monotone" dataKey="preRetirement" stroke="#3b82f6" strokeWidth={2.5} fill="url(#corpusGradientPre)" dot={false} activeDot={{ r: 5, fill: "#3b82f6" }} connectNulls />
            {/* Post-retirement corpus (different colour) */}
            <Area type="monotone" dataKey="postRetirement" stroke="#10b981" strokeWidth={2.5} fill="url(#corpusGradientPost)" dot={false} activeDot={{ r: 5, fill: "#10b981" }} connectNulls />

            {/* Vertical milestone lines — always visible */}
            {filteredMarkers.map(m => (
              <ReferenceLine
                key={`refline-${m.type}-${m.year}`}
                x={m.year}
                stroke={markerColors[m.type] || markerColors.other}
                strokeWidth={2}
                strokeDasharray="6 3"
                label={
                  <MilestoneLabel
                    label={m.type === "retirement" ? "Retire" : m.label.split("'s ")[1] || m.label}
                    color={markerColors[m.type] || markerColors.other}
                    emoji={markerEmojis[m.type] || "📍"}
                  />
                }
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend row */}
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-blue-500 inline-block" />Accumulation phase</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-emerald-500 inline-block" />Retirement drawdown</span>
        {filteredMarkers.some(m => m.type === "education") && <span className="flex items-center gap-1.5">🎓 Child Education</span>}
        {filteredMarkers.some(m => m.type === "marriage") && <span className="flex items-center gap-1.5">💍 Child Marriage</span>}
        {filteredMarkers.some(m => m.type === "mini_retirement") && <span className="flex items-center gap-1.5">☕ Mini Retirement</span>}
      </div>
    </div>
  );
}
