/**
 * Tests that the Tax Regime row in AssumptionsPanel reflects the CRM default.
 *
 * Covers:
 *  - "Old Regime" label when crmDefaults.taxRegime === 'old'
 *  - "New Regime" label when crmDefaults.taxRegime === 'new'
 *  - Defaults to "New Regime" when taxRegime is null / undefined
 *  - Display updates when crmDefaults prop changes (settings change → re-render)
 */

import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/lib/queryClient", () => ({
  queryClient: new QueryClient(),
  apiRequest: vi.fn(),
}));

vi.mock("@workspace/api-client-react", () => ({
  useUpdateScenario: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  getListScenariosQueryKey: () => ["scenarios", "list"],
}));

// Import after mocks
import AssumptionsPanel from "@/components/assumptions-panel";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const BASE_SCENARIO = {
  id: "sc-test-001",
  assumptions: {
    inflationHeadline: "6.0",
    inflationEdu: "8.0",
    inflationHealth: "7.0",
    returnPre: "10.0",
    returnPost: "7.0",
    lifeExpectancy: 85,
    source: "crm",
  },
};

function renderPanel(crmDefaults: { taxRegime?: string | null } | null | undefined) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <AssumptionsPanel scenario={BASE_SCENARIO} crmDefaults={crmDefaults} />
    </QueryClientProvider>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// "Old Regime" display
// ---------------------------------------------------------------------------

describe("AssumptionsPanel – Tax Regime row (Old Regime)", () => {
  it('shows "Old Regime" when crmDefaults.taxRegime is "old"', () => {
    renderPanel({ taxRegime: "old" });
    expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("Old Regime");
  });

  it('does not show "New Regime" when taxRegime is "old"', () => {
    renderPanel({ taxRegime: "old" });
    expect(screen.getByTestId("assumption-tax-regime")).not.toHaveTextContent("New Regime");
  });
});

// ---------------------------------------------------------------------------
// "New Regime" display
// ---------------------------------------------------------------------------

describe("AssumptionsPanel – Tax Regime row (New Regime)", () => {
  it('shows "New Regime" when crmDefaults.taxRegime is "new"', () => {
    renderPanel({ taxRegime: "new" });
    expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("New Regime");
  });

  it('does not show "Old Regime" when taxRegime is "new"', () => {
    renderPanel({ taxRegime: "new" });
    expect(screen.getByTestId("assumption-tax-regime")).not.toHaveTextContent("Old Regime");
  });
});

// ---------------------------------------------------------------------------
// Fallback / edge cases
// ---------------------------------------------------------------------------

describe("AssumptionsPanel – Tax Regime row (fallback)", () => {
  it('shows "New Regime" when taxRegime is null (defaults to new)', () => {
    renderPanel({ taxRegime: null });
    expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("New Regime");
  });

  it('shows "New Regime" when taxRegime is undefined', () => {
    renderPanel({ taxRegime: undefined });
    expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("New Regime");
  });

  it('shows "New Regime" when crmDefaults is null', () => {
    renderPanel(null);
    expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("New Regime");
  });

  it('shows "New Regime" when crmDefaults is undefined', () => {
    renderPanel(undefined);
    expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("New Regime");
  });
});

// ---------------------------------------------------------------------------
// Settings change → display updates
// ---------------------------------------------------------------------------

describe("AssumptionsPanel – Tax Regime updates after a settings change", () => {
  it('re-renders "New Regime" after taxRegime changes from "old" to "new"', () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Initial render: Old Regime (the current CRM setting)
    const { rerender } = render(
      <QueryClientProvider client={qc}>
        <AssumptionsPanel scenario={BASE_SCENARIO} crmDefaults={{ taxRegime: "old" }} />
      </QueryClientProvider>
    );

    expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("Old Regime");

    // Admin saves New Regime in CRM Settings → parent re-fetches and passes new prop
    rerender(
      <QueryClientProvider client={qc}>
        <AssumptionsPanel scenario={BASE_SCENARIO} crmDefaults={{ taxRegime: "new" }} />
      </QueryClientProvider>
    );

    expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("New Regime");
    expect(screen.getByTestId("assumption-tax-regime")).not.toHaveTextContent("Old Regime");
  });

  it('re-renders "Old Regime" after taxRegime changes from "new" to "old"', () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { rerender } = render(
      <QueryClientProvider client={qc}>
        <AssumptionsPanel scenario={BASE_SCENARIO} crmDefaults={{ taxRegime: "new" }} />
      </QueryClientProvider>
    );

    expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("New Regime");

    rerender(
      <QueryClientProvider client={qc}>
        <AssumptionsPanel scenario={BASE_SCENARIO} crmDefaults={{ taxRegime: "old" }} />
      </QueryClientProvider>
    );

    expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("Old Regime");
    expect(screen.getByTestId("assumption-tax-regime")).not.toHaveTextContent("New Regime");
  });

  it("always shows the label matching the most recently passed crmDefaults", () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { rerender } = render(
      <QueryClientProvider client={qc}>
        <AssumptionsPanel scenario={BASE_SCENARIO} crmDefaults={{ taxRegime: "new" }} />
      </QueryClientProvider>
    );

    // Cycle: new → old → new
    const cycles: Array<"old" | "new"> = ["old", "new", "old", "new"];
    for (const regime of cycles) {
      rerender(
        <QueryClientProvider client={qc}>
          <AssumptionsPanel scenario={BASE_SCENARIO} crmDefaults={{ taxRegime: regime }} />
        </QueryClientProvider>
      );
      const expected = regime === "old" ? "Old Regime" : "New Regime";
      const unexpected = regime === "old" ? "New Regime" : "Old Regime";
      expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent(expected);
      expect(screen.getByTestId("assumption-tax-regime")).not.toHaveTextContent(unexpected);
    }
  });
});
