/**
 * Unit tests for calculateRetirementPlan — covers the goal-multiplier and
 * retired-drawdown paths added in Task #145.
 *
 * IMPORTANT: lifeExpectancy is an AGE, not a calendar year.
 * The engine loops: for year = currentYear to birthYear + lifeExpectancy.
 * For a 35-year-old (birthYear = currentYear - 35) with lifeExpectancy = 85:
 *   terminal = (currentYear - 35) + 85 = currentYear + 50.
 */

import { describe, it, expect } from "vitest";
import { calculateRetirementPlan } from "../calculations";

const CURRENT_YEAR = new Date().getFullYear();
const SELF_AGE = 35;
const BIRTH_YEAR = CURRENT_YEAR - SELF_AGE;    // accumulating-mode persona
const RETIRED_AGE = 60;
const RETIRED_BIRTH_YEAR = CURRENT_YEAR - RETIRED_AGE;

/** Minimal ScenarioData for accumulating-mode tests. */
function accumulatingScenario(overrides: {
  monthlyExpense?: number;
  postRetirementMonthlyExpense?: number;
  retirementYear?: number;
  lifeExpectancyAge?: number; // pass as an AGE (e.g. 85), not a calendar year
  returnPre?: string;
  returnPost?: string;
  inflation?: string;
} = {}) {
  const retirementYear = overrides.retirementYear ?? CURRENT_YEAR + 25;
  const lifeExpectancyAge = overrides.lifeExpectancyAge ?? 85; // age at death

  return {
    id: "test-scenario",
    name: "Test Plan",
    mode: "quick",
    householdMembers: [
      {
        relation: "self",
        dob: `${BIRTH_YEAR}-01-01`,
        retirementAge: retirementYear - BIRTH_YEAR,
      },
    ],
    incomeItems: [
      {
        type: "salary",
        amount: String(1_200_000),
        frequency: "annual",
        start: CURRENT_YEAR,
        end: retirementYear,
      },
    ],
    assets: [],
    liabilities: [],
    goals: [],
    miniRetirements: [],
    assumptions: {
      inflationHeadline: overrides.inflation ?? "6.0",
      inflationEdu: "8.0",
      returnPre: overrides.returnPre ?? "12.0",
      returnPost: overrides.returnPost ?? "8.0",
      lifeExpectancy: String(lifeExpectancyAge), // AGE, not a calendar year
      ...(overrides.postRetirementMonthlyExpense !== undefined
        ? { postRetirementMonthlyExpense: String(overrides.postRetirementMonthlyExpense) }
        : {}),
    },
    expenseItems: [
      {
        type: "core",
        amountMonthly: String(overrides.monthlyExpense ?? 50_000),
      },
    ],
  };
}

/** Minimal ScenarioData for retired-mode tests.
 *
 *  lifeExpectancy is set as: RETIRED_AGE + yearsToProject (an AGE, not a year).
 *  Engine terminal: RETIRED_BIRTH_YEAR + (RETIRED_AGE + yearsToProject)
 *                 = (CURRENT_YEAR - 60) + 85 = CURRENT_YEAR + 25  ✓
 */
function retiredScenario(overrides: {
  monthlyWithdrawal?: number;
  corpus?: number;
  yearsToProject?: number;
  returnPost?: string;
  inflation?: string;
} = {}) {
  const corpus = overrides.corpus ?? 30_000_000;
  const monthlyWithdrawal = overrides.monthlyWithdrawal ?? 100_000;
  const yearsToProject = overrides.yearsToProject ?? 25;
  const lifeExpectancyAge = RETIRED_AGE + yearsToProject; // an AGE (85 for 25 years)

  return {
    id: "test-retired",
    name: "Retired Plan",
    mode: "quick",
    householdMembers: [
      {
        relation: "self",
        dob: `${RETIRED_BIRTH_YEAR}-01-01`,
        retirementAge: RETIRED_AGE,
      },
    ],
    incomeItems: [
      // Dummy salary pins retirementYear = CURRENT_YEAR
      {
        type: "salary",
        amount: "0",
        frequency: "annual",
        start: CURRENT_YEAR - 1,
        end: CURRENT_YEAR,
      },
    ],
    assets: [
      {
        kind: "equity",
        value: String(corpus),
        expectedReturnPre: overrides.returnPost ?? "8.0",
        expectedReturnPost: overrides.returnPost ?? "8.0",
      },
    ],
    liabilities: [],
    goals: [],
    miniRetirements: [],
    assumptions: {
      inflationHeadline: overrides.inflation ?? "6.0",
      inflationEdu: "8.0",
      returnPre: overrides.returnPost ?? "8.0",
      returnPost: overrides.returnPost ?? "8.0",
      lifeExpectancy: String(lifeExpectancyAge), // AGE (85), not a calendar year (2051)
      postRetirementMonthlyExpense: String(monthlyWithdrawal),
    },
    expenseItems: [
      {
        type: "core",
        amountMonthly: String(monthlyWithdrawal),
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Goal-multiplier tests
// ---------------------------------------------------------------------------

describe("calculateRetirementPlan – goal multiplier (postRetirementMonthlyExpense)", () => {
  it("FIRE (0.6×): required corpus is ~60% of the comfortable baseline", async () => {
    const baseExpense = 80_000;

    const comfortable = await calculateRetirementPlan(
      accumulatingScenario({ monthlyExpense: baseExpense }) as any
    );
    const fire = await calculateRetirementPlan(
      accumulatingScenario({
        monthlyExpense: baseExpense,
        postRetirementMonthlyExpense: Math.round(baseExpense * 0.6),
      }) as any
    );

    const ratio =
      fire.summary.requiredCorpusAtRetirement /
      comfortable.summary.requiredCorpusAtRetirement;

    expect(ratio).toBeGreaterThan(0.59);
    expect(ratio).toBeLessThan(0.61);
  });

  it("Lavish (1.3×): required corpus is ~130% of the comfortable baseline", async () => {
    const baseExpense = 80_000;

    const comfortable = await calculateRetirementPlan(
      accumulatingScenario({ monthlyExpense: baseExpense }) as any
    );
    const lavish = await calculateRetirementPlan(
      accumulatingScenario({
        monthlyExpense: baseExpense,
        postRetirementMonthlyExpense: Math.round(baseExpense * 1.3),
      }) as any
    );

    const ratio =
      lavish.summary.requiredCorpusAtRetirement /
      comfortable.summary.requiredCorpusAtRetirement;

    expect(ratio).toBeGreaterThan(1.29);
    expect(ratio).toBeLessThan(1.31);
  });

  it("pre-retirement net worth is identical regardless of goal multiplier", async () => {
    const baseExpense = 80_000;
    const retirementYear = CURRENT_YEAR + 25;

    const comfortable = await calculateRetirementPlan(
      accumulatingScenario({ monthlyExpense: baseExpense, retirementYear }) as any
    );
    const fire = await calculateRetirementPlan(
      accumulatingScenario({
        monthlyExpense: baseExpense,
        retirementYear,
        postRetirementMonthlyExpense: Math.round(baseExpense * 0.6),
      }) as any
    );

    const checkYear = retirementYear - 10;
    const comfortablePoint = comfortable.netWorthSeries.find((p: any) => p.year === checkYear);
    const firePoint = fire.netWorthSeries.find((p: any) => p.year === checkYear);

    expect(comfortablePoint).toBeDefined();
    expect(firePoint).toBeDefined();
    expect(firePoint!.value).toBeCloseTo(comfortablePoint!.value, -3);
  });

  it("Comfortable (1.0×): same override produces identical results to no override", async () => {
    const baseExpense = 60_000;

    const noOverride = await calculateRetirementPlan(
      accumulatingScenario({ monthlyExpense: baseExpense }) as any
    );
    const withOverride = await calculateRetirementPlan(
      accumulatingScenario({
        monthlyExpense: baseExpense,
        postRetirementMonthlyExpense: baseExpense,
      }) as any
    );

    expect(withOverride.summary.requiredCorpusAtRetirement).toBe(
      noOverride.summary.requiredCorpusAtRetirement
    );
  });
});

// ---------------------------------------------------------------------------
// Retired / drawdown mode tests
// ---------------------------------------------------------------------------

describe("calculateRetirementPlan – retired drawdown mode", () => {
  it("net worth decreases when high withdrawal drains corpus faster than returns", async () => {
    const result = await calculateRetirementPlan(
      retiredScenario({ corpus: 10_000_000, monthlyWithdrawal: 150_000 }) as any
    );

    const series = result.netWorthSeries;
    const firstValue = series[0]?.value ?? 0;
    const lastValue = series[series.length - 1]?.value ?? 0;

    expect(lastValue).toBeLessThan(firstValue);
  });

  it("projectedCorpusAtRetirement equals the starting corpus in retired mode", async () => {
    const corpus = 25_000_000;
    const result = await calculateRetirementPlan(
      retiredScenario({ corpus, monthlyWithdrawal: 80_000 }) as any
    );

    expect(result.summary.projectedCorpusAtRetirement).toBeGreaterThan(corpus * 0.95);
    expect(result.summary.projectedCorpusAtRetirement).toBeLessThanOrEqual(corpus * 1.05);
  });

  it("retirementYear is set to current year in retired mode", async () => {
    const result = await calculateRetirementPlan(retiredScenario() as any);
    expect(result.summary.retirementYear).toBe(CURRENT_YEAR);
  });

  it("doubling withdrawal roughly doubles the required corpus", async () => {
    const base = await calculateRetirementPlan(
      retiredScenario({ monthlyWithdrawal: 120_000 }) as any
    );
    const double = await calculateRetirementPlan(
      retiredScenario({ monthlyWithdrawal: 240_000 }) as any
    );

    const ratio =
      double.summary.requiredCorpusAtRetirement /
      base.summary.requiredCorpusAtRetirement;

    expect(ratio).toBeGreaterThan(1.9);
    expect(ratio).toBeLessThan(2.1);
  });

  it("yearsToCover=25 yields exactly 26 yearly rows ending at currentYear+25", async () => {
    // This is the canonical retired projection horizon test.
    // For a 60-year-old with yearsToCover=25:
    //   lifeExpectancyAge = 60 + 25 = 85  (an age)
    //   Engine terminal   = birthYear(1966) + 85 = 2051 = currentYear + 25  ✓
    //   Loop: for year = currentYear to 2051 → 26 iterations
    const yearsToCover = 25;
    const result = await calculateRetirementPlan(
      retiredScenario({ yearsToProject: yearsToCover, corpus: 20_000_000 }) as any
    );

    const rows = result.yearlyDetail;
    expect(rows).toHaveLength(yearsToCover + 1); // inclusive of start and end year
    expect(rows[rows.length - 1].year).toBe(CURRENT_YEAR + yearsToCover);
  });
});
