import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface CashflowChartProps {
  calculations: {
    cashflowSeries: { year: number; income: number; expenses: number; emi: number; surplus: number }[];
    markers: { year: number; type: string; label: string }[];
  };
}

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

export default function CashflowChart({ calculations }: CashflowChartProps) {
  const [viewType, setViewType] = useState<"monthly" | "yearly">("yearly");
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  // Convert data based on view type
  const chartData = calculations.cashflowSeries.map(item => ({
    year: item.year,
    income: viewType === "monthly" ? item.income / 12 : item.income,
    expenses: viewType === "monthly" ? item.expenses / 12 : item.expenses,
    emi: viewType === "monthly" ? item.emi / 12 : item.emi,
    surplus: viewType === "monthly" ? item.surplus / 12 : item.surplus,
    savings: viewType === "monthly" ? (item.income - item.expenses - item.emi) / 12 : (item.income - item.expenses - item.emi),
  }));

  const retirementYear = calculations.markers.find(m => m.type === 'retirement')?.year;

  const handleExportPDF = () => {
    // This would export the cash flow chart as PDF
    console.log("Exporting cashflow chart as PDF");
  };

  const ChartComponent = chartType === "line" ? LineChart : BarChart;

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
        <Button variant="outline" size="sm" onClick={handleExportPDF} data-testid="button-export-cashflow">
          <Download className="mr-2 h-4 w-4" />
          Export Chart
        </Button>
      </div>

      {/* Chart */}
      <div className="w-full h-80" data-testid="chart-cashflow">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
            <Legend />
            
            {chartType === "line" ? (
              <>
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Expenses"
                />
                <Line
                  type="monotone"
                  dataKey="emi"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="EMI"
                />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Net Savings"
                />
              </>
            ) : (
              <>
                <Bar dataKey="income" fill="#10b981" name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                <Bar dataKey="emi" fill="#f59e0b" name="EMI" />
                <Bar dataKey="savings" fill="#3b82f6" name="Net Savings" />
              </>
            )}
            
            {/* Add retirement marker */}
            {retirementYear && (
              <Line
                dataKey={() => null}
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Retirement"
              />
            )}
          </ChartComponent>
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
        {retirementYear && (
          <div className="flex items-center">
            <div className="w-3 h-1 bg-indigo-500 mr-2" style={{ borderStyle: 'dashed' }}></div>
            <span>Post-Retirement</span>
          </div>
        )}
      </div>
    </div>
  );
}