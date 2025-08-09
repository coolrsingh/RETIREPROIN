interface KpiCardsProps {
  calculations: {
    summary: {
      requiredCorpusAtRetirement: number;
      projectedCorpusAtRetirement: number;
      gap: number;
      retirementYear: number;
    };
  };
}

const formatCurrency = (value: number) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)} L`;
  }
  return `₹${value.toLocaleString('en-IN')}`;
};

const calculateYearsToRetirement = (retirementYear: number) => {
  const currentYear = new Date().getFullYear();
  return Math.max(0, retirementYear - currentYear);
};

export default function KpiCards({ calculations }: KpiCardsProps) {
  const { summary } = calculations;
  const yearsToRetirement = calculateYearsToRetirement(summary.retirementYear);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" data-testid="kpi-required-corpus">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Required Corpus</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {formatCurrency(summary.requiredCorpusAtRetirement)}
            </p>
          </div>
          <div className="p-3 bg-red-100 rounded-lg">
            <div className="w-6 h-6 text-red-600">🎯</div>
          </div>
        </div>
        <div className="flex items-center mt-4">
          <span className="text-sm text-slate-500">Target retirement corpus needed</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" data-testid="kpi-projected-corpus">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Projected Corpus</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {formatCurrency(summary.projectedCorpusAtRetirement)}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <div className="w-6 h-6 text-blue-600">📈</div>
          </div>
        </div>
        <div className="flex items-center mt-4">
          <span className="text-sm text-slate-500">Based on current plan</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" data-testid="kpi-funding-gap">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Funding Gap</p>
            <p className={`text-2xl font-bold mt-1 ${summary.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {summary.gap > 0 ? formatCurrency(summary.gap) : '₹0'}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${summary.gap > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
            <div className={`w-6 h-6 ${summary.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {summary.gap > 0 ? '⚠️' : '✅'}
            </div>
          </div>
        </div>
        <div className="flex items-center mt-4">
          <span className={`text-sm ${summary.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {summary.gap > 0 ? 'Additional savings needed' : 'On track for retirement'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" data-testid="kpi-years-to-retirement">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Years to Retirement</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {yearsToRetirement}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <div className="w-6 h-6 text-green-600">📅</div>
          </div>
        </div>
        <div className="flex items-center mt-4">
          <span className="text-sm text-slate-500">Time to build your corpus</span>
        </div>
      </div>
    </div>
  );
}
