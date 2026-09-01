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
});