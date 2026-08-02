/**
 * Retired-mode mapping tests — exercises the shared buildGuestAssets mapper.
 *
 * NOTE: lifeExpectancy is an AGE, not a calendar year.
 * Engine terminal year = birthYear + lifeExpectancy.
 * For a 60-year-old (birthYear = currentYear - 60) with yearsToCover = 25:
 *   lifeExpectancyAge  = 60 + 25 = 85
 *   terminal year      = (currentYear - 60) + 85 = currentYear + 25  ✓
 */

import { describe, it, expect } from "vitest";
import { buildGuestAssets } from "../plan-mapper";
import { calculateRetirementPlan } from "../calculations";

const CURRENT_YEAR = new Date().getFullYear();
const RETIRED_AGE = 60;
const RETIRED_BIRTH_YEAR = CURRENT_YEAR - RETIRED_AGE;

// ---------------------------------------------------------------------------
// buildGuestAssets unit tests
// ---------------------------------------------------------------------------

describe("buildGuestAssets – retired mode (no EPF/NPS double-counting)", () => {
  it("retired mode: returns only currentCorpus even when epfCorpus and npsCorpus are non-zero", () => {
    const assets = buildGuestAssets(
      {
        personaMode: "retired",
        currentCorpus: 10_000_000,
        epfCorpus: 3_000_000,
        npsCorpus: 2_000_000,
      },
      "12.0",
      "8.0",
    );

    expect(assets).toHaveLength(1);
    expect(assets[0].id).toBe("corpus");
    expect(assets[0].value).toBe("10000000");
  });

  it("retired mode: returns an empty list when currentCorpus is zero", () => {
    const assets = buildGuestAssets(
      { personaMode: "retired", currentCorpus: 0, epfCorpus: 5_000_000 },
      "12.0",
      "8.0",
    );

    expect(assets).toHaveLength(0);
  });

  it("retired mode: uses returnPost for both pre and post return rates", () => {
    const assets = buildGuestAssets(
      { personaMode: "retired", currentCorpus: 20_000_000 },
      "12.0",
      "7.5",
    );

    expect(assets).toHaveLength(1);
    expect(assets[0].expectedReturnPre).toBe("7.5");
    expect(assets[0].expectedReturnPost).toBe("7.5");
  });
});

describe("buildGuestAssets – accumulating mode (EPF/NPS added as separate assets)", () => {
  it("accumulating: includes assetsLumpSum + epfCorpus + npsCorpus as three assets", () => {
    const assets = buildGuestAssets(
      {
        personaMode: "accumulating",
        assetsLumpSum: 500_000,
        epfCorpus: 800_000,
        npsCorpus: 200_000,
      },
      "12.0",
      "8.0",
    );

    expect(assets).toHaveLength(3);
    const ids = assets.map((a) => a.id);
    expect(ids).toContain("1");
    expect(ids).toContain("epf");
    expect(ids).toContain("nps");
  });

  it("accumulating: EPF uses 8% pre-retirement return", () => {
    const assets = buildGuestAssets(
      { personaMode: "accumulating", epfCorpus: 1_000_000 },
      "12.0",
      "8.0",
    );

    const epf = assets.find((a) => a.id === "epf");
    expect(epf).toBeDefined();
    expect(epf!.expectedReturnPre).toBe("8");
  });

  it("accumulating: NPS uses 10% pre-retirement return", () => {
    const assets = buildGuestAssets(
      { personaMode: "accumulating", npsCorpus: 500_000 },
      "12.0",
      "8.0",
    );

    const nps = assets.find((a) => a.id === "nps");
    expect(nps).toBeDefined();
    expect(nps!.expectedReturnPre).toBe("10");
  });
});

// ---------------------------------------------------------------------------
// Integration: retired-mode asset list + correct lifeExpectancy horizon
// ---------------------------------------------------------------------------

describe("retired-mode asset mapping → calculation parity and horizon", () => {
  /** Build a scenario the same way the guest route does, using buildGuestAssets. */
  function makeRetiredScenario(opts: {
    currentCorpus: number;
    epfCorpus?: number;
    npsCorpus?: number;
    monthlyWithdrawal: number;
    yearsToCover?: number;
  }) {
    const yearsToCover = opts.yearsToCover ?? 25;
    // lifeExpectancy is an AGE: currentAge + yearsToCover = 60 + 25 = 85
    const lifeExpectancyAge = RETIRED_AGE + yearsToCover;

    const assets = buildGuestAssets(
      {
        personaMode: "retired",
        currentCorpus: opts.currentCorpus,
        epfCorpus: opts.epfCorpus ?? 0,
        npsCorpus: opts.npsCorpus ?? 0,
      },
      "8.0",
      "8.0",
    );

    return {
      id: "guest",
      name: "Test Retired Plan",
      mode: "quick",
      householdMembers: [{ relation: "self", dob: `${RETIRED_BIRTH_YEAR}-01-01` }],
      incomeItems: [
        {
          type: "salary",
          amount: "0",
          frequency: "annual",
          start: CURRENT_YEAR - 1,
          end: CURRENT_YEAR,
        },
      ],
      assets,
      liabilities: [],
      goals: [],
      miniRetirements: [],
      expenseItems: [{ type: "core", amountMonthly: String(opts.monthlyWithdrawal) }],
      assumptions: {
        inflationHeadline: "6.0",
        inflationEdu: "8.0",
        returnPre: "8.0",
        returnPost: "8.0",
        lifeExpectancy: String(lifeExpectancyAge), // AGE, not calendar year
        postRetirementMonthlyExpense: String(opts.monthlyWithdrawal),
      },
    };
  }

  it("EPF/NPS do NOT increase projected corpus — only currentCorpus counts", async () => {
    const base = makeRetiredScenario({ currentCorpus: 20_000_000, monthlyWithdrawal: 100_000 });
    const withEpfNps = makeRetiredScenario({
      currentCorpus: 20_000_000,
      epfCorpus: 3_000_000,
      npsCorpus: 2_000_000,
      monthlyWithdrawal: 100_000,
    });

    const r1 = await calculateRetirementPlan(base as any);
    const r2 = await calculateRetirementPlan(withEpfNps as any);

    expect(r2.summary.projectedCorpusAtRetirement).toBe(
      r1.summary.projectedCorpusAtRetirement,
    );
  });

  it("projectedCorpusAtRetirement ≈ currentCorpus when retirement is now", async () => {
    const corpus = 25_000_000;
    const scenario = makeRetiredScenario({ currentCorpus: corpus, monthlyWithdrawal: 80_000 });
    const result = await calculateRetirementPlan(scenario as any);

    expect(result.summary.projectedCorpusAtRetirement).toBeGreaterThan(corpus * 0.95);
    expect(result.summary.projectedCorpusAtRetirement).toBeLessThanOrEqual(corpus * 1.05);
  });

  it("yearsToCover=25 projects exactly 26 yearly rows ending at currentYear+25, ages correct", async () => {
    // Validates the lifeExpectancy contract end-to-end through buildGuestAssets + calculateRetirementPlan.
    // For RETIRED_AGE=60, yearsToCover=25: lifeExpectancyAge=85
    // Engine terminal: RETIRED_BIRTH_YEAR(1966) + 85 = 2051 = CURRENT_YEAR + 25
    const yearsToCover = 25;
    const scenario = makeRetiredScenario({
      currentCorpus: 20_000_000,
      monthlyWithdrawal: 80_000,
      yearsToCover,
    });

    const result = await calculateRetirementPlan(scenario as any);

    const rows = result.yearlyDetail;
    expect(rows).toHaveLength(yearsToCover + 1); // inclusive
    expect(rows[rows.length - 1].year).toBe(CURRENT_YEAR + yearsToCover);

    // Age is year - birthYear, not some offset from currentYear
    expect(rows[0].age).toBe(RETIRED_AGE);                          // first row: age 60
    expect(rows[rows.length - 1].age).toBe(RETIRED_AGE + yearsToCover); // last row: age 85
  });
});
