import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import express from "express";
import type { AddressInfo } from "node:net";
import type { RequestHandler } from "express";

vi.hoisted(() => {
  // The db package creates a connection pool during module initialization.
  // The mocked route dependencies below prevent any query from being made.
  process.env.DATABASE_URL ??= "postgresql://validation-test";
});

vi.mock("../replitAuth", () => ({
  setupAuth: vi.fn(async () => undefined),
  isAuthenticated: ((req: any, _res: any, next: any) => {
    req.user = { claims: { sub: "validation-test-user" } };
    next();
  }) as RequestHandler,
}));

vi.mock("../storage", () => ({
  storage: {},
}));

vi.mock("../db", () => ({
  db: {},
}));

import app from "../app";
import { registerRoutes } from "../routes/routes";

const invalidBlankChildPlan = {
  fullName: "Validation Test User",
  dob: "1990-01-01",
  retirementAge: 60,
  monthlyIncomeTotal: 100000,
  monthlyExpenseTotal: 50000,
  monthlySavings: 50000,
  children: [{}],
};

const currentYear = new Date().getFullYear();
const validGuestPlan = {
  fullName: "Phase One Test User",
  dob: `${currentYear - 40}-01-01`,
  retirementAge: 60,
  personaMode: "accumulating",
  retirementGoal: "comfortable",
  monthlyIncomeTotal: 100000,
  monthlyExpenseTotal: 50000,
  monthlySavings: 50000,
  incomeGrowthRate: 0,
  children: [],
  assetsLumpSum: 0,
  epfCorpus: 0,
  npsCorpus: 0,
  assumptions: {
    returnPre: 12,
    returnPost: 8,
    inflationHeadline: 7,
  },
};

describe("plan validation routes", () => {
  let server: Awaited<ReturnType<typeof registerRoutes>>;
  let baseUrl: string;

  beforeAll(async () => {
    server = await registerRoutes(app);
    await new Promise<void>((resolve, reject) => {
      server.listen(0, "127.0.0.1", () => resolve());
      server.once("error", reject);
    });

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it.each(["try", "quick"])(
    "POST /api/plan/%s rejects a blank child row with a clear error",
    async (endpoint) => {
      const response = await fetch(`${baseUrl}/api/plan/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidBlankChildPlan),
      });
      const body = (await response.json()) as {
        message?: string;
        errors?: Array<{ message?: string; path?: Array<string | number> }>;
      };

      expect(response.status).toBe(400);
      expect(body.message).toBe("Validation failed");
      expect(body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: "Child must have a name or date of birth",
            path: ["children", 0, "dob"],
          }),
        ]),
      );
    },
  );

  it("POST /api/plan/try includes both salaries in the chart income and stops spouse income at the spouse retirement year", async () => {
    const spouseDob = `${currentYear - 38}-01-01`;
    const spouseRetirementAge = 55;
    const response = await fetch(`${baseUrl}/api/plan/try`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validGuestPlan,
        spouseDob,
        spouseMonthlyIncome: 50000,
        spouseRetirementAge,
        isJointRetirement: true,
      }),
    });
    const body = await response.json() as {
      cashflowSeries: Array<{ year: number; income: number }>;
    };

    expect(response.status).toBe(200);
    expect(body.cashflowSeries[0]).toEqual({
      year: currentYear,
      income: (100000 + 50000) * 12,
      expenses: expect.any(Number),
      emi: expect.any(Number),
      surplus: expect.any(Number),
    });
    const spouseEndYear = Number(spouseDob.slice(0, 4)) + spouseRetirementAge;
    const beforeSpouseRetires = body.cashflowSeries.find((row) => row.year === spouseEndYear - 1);
    const whenSpouseRetires = body.cashflowSeries.find((row) => row.year === spouseEndYear);
    expect(beforeSpouseRetires!.income).toBeGreaterThan(whenSpouseRetires!.income);
    expect(whenSpouseRetires?.income).toBe(1200000);
  });

  it("POST /api/plan/try carries EPF and NPS balances into projected corpus", async () => {
    const response = await fetch(`${baseUrl}/api/plan/try`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validGuestPlan,
        epfCorpus: 800000,
        epfReturn: 8.25,
        npsCorpus: 200000,
        npsReturn: 10,
      }),
    });
    const body = await response.json() as {
      summary: { projectedCorpusAtRetirement: number };
      netWorthSeries: Array<{ year: number; value: number }>;
    };

    expect(response.status).toBe(200);
    expect(body.netWorthSeries[0].value).toBeGreaterThan(1000000);
    expect(body.summary.projectedCorpusAtRetirement).toBeGreaterThan(0);
  });

  it("POST /api/plan/try returns a declining drawdown chart for the retired persona", async () => {
    const response = await fetch(`${baseUrl}/api/plan/try`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validGuestPlan,
        dob: `${currentYear - 60}-01-01`,
        personaMode: "retired",
        monthlyIncomeTotal: 0,
        monthlySavings: 0,
        currentCorpus: 5000000,
        monthlyWithdrawal: 60000,
        yearsToCover: 25,
      }),
    });
    const body = await response.json() as {
      netWorthSeries: Array<{ year: number; value: number }>;
    };

    expect(response.status).toBe(200);
    expect(body.netWorthSeries).toHaveLength(26);
    expect(body.netWorthSeries.at(-1)!.value).toBeLessThan(body.netWorthSeries[0].value);
  });
});