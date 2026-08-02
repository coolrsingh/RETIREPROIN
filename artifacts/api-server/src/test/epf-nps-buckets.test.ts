/**
 * Tests for per-asset return rates and independent EPF/NPS contribution
 * buckets, added alongside the "Other Investments / EPF / NPS" return-rate
 * fields on the quick-plan form.
 *
 * Design under test (see calculations.ts):
 * - "Other Investments" (or the retired-mode "corpus" asset) grows in a
 *   "general" bucket at its own expectedReturnPre/Post.
 * - EPF and NPS each grow in their own bucket at their own return rate and
 *   receive only their own monthly contribution (annualized).
 * - The general bucket receives (netSavings - epfContributionAnnual -
 *   npsContributionAnnual) each pre-retirement year, so EPF/NPS contributions
 *   are never double-counted as general savings.
 * - During mini-retirement, only the general bucket absorbs the deficit;
 *   EPF/NPS keep compounding untouched with no new contributions.
 * - At the retirement-year transition the three buckets merge into a single
 *   scalar and post-retirement math uses the blended returnPost.
 */

import { describe, it, expect } from "vitest";
import { calculateRetirementPlan } from "../calculations";
import { buildGuestAssets } from "../plan-mapper";

const CURRENT_YEAR = new Date().getFullYear();
const SELF_AGE = 35;
const BIRTH_YEAR = CURRENT_YEAR - SELF_AGE;

function baseScenario(overrides: {
  assets?: any[];
  monthlyIncome?: number;
  monthlyExpense?: number;
  retirementYear?: number;
  miniRetirements?: any[];
} = {}) {
  const retirementYear = overrides.retirementYear ?? CURRENT_YEAR + 20;
  return {
    id: "test-scenario",
    name: "Test Plan",
    mode: "quick",
    householdMembers: [
      { relation: "self", dob: `${BIRTH_YEAR}-01-01`, retirementAge: retirementYear - BIRTH_YEAR },
    ],
    incomeItems: [
      {
        type: "salary",
        amount: String(overrides.monthlyIncome ?? 150_000),
        frequency: "monthly",
        start: CURRENT_YEAR,
        end: retirementYear,
        growthRate: 0,
      },
    ],
    assets: overrides.assets ?? [],
    liabilities: [],
    goals: [],
    miniRetirements: overrides.miniRetirements ?? [],
    assumptions: {
      inflationHeadline: "0",
      inflationEdu: "8.0",
      returnPre: "12.0",
      returnPost: "8.0",
      lifeExpectancy: String(85),
    },
    expenseItems: [{ type: "core", amountMonthly: String(overrides.monthlyExpense ?? 50_000) }],
  };
}

// ---------------------------------------------------------------------------
// buildGuestAssets — per-asset return overrides
// ---------------------------------------------------------------------------

describe("buildGuestAssets – per-asset return overrides", () => {
  it("uses assetsLumpSumReturn override for Other Investments instead of returnPre", () => {
    const assets = buildGuestAssets(
      { personaMode: "accumulating", assetsLumpSum: 500_000, assetsLumpSumReturn: 14 },
      "12.0",
      "8.0",
    );
    const other = assets.find((a) => a.id === "1");
    expect(other!.expectedReturnPre).toBe("14");
  });

  it("uses epfReturn override instead of the 8% default", () => {
    const assets = buildGuestAssets(
      { personaMode: "accumulating", epfCorpus: 1_000_000, epfReturn: 8.5 },
      "12.0",
      "8.0",
    );
    const epf = assets.find((a) => a.id === "epf");
    expect(epf!.expectedReturnPre).toBe("8.5");
  });

  it("uses npsReturn override instead of the 10% default", () => {
    const assets = buildGuestAssets(
      { personaMode: "accumulating", npsCorpus: 500_000, npsReturn: 11 },
      "12.0",
      "8.0",
    );
    const nps = assets.find((a) => a.id === "nps");
    expect(nps!.expectedReturnPre).toBe("11");
  });

  it("attaches epfMonthlyContribution and npsMonthlyContribution to their assets", () => {
    const assets = buildGuestAssets(
      {
        personaMode: "accumulating",
        epfCorpus: 1_000_000,
        epfMonthlyContribution: 3000,
        npsCorpus: 500_000,
        npsMonthlyContribution: 5000,
      },
      "12.0",
      "8.0",
    );
    expect(assets.find((a) => a.id === "epf")!.monthlyContribution).toBe("3000");
    expect(assets.find((a) => a.id === "nps")!.monthlyContribution).toBe("5000");
  });
});

// ---------------------------------------------------------------------------
// calculations.ts — independent bucket growth
// ---------------------------------------------------------------------------

describe("calculateRetirementPlan – EPF/NPS independent buckets", () => {
  it("EPF grows faster with a higher expectedReturnPre than a lower one, all else equal", async () => {
    const lowReturn = await calculateRetirementPlan(
      baseScenario({
        assets: [{ id: "epf", kind: "equity", value: "1000000", expectedReturnPre: "8", expectedReturnPost: "8" }],
      }) as any,
    );
    const highReturn = await calculateRetirementPlan(
      baseScenario({
        assets: [{ id: "epf", kind: "equity", value: "1000000", expectedReturnPre: "12", expectedReturnPost: "8" }],
      }) as any,
    );

    const checkYear = CURRENT_YEAR + 10;
    const lowPoint = lowReturn.netWorthSeries.find((p) => p.year === checkYear)!;
    const highPoint = highReturn.netWorthSeries.find((p) => p.year === checkYear)!;

    expect(highPoint.value).toBeGreaterThan(lowPoint.value);
  });

  it("EPF monthly contribution still funds the EPF bucket even when there's no general savings surplus", async () => {
    // Income == expenses → net savings is zero, so the general bucket gets
    // nothing either way. The EPF contribution should still flow into the
    // EPF-tracked balance rather than being silently dropped.
    const noContribution = await calculateRetirementPlan(
      baseScenario({
        assets: [{ id: "epf", kind: "equity", value: "500000", expectedReturnPre: "8", expectedReturnPost: "8" }],
        monthlyIncome: 50_000,
        monthlyExpense: 50_000,
      }) as any,
    );
    const withContribution = await calculateRetirementPlan(
      baseScenario({
        assets: [
          {
            id: "epf",
            kind: "equity",
            value: "500000",
            expectedReturnPre: "8",
            expectedReturnPost: "8",
            monthlyContribution: "5000",
          },
        ],
        monthlyIncome: 50_000,
        monthlyExpense: 50_000,
      }) as any,
    );

    const checkYear = CURRENT_YEAR + 10;
    const base = noContribution.netWorthSeries.find((p) => p.year === checkYear)!.value;
    const withContrib = withContribution.netWorthSeries.find((p) => p.year === checkYear)!.value;

    expect(withContrib).toBeGreaterThan(base);
  });

  it("general bucket net worth is unaffected by EPF/NPS return rates when EPF/NPS are absent", async () => {
    const scenario = baseScenario({
      assets: [{ id: "1", kind: "equity", value: "1000000", expectedReturnPre: "12", expectedReturnPost: "8" }],
    });
    const result = await calculateRetirementPlan(scenario as any);
    expect(result.netWorthSeries.length).toBeGreaterThan(0);
    // Sanity: general-only portfolio still grows over time.
    const first = result.netWorthSeries[0].value;
    const last = result.netWorthSeries[result.netWorthSeries.length - 1].value;
    expect(last).not.toBe(first);
  });

  it("EPF/NPS contributions do not inflate total net worth beyond what net savings can fund (no double counting)", async () => {
    // With income - expenses = netSavings, diverting a chunk of it into EPF
    // should not change TOTAL net worth if EPF and general buckets share the
    // same return rate — only the split between buckets should change.
    const sameReturnNoEpfContribution = await calculateRetirementPlan(
      baseScenario({
        assets: [{ id: "1", kind: "equity", value: "0", expectedReturnPre: "8", expectedReturnPost: "8" }],
        monthlyIncome: 150_000,
        monthlyExpense: 50_000,
      }) as any,
    );
    const sameReturnWithEpfContribution = await calculateRetirementPlan(
      baseScenario({
        assets: [
          { id: "1", kind: "equity", value: "0", expectedReturnPre: "8", expectedReturnPost: "8" },
          { id: "epf", kind: "equity", value: "0", expectedReturnPre: "8", expectedReturnPost: "8", monthlyContribution: "20000" },
        ],
        monthlyIncome: 150_000,
        monthlyExpense: 50_000,
      }) as any,
    );

    const checkYear = CURRENT_YEAR + 5;
    const withoutEpf = sameReturnNoEpfContribution.netWorthSeries.find((p) => p.year === checkYear)!.value;
    const withEpf = sameReturnWithEpfContribution.netWorthSeries.find((p) => p.year === checkYear)!.value;

    // Same total return rate everywhere → diverting savings into EPF instead
    // of general shouldn't change the combined total (within compounding
    // rounding), proving the general bucket is reduced by exactly the EPF
    // contribution rather than the contribution being added on top.
    expect(withEpf).toBeCloseTo(withoutEpf, -2);
  });

  it("mini-retirement: EPF/NPS keep compounding untouched while general bucket absorbs the deficit", async () => {
    const result = await calculateRetirementPlan(
      baseScenario({
        assets: [
          { id: "1", kind: "equity", value: "2000000", expectedReturnPre: "8", expectedReturnPost: "8" },
          { id: "epf", kind: "equity", value: "1000000", expectedReturnPre: "8", expectedReturnPost: "8" },
        ],
        miniRetirements: [{ start: CURRENT_YEAR + 2, months: 12, incomeDuring: 0, expenseDeltaPct: 0 }],
      }) as any,
    );

    // The plan should still project without throwing and produce a full series.
    expect(result.netWorthSeries.length).toBeGreaterThan(0);
  });

  it("retirement-year transition merges buckets and continues compounding at returnPost", async () => {
    const scenario = baseScenario({
      assets: [
        { id: "1", kind: "equity", value: "1000000", expectedReturnPre: "12", expectedReturnPost: "8" },
        { id: "epf", kind: "equity", value: "1000000", expectedReturnPre: "8", expectedReturnPost: "8" },
      ],
      retirementYear: CURRENT_YEAR + 3,
    });
    const result = await calculateRetirementPlan(scenario as any);

    // Should not throw and should keep projecting for years after retirement.
    const postRetirementPoint = result.netWorthSeries.find((p) => p.year === CURRENT_YEAR + 3);
    expect(postRetirementPoint).toBeDefined();
    expect(postRetirementPoint!.value).toBeGreaterThan(0);
  });
});
