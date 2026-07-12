import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceLine, Legend } from "recharts";

interface PlanChartProps {
  calculations: {
    netWorthSeries: { year: number; value: number }[];
    markers: { year: number; type: string; label: string }[];
  };
  timeRange?: string;
}

const markerColors = {
  education: "#F15A24",
  marriage: "#ec4899", 
  retirement: "#10b981",
  mini_retirement: "#8b5cf6",
  other: "#6366f1",
};

const markerEmojis = {
  education: "🎓",
  marriage: "💍", 
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
    const data = payload[0].payload;
    const marker = data.marker;
    
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
        <p className="font-medium text-slate-900">Year {label}</p>
        <p className="text-primary-600">
          Net Worth: {formatValue(data.value)}
        </p>
        {marker && (
          <div className="mt-2 p-2 rounded" style={{backgroundColor: `${markerColors[marker.type as keyof typeof markerColors]}20`}}>
            <p className="text-sm font-medium" style={{color: markerColors[marker.type as keyof typeof markerColors]}}>
              {markerEmojis[marker.type as keyof typeof markerEmojis]} {marker.label}
            </p>
          </div>
        )}
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

export default function PlanChart({ calculations, timeRange = "25Y" }: PlanChartProps) {
  // Check if calculations data exists
  if (!calculations || !calculations.netWorthSeries || !Array.isArray(calculations.netWorthSeries)) {
    return (
      <div className="w-full h-80 flex items-center justify-center" data-testid="chart-net-worth">
        <p className="text-slate-500">Loading chart data...</p>
      </div>
    );
  }

  // Ensure markers array exists
  const markers = calculations.markers || [];

  // Filter data based on time range
  const currentYear = new Date().getFullYear();
  let maxYear = currentYear + 25; // Default 25 years
  
  if (timeRange === "10Y") {
    maxYear = currentYear + 10;
  } else if (timeRange === "Life" && calculations.netWorthSeries.length > 0) {
    maxYear = Math.max(...calculations.netWorthSeries.map(item => item.year));
  }
  
  // Filter net worth series and markers based on time range
  const filteredNetWorth = calculations.netWorthSeries.filter(item => item.year <= maxYear);
  const filteredMarkers = markers.filter(marker => marker.year <= maxYear);
  
  // Find retirement year to differentiate pre/post retirement
  const retirementYear = markers.find(m => m.type === 'retirement')?.year;
  
  // Combine filtered net worth data with markers and retirement status
  const chartData = filteredNetWorth.map(item => {
    const marker = filteredMarkers.find(m => m.year === item.year);
    const isPostRetirement = retirementYear && item.year > retirementYear;
    return {
      year: item.year,
      value: item.value,
      marker,
      isPostRetirement,
    };
  });

  // Ensure we have valid data before rendering
  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center" data-testid="chart-net-worth">
        <p className="text-slate-500">No data available for chart</p>
      </div>
    );
  }

  return (
    <div className="w-full h-80" data-testid="chart-net-worth">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="year" 
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            type="number"
            domain={['dataMin', 'dataMax']}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatValue}
            type="number"
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
          {/* Add markers for lifecycle events */}
          {filteredMarkers.map(marker => {
            const dataPoint = chartData.find(d => d.year === marker.year);
            if (!dataPoint) return null;
            
            return (
              <ReferenceDot
                key={`marker-${marker.year}-${marker.type}`}
                x={marker.year}
                y={dataPoint.value}
                r={11}
                fill={markerColors[marker.type as keyof typeof markerColors] || markerColors.other}
                stroke="white"
                strokeWidth={2}
                label={{
                  value: marker.type === 'education' ? `🎓 ${marker.label}` :
                         marker.type === 'marriage' ? `💍 ${marker.label}` :
                         marker.type === 'retirement' ? '🧓 Retirement' :
                         marker.type === 'mini_retirement' ? '☕ Mini-Retirement' :
                         marker.label || marker.type,
                  position: 'top',
                  fontSize: 10,
                  fill: markerColors[marker.type as keyof typeof markerColors] || markerColors.other
                }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
      
      {/* Enhanced Legend with Colors */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span>Net Worth Projection</span>
        </div>
        {filteredMarkers.some(m => m.type === 'education') && (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
            <span>Child Education</span>
          </div>
        )}
        {filteredMarkers.some(m => m.type === 'marriage') && (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
            <span>Child Marriage</span>
          </div>
        )}
        {filteredMarkers.some(m => m.type === 'retirement') && (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Retirement</span>
          </div>
        )}
        {filteredMarkers.some(m => m.type === 'mini_retirement') && (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span>Mini Retirement</span>
          </div>
        )}
      </div>
    </div>
  );
}
