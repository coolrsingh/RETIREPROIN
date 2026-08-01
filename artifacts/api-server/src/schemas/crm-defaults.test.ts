import { describe, it, expect } from "vitest";
import { crmDefaultsUpdateSchema } from "./crm-defaults";

// Valid baseline payload that should always pass
const validPayload = {
  inflationHeadline: 6,
  inflationEdu: 8,
  inflationHealth: 8,
  returnPre: 12,
  returnPost: 8,
  lifeExpectancy: 85,
  taxRegime: "new" as const,
};

describe("crmDefaultsUpdateSchema", () => {
  // ── Happy path ──────────────────────────────────────────────────────────────

  it("accepts a fully in-range payload and returns a 200-equivalent success", () => {
    const result = crmDefaultsUpdateSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("accepts boundary values (min edges)", () => {
    const result = crmDefaultsUpdateSchema.safeParse({
      ...validPayload,
      inflationHeadline: 0,
      inflationEdu: 0,
      inflationHealth: 0,
      returnPre: 0,
      returnPost: 0,
      lifeExpectancy: 60,
    });
    expect(result.success).toBe(true);
  });

  it("accepts boundary values (max edges)", () => {
    const result = crmDefaultsUpdateSchema.safeParse({
      ...validPayload,
      inflationHeadline: 20,
      inflationEdu: 20,
      inflationHealth: 20,
      returnPre: 30,
      returnPost: 30,
      lifeExpectancy: 100,
    });
    expect(result.success).toBe(true);
  });

  it("transforms numeric inflation/return fields to strings on success", () => {
    const result = crmDefaultsUpdateSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.inflationHeadline).toBe("6");
    expect(result.data.returnPre).toBe("12");
    expect(result.data.returnPost).toBe("8");
  });

  it("accepts taxRegime 'old'", () => {
    const result = crmDefaultsUpdateSchema.safeParse({ ...validPayload, taxRegime: "old" });
    expect(result.success).toBe(true);
  });

  // ── Inflation out-of-range ──────────────────────────────────────────────────

  it("rejects inflationHeadline above 20 (e.g. 99) — would be a 400", () => {
    const result = crmDefaultsUpdateSchema.safeParse({ ...validPayload, inflationHeadline: 99 });
    expect(result.success).toBe(false);
    if (result.success) return;
    const fields = result.error.issues.map(i => i.path[0]);
    expect(fields).toContain("inflationHeadline");
  });

  it("rejects inflationHeadline below 0 (e.g. -1)", () => {
    const result = crmDefaultsUpdateSchema.safeParse({ ...validPayload, inflationHeadline: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects inflationEdu above 20", () => {
    const result = crmDefaultsUpdateSchema.safeParse({ ...validPayload, inflationEdu: 21 });
    expect(result.success).toBe(false);
    if (result.success) return;
    const fields = result.error.issues.map(i => i.path[0]);
    expect(fields).toContain("inflationEdu");
  });

  it("rejects inflationHealth above 20", () => {
    const result = crmDefaultsUpdateSchema.safeParse({ ...validPayload, inflationHealth: 25 });
    expect(result.success).toBe(false);
    if (result.success) return;
    const fields = result.error.issues.map(i => i.path[0]);
    expect(fields).toContain("inflationHealth");
  });

  // ── Return rates out-of-range ───────────────────────────────────────────────

  it("rejects returnPre above 30", () => {
    const result = crmDefaultsUpdateSchema.safeParse({ ...validPayload, returnPre: 31 });
    expect(result.success).toBe(false);
    if (result.success) return;
    const fields = result.error.issues.map(i => i.path[0]);
    expect(fields).toContain("returnPre");
  });

  it("rejects returnPost above 30", () => {
    const result = crmDefaultsUpdateSchema.safeParse({ ...validPayload, returnPost: 50 });
    expect(result.success).toBe(false);
    if (result.success) return;
    const fields = result.error.issues.map(i => i.path[0]);
    expect(fields).toContain("returnPost");
  });

  it("rejects returnPre below 0", () => {
    const result = crmDefaultsUpdateSchema.safeParse({ ...validPayload, returnPre: -5 });
    expect(result.success).toBe(false);
  });

  // ── Life expectancy out-of-range ────────────────────────────────────────────

  it("rejects lifeExpectancy below 60 (e.g. 20) — would be a 400", () => {
    const result = crmDefaultsUpdateSchema.safeParse({ ...validPayload, lifeExpectancy: 20 });
    expect(result.success).toBe(false);
    if (result.success) return;
    const fields = result.error.issues.map(i => i.path[0]);
    expect(fields).toContain("lifeExpectancy");
  });

  it("rejects lifeExpectancy above 100 (e.g. 150)", () => {
    const result = crmDefaultsUpdateSchema.safeParse({ ...validPayload, lifeExpectancy: 150 });
    expect(result.success).toBe(false);
    if (result.success) return;
    const fields = result.error.issues.map(i => i.path[0]);
    expect(fields).toContain("lifeExpectancy");
  });

  it("rejects non-integer lifeExpectancy (e.g. 75.5)", () => {
    const result = crmDefaultsUpdateSchema.safeParse({ ...validPayload, lifeExpectancy: 75.5 });
    expect(result.success).toBe(false);
  });

  // ── Type and enum errors ────────────────────────────────────────────────────

  it("rejects an unknown taxRegime value", () => {
    const result = crmDefaultsUpdateSchema.safeParse({ ...validPayload, taxRegime: "flat" });
    expect(result.success).toBe(false);
    if (result.success) return;
    const fields = result.error.issues.map(i => i.path[0]);
    expect(fields).toContain("taxRegime");
  });

  it("rejects a missing required field (inflationHeadline absent)", () => {
    const { inflationHeadline, ...rest } = validPayload;
    const result = crmDefaultsUpdateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects string values where numbers are expected", () => {
    const result = crmDefaultsUpdateSchema.safeParse({ ...validPayload, inflationHeadline: "6" });
    expect(result.success).toBe(false);
  });

  // ── Error shape ─────────────────────────────────────────────────────────────

  it("includes at least one issue when validation fails", () => {
    const result = crmDefaultsUpdateSchema.safeParse({ ...validPayload, inflationHeadline: 99 });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.length).toBeGreaterThan(0);
  });
});
