import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";

interface PlanChartProps {
  calculations: {
    netWorthSeries: { year: number; value: number }[];
    markers: { year: number; type: string; label: string }[];
  };
}

const markerColors = {
  education: "#3b82f6",
  marriage: "#ec4899", 
  mini: "#f59e0b",
  retirement: "#10b981",
  other: "#6366f1",
};

const markerEmojis = {
  education: "🎓",
  marriage: "💍", 
  mini: "⏸",
  retirement: "🧓",
  other: "📍",
};

const formatValue = (value: number) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(0)}K`;
  }
  return `₹${value.toFixed(0)}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
        <p className="font-medium text-slate-900">Year {label}</p>
        <p className="text-primary-600">
          Net Worth: {formatValue(value)}
        </p>
      </div>
    );
  }
  return null;
};

const CustomMarker = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload || !payload.marker) return null;

  const marker = payload.marker;
  const color = markerColors[marker.type as keyof typeof markerColors] || markerColors.other;
  
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={12}
        fill={color}
        stroke="white"
        strokeWidth={2}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fill="white"
      >
        {markerEmojis[marker.type as keyof typeof markerEmojis] || "📍"}
      </text>
    </g>
  );
};

export default function PlanChart({ calculations }: PlanChartProps) {
  // Combine net worth data with markers
  const chartData = calculations.netWorthSeries.map(item => {
    const marker = calculations.markers.find(m => m.year === item.year);
    return {
      ...item,
      marker,
    };
  });

  return (
    <div className="w-full h-80" data-testid="chart-net-worth">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="year" 
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatValue}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: "#3b82f6" }}
          />
          {/* Render markers */}
          {calculations.markers.map(marker => {
            const dataPoint = chartData.find(d => d.year === marker.year);
            if (!dataPoint) return null;
            
            return (
              <ReferenceDot
                key={`${marker.year}-${marker.type}`}
                x={marker.year}
                y={dataPoint.value}
                r={12}
                fill={markerColors[marker.type as keyof typeof markerColors] || markerColors.other}
                stroke="white"
                strokeWidth={2}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
      
      {/* Chart Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary-500 rounded-full mr-2"></div>
          <span>Net Worth</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span>Education</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
          <span>Marriage</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span>Mini Retirement</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span>Retirement</span>
        </div>
      </div>
    </div>
  );
}
