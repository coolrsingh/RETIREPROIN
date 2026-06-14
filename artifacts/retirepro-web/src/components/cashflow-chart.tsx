import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface CashflowChartProps {
  calculations: {
    cashflowSeries: { year: number; income: number; expenses: number; emi: number; surplus: number }[];
    markers: { year: number; type: string; label: string }[];
  };
  hideExportButton?: boolean;
}

const formatValue = (value: number) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value.toFixed(0)}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
        <p className="font-medium text-slate-900 mb-2">Year {label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {formatValue(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AXIS_PROPS = {
  stroke: "#64748b",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

export default function CashflowChart({ calculations, hideExportButton = false }: CashflowChartProps) {
  const [viewType, setViewType] = useState<"monthly" | "yearly">("yearly");
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const series = calculations?.cashflowSeries ?? [];
  const markers = calculations?.markers ?? [];

  const chartData = series
    .filter(item => !Number.isNaN(item.income) && !Number.isNaN(item.expenses))
    .map(item => ({
      year: item.year,
      income:   viewType === "monthly" ? Math.round(item.income / 12)   : item.income,
      expenses: viewType === "monthly" ? Math.round(item.expenses / 12) : item.expenses,
      emi:      viewType === "monthly" ? Math.round(item.emi / 12)      : item.emi,
      savings:  viewType === "monthly"
        ? Math.round((item.income - item.expenses - item.emi) / 12)
        : (item.income - item.expenses - item.emi),
    }));

  const retirementYear = markers.find(m => m.type === "retirement")?.year;

  if (!series.length) {
    return (
      <div className="h-80 flex items-center justify-center text-slate-400 text-sm">
        No cashflow data available.
      </div>
    );
  }

  const sharedChartProps = {
    data: chartData,
    margin: { top: 20, right: 30, left: 20, bottom: 20 },
  };

  const axisAndGrid = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey="year" {...AXIS_PROPS} />
      <YAxis {...AXIS_PROPS} tickFormatter={formatValue} />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
    </>
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
            <Button
              variant={viewType === "yearly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("yearly")}
              data-testid="button-yearly"
            >
              Yearly
            </Button>
            <Button
              variant={viewType === "monthly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("monthly")}
              data-testid="button-monthly"
            >
              Monthly
            </Button>
          </div>
          <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
            <Button
              variant={chartType === "line" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("line")}
              data-testid="button-line"
            >
              Line
            </Button>
            <Button
              variant={chartType === "bar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("bar")}
              data-testid="button-bar"
            >
              Bar
            </Button>
          </div>
        </div>
        {!hideExportButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            data-testid="button-export-cashflow"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Chart
          </Button>
        )}
      </div>

      {/* Chart */}
      <div className="w-full h-80" data-testid="chart-cashflow">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart {...sharedChartProps}>
              {axisAndGrid}
              <Line type="monotone" dataKey="income"   stroke="#10b981" strokeWidth={2} name="Income"      dot={false} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses"    dot={false} />
              <Line type="monotone" dataKey="emi"      stroke="#f59e0b" strokeWidth={2} name="EMI"         dot={false} />
              <Line type="monotone" dataKey="savings"  stroke="#3b82f6" strokeWidth={2} name="Net Savings" dot={false} />
              {retirementYear != null && (
                <Line
                  dataKey={() => null}
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Retirement"
                  dot={false}
                />
              )}
            </LineChart>
          ) : (
            <BarChart {...sharedChartProps}>
              {axisAndGrid}
              <Bar dataKey="income"   fill="#10b981" name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              <Bar dataKey="emi"      fill="#f59e0b" name="EMI" />
              <Bar dataKey="savings"  fill="#3b82f6" name="Net Savings" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span>Income</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span>Expenses</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span>EMI</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span>Net Savings</span>
        </div>
        {retirementYear != null && (
          <div className="flex items-center">
            <div className="w-3 h-1 bg-indigo-500 mr-2" style={{ borderStyle: "dashed" }}></div>
            <span>Post-Retirement</span>
          </div>
        )}
      </div>
    </div>
  );
}
