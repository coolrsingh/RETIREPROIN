interface KpiCardsProps {
  calculations: {
    summary: {
      requiredCorpusAtRetirement: number;
      projectedCorpusAtRetirement: number;
      gap: number;
      retirementYear: number;
      sipRequired?: number;
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

const CARD_BASE: React.CSSProperties = {
  borderRadius: 16,
  padding: "20px 22px",
  background: "#FFFFFF",
  border: "1px solid rgba(232,148,10,0.18)",
  boxShadow: "0 2px 12px rgba(26,18,8,0.06)",
};

const NUM_STYLE: React.CSSProperties = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: "1.5rem",
  fontWeight: 700,
  lineHeight: 1.1,
  marginTop: 4,
};

export default function KpiCards({ calculations }: KpiCardsProps) {
  const { summary } = calculations;
  const yearsToRetirement = calculateYearsToRetirement(summary.retirementYear);
  const funded = summary.gap <= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {/* Required Corpus */}
      <div style={CARD_BASE} data-testid="kpi-required-corpus">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#92660A" }}>
            Required Corpus
          </p>
          <span
            className="flex-shrink-0 flex items-center justify-center rounded-lg"
            style={{ width: 34, height: 34, background: "rgba(232,148,10,0.1)", fontSize: 16 }}
          >
            🎯
          </span>
        </div>
        <p style={{ ...NUM_STYLE, color: "#1A1208" }}>
          {formatCurrency(summary.requiredCorpusAtRetirement)}
        </p>
        <p className="text-xs mt-2" style={{ color: "#64748B" }}>Target retirement corpus needed</p>
      </div>

      {/* Projected Corpus */}
      <div style={CARD_BASE} data-testid="kpi-projected-corpus">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#15803D" }}>
            Projected Corpus
          </p>
          <span
            className="flex-shrink-0 flex items-center justify-center rounded-lg"
            style={{ width: 34, height: 34, background: "rgba(22,163,74,0.1)", fontSize: 16 }}
          >
            📈
          </span>
        </div>
        <p style={{ ...NUM_STYLE, color: funded ? "#15803D" : "#1A1208" }}>
          {formatCurrency(summary.projectedCorpusAtRetirement)}
        </p>
        <p className="text-xs mt-2" style={{ color: "#64748B" }}>Based on current plan</p>
      </div>

      {/* Funding Gap */}
      <div
        style={{
          ...CARD_BASE,
          background: funded ? "rgba(22,163,74,0.05)" : "rgba(241,90,36,0.05)",
          border: funded ? "1px solid rgba(22,163,74,0.25)" : "1px solid rgba(241,90,36,0.25)",
        }}
        data-testid="kpi-funding-gap"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: funded ? "#15803D" : "#C2410C" }}>
            Funding Gap
          </p>
          <span
            className="flex-shrink-0 flex items-center justify-center rounded-lg"
            style={{
              width: 34, height: 34,
              background: funded ? "rgba(22,163,74,0.12)" : "rgba(241,90,36,0.12)",
              fontSize: 16,
            }}
          >
            {funded ? "✅" : "⚠️"}
          </span>
        </div>
        <p style={{ ...NUM_STYLE, color: funded ? "#15803D" : "#C2410C" }}>
          {funded ? "₹0" : formatCurrency(summary.gap)}
        </p>
        <p className="text-xs mt-2" style={{ color: funded ? "#15803D" : "#C2410C" }}>
          {funded ? "On track for retirement" : "Additional savings needed"}
        </p>
      </div>

      {/* Years to Retirement */}
      <div style={CARD_BASE} data-testid="kpi-years-to-retirement">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#92660A" }}>
            Years to Retire
          </p>
          <span
            className="flex-shrink-0 flex items-center justify-center rounded-lg"
            style={{ width: 34, height: 34, background: "rgba(232,148,10,0.1)", fontSize: 16 }}
          >
            📅
          </span>
        </div>
        <p style={{ ...NUM_STYLE, color: "#1A1208" }}>
          {yearsToRetirement}
        </p>
        <p className="text-xs mt-2" style={{ color: "#64748B" }}>Time to build your corpus</p>
      </div>

      {/* SIP Required — only show if there's a gap */}
      {summary.gap > 0 && summary.sipRequired && (
        <div
          style={{
            ...CARD_BASE,
            background: "rgba(232,148,10,0.05)",
            border: "1px solid rgba(232,148,10,0.3)",
          }}
          data-testid="kpi-sip-required"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#92660A" }}>
              SIP Required
            </p>
            <span
              className="flex-shrink-0 flex items-center justify-center rounded-lg"
              style={{ width: 34, height: 34, background: "rgba(232,148,10,0.15)", fontSize: 16 }}
            >
              💰
            </span>
          </div>
          <p style={{ ...NUM_STYLE, color: "#92660A" }}>
            ₹{(summary.sipRequired / 1000).toFixed(0)}K<span style={{ fontSize: "0.85rem", fontWeight: 600 }}>/mo</span>
          </p>
          <p className="text-xs mt-2" style={{ color: "#64748B" }}>To bridge funding gap</p>
        </div>
      )}
    </div>
  );
}
