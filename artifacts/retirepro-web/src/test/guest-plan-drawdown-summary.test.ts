import { describe, expect, it, vi } from "vitest";

vi.mock("wouter", () => ({
  Link: ({ children }: { children: unknown }) => children,
  useLocation: () => ["/plan/preview", vi.fn()],
}));

import { getDrawdownSummary } from "@/pages/guest-plan-preview";

describe("retired guest plan summary", () => {
  it("reports the first exhaustion year and withdrawal sustainability", () => {
    vi.setSystemTime(new Date("2026-06-01T00:00:00Z"));

    const summary = getDrawdownSummary(
      {
        summary: { projectedCorpusAtRetirement: 9_500_000 },
        netWorthSeries: [
          { year: 2026, value: 9_500_000 },
          { year: 2037, value: 300_000 },
          { year: 2038, value: 0 },
          { year: 2039, value: 0 },
        ],
      },
      {
        fullName: "Retired User",
        personaMode: "retired",
        dob: "1966-01-01",
        retirementAge: "60",
        monthlyIncomeTotal: "0",
        monthlyExpenseTotal: "100000",
        monthlySavings: "0",
        assetsLumpSum: "0",
        currentCorpus: "10000000",
        monthlyWithdrawal: "100000",
        yearsToCover: "25",
        returnPre: "8",
        returnPost: "8",
        inflationRate: "7",
      },
    );

    expect(summary.startingCorpus).toBe(10_000_000);
    expect(summary.exhaustionYear).toBe(2038);
    expect(summary.yearsLasting).toBe(12);
    expect(summary.annualWithdrawalRate).toBe(12);
    expect(summary.isWithinSafeRate).toBe(false);
  });

  it("reports that the corpus lasts through the horizon when it never reaches zero", () => {
    vi.setSystemTime(new Date("2026-06-01T00:00:00Z"));

    const summary = getDrawdownSummary(
      {
        summary: { projectedCorpusAtRetirement: 20_000_000 },
        netWorthSeries: [
          { year: 2026, value: 20_000_000 },
          { year: 2051, value: 8_000_000 },
        ],
      },
      {
        fullName: "Retired User",
        personaMode: "retired",
        dob: "1966-01-01",
        retirementAge: "60",
        monthlyIncomeTotal: "0",
        monthlyExpenseTotal: "50000",
        monthlySavings: "0",
        assetsLumpSum: "0",
        currentCorpus: "20000000",
        monthlyWithdrawal: "50000",
        yearsToCover: "25",
        returnPre: "8",
        returnPost: "8",
        inflationRate: "7",
      },
    );

    expect(summary.exhaustionYear).toBeNull();
    expect(summary.yearsLasting).toBe(25);
    expect(summary.lastsThroughProjection).toBe(true);
    expect(summary.annualWithdrawalRate).toBe(3);
    expect(summary.isWithinSafeRate).toBe(true);
  });
});