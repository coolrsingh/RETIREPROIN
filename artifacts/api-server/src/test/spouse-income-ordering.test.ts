/**
 * Spouse income ordering and per-stream duration tests.
 *
 * These tests verify:
 *   1. Retirement year is derived from the primary (highest-amount) salary, not
 *      insertion order — spouse salary in any position doesn't corrupt it.
 *   2. Each income stream is active only during its own [start, end) window with
 *      its own growth rate.
 *   3. Retired mode with a spouse present: dummy salary is the only income stream
 *      and the drawdown retirement year stays at CURRENT_YEAR.
 */

import { describe, it, expect } from "vitest";
import { calculateRetirementPlan } from "../calculations";

const CURRENT_YEAR = new Date().getFullYear();
const SELF_AGE = 35;
const SELF_BIRTH_YEAR = CURRENT_YEAR - SELF_AGE;
const SELF_RETIREMENT_YEAR = CURRENT_YEAR + 25; // age 60

const SPOUSE_AGE = 32;
const SPOUSE_BIRTH_YEAR = CURRENT_YEAR - SPOUSE_AGE;
// Spouse retires EARLIER than primary (age 55 = CURRENT_YEAR + 23)
const SPOUSE_EARLY_RETIREMENT_YEAR = CURRENT_YEAR + 23;
// Spouse retires LATER than primary (age 65 = CURRENT_YEAR + 33)
const SPOUSE_LATE_RETIREMENT_YEAR = CURRENT_YEAR + 33;

function baseAssumptions() {
  return {
    inflationHeadline: "6.0",
    inflationEdu: "8.0",
    returnPre: "12.0",
    returnPost: "8.0",
    lifeExpectancy: "85",
  };
}

/** Scenario with a primary salary and a spouse salary.
 *  The engine must identify the primary via amount (₹1.2L > ₹50k), not position. */
function coupleScenario(spouseFirst: boolean, spouseRetirementYear: number) {
  const primaryItem = {
    id: "primary",
    type: "salary",
    amount: String(1_200_000), // ₹1L/month (higher)
    frequency: "annual",
    start: CURRENT_YEAR,
    end: SELF_RETIREMENT_YEAR,
    growthRate: "8",
  };
  const spouseItem = {
    id: "spouse",
    type: "salary",
    amount: String(600_000),   // ₹50k/month (lower)
    frequency: "annual",
    start: CURRENT_YEAR,
    end: spouseRetirementYear,
    growthRate: "5",
  };

  return {
    id: "test",
    name: "Couple Plan",
    mode: "quick",
    householdMembers: [
      { relation: "self",   dob: `${SELF_BIRTH_YEAR}-01-01`   },
      { relation: "spouse", dob: `${SPOUSE_BIRTH_YEAR}-01-01` },
    ],
    // Order varies to test that amount-based primary detection is order-independent
    incomeItems: spouseFirst ? [spouseItem, primaryItem] : [primaryItem, spouseItem],
    assets: [],
    liabilities: [],
    goals: [],
    miniRetirements: [],
    expenseItems: [{ type: "core", amountMonthly: "60000" }],
    assumptions: baseAssumptions(),
  };
}

/** Retired scenario with a spouse household member but NO spouse income stream
 *  (matches the authenticated route behaviour after the !authIsRetired guard). */
function retiredWithSpouseScenario() {
  return {
    id: "test-retired",
    name: "Retired Couple",
    mode: "quick",
    householdMembers: [
      { relation: "self",   dob: `${CURRENT_YEAR - 60}-01-01` },
      { relation: "spouse", dob: `${SPOUSE_BIRTH_YEAR}-01-01` },
    ],
    incomeItems: [
      // Only dummy salary — no spouse income in retired mode
      {
        id: "retired-marker",
        type: "salary",
        amount: "0",
        frequency: "annual",
        start: CURRENT_YEAR - 1,
        end: CURRENT_YEAR,
      },
    ],
    assets: [{ kind: "equity", value: "20000000", expectedReturnPre: "8.0", expectedReturnPost: "8.0" }],
    liabilities: [],
    goals: [],
    miniRetirements: [],
    expenseItems: [{ type: "core", amountMonthly: "80000" }],
    assumptions: {
      ...baseAssumptions(),
      returnPre: "8.0",
      returnPost: "8.0",
      lifeExpectancy: "85", // 60 + 25 = age 85
      postRetirementMonthlyExpense: "80000",
    },
  };
}

// ---------------------------------------------------------------------------
// Retirement year is derived from the primary salary (highest amount)
// ---------------------------------------------------------------------------

describe("Retirement year — derived from primary salary (amount-based), not insertion order", () => {
  it("primary listed first: retirementYear = self retirement year", async () => {
    const result = await calculateRetirementPlan(
      coupleScenario(false, SPOUSE_EARLY_RETIREMENT_YEAR) as any,
    );
    expect(result.summary.retirementYear).toBe(SELF_RETIREMENT_YEAR);
  });

  it("spouse listed first: retirementYear still = self retirement year", async () => {
    // Even if spouse salary item appears first in the array, the primary (higher-amount)
    // salary must be used to pin the retirement year.
    const result = await calculateRetirementPlan(
      coupleScenario(true, SPOUSE_EARLY_RETIREMENT_YEAR) as any,
    );
    expect(result.summary.retirementYear).toBe(SELF_RETIREMENT_YEAR);
  });

  it("primary and spouse listed in either order produce the same retirementYear", async () => {
    const r1 = await calculateRetirementPlan(coupleScenario(false, SPOUSE_LATE_RETIREMENT_YEAR) as any);
    const r2 = await calculateRetirementPlan(coupleScenario(true,  SPOUSE_LATE_RETIREMENT_YEAR) as any);
    expect(r1.summary.retirementYear).toBe(r2.summary.retirementYear);
    expect(r1.summary.retirementYear).toBe(SELF_RETIREMENT_YEAR);
  });
});

// ---------------------------------------------------------------------------
// Per-stream income duration — each stream active only during its own window
// ---------------------------------------------------------------------------

describe("Per-stream income: each stream active only during [start, end)", () => {
  it("spouse retiring EARLIER: income in year after spouse retirement is lower than before", async () => {
    const scenario = coupleScenario(false, SPOUSE_EARLY_RETIREMENT_YEAR);
    const result = await calculateRetirementPlan(scenario as any);

    const yearBeforeSpouseRetires = result.yearlyDetail.find(
      (r: any) => r.year === SPOUSE_EARLY_RETIREMENT_YEAR - 1,
    );
    const yearAfterSpouseRetires = result.yearlyDetail.find(
      (r: any) => r.year === SPOUSE_EARLY_RETIREMENT_YEAR,
    );

    expect(yearBeforeSpouseRetires).toBeDefined();
    expect(yearAfterSpouseRetires).toBeDefined();

    // After spouse retires, household income drops (only primary remains)
    expect(yearAfterSpouseRetires!.income).toBeLessThan(yearBeforeSpouseRetires!.income);
  });

  it("spouse retiring LATER: income continues beyond primary retirement year", async () => {
    const scenario = coupleScenario(false, SPOUSE_LATE_RETIREMENT_YEAR);
    const result = await calculateRetirementPlan(scenario as any);

    // Year after primary retires — spouse income should still be present
    const yearAfterPrimaryRetires = result.yearlyDetail.find(
      (r: any) => r.year === SELF_RETIREMENT_YEAR + 1,
    );

    expect(yearAfterPrimaryRetires).toBeDefined();
    // Spouse is still earning (stream end = SPOUSE_LATE_RETIREMENT_YEAR > SELF_RETIREMENT_YEAR + 1)
    expect(yearAfterPrimaryRetires!.income).toBeGreaterThan(0);
  });

  it("income is zero in ALL years after BOTH streams have ended", async () => {
    const scenario = coupleScenario(false, SPOUSE_EARLY_RETIREMENT_YEAR);
    const result = await calculateRetirementPlan(scenario as any);

    // After the primary retires (SELF_RETIREMENT_YEAR), both streams should be done
    const yearsAfterBothRetired = result.yearlyDetail.filter(
      (r: any) => r.year > SELF_RETIREMENT_YEAR,
    );

    // All of these years should have zero income (both streams ended)
    yearsAfterBothRetired.forEach((row: any) => {
      expect(row.income).toBe(0);
    });
  });
});

// ---------------------------------------------------------------------------
// Retired mode with spouse — dummy salary pins retirementYear to CURRENT_YEAR
// ---------------------------------------------------------------------------

describe("Retired mode with spouse household member", () => {
  it("retirementYear is CURRENT_YEAR regardless of spouse data", async () => {
    const result = await calculateRetirementPlan(retiredWithSpouseScenario() as any);
    expect(result.summary.retirementYear).toBe(CURRENT_YEAR);
  });

  it("projectedCorpusAtRetirement ≈ starting corpus (retirement is now)", async () => {
    const corpus = 20_000_000;
    const result = await calculateRetirementPlan(retiredWithSpouseScenario() as any);
    expect(result.summary.projectedCorpusAtRetirement).toBeGreaterThan(corpus * 0.95);
  });
});
