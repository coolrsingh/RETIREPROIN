import { describe, it, expect } from "vitest";
import { isReEngaged, passesFilter } from "@/lib/leadFilters";
import type { FilterKey } from "@/lib/leadFilters";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NOW = new Date("2026-07-25T12:00:00.000Z").getTime();

/** Build a minimal lead object with timestamps offset from NOW. */
function makeLead(opts: {
  createdMsAgo: number;
  updatedMsAgo: number;
}): { createdAt: string; updatedAt: string } {
  return {
    createdAt: new Date(NOW - opts.createdMsAgo).toISOString(),
    updatedAt: new Date(NOW - opts.updatedMsAgo).toISOString(),
  };
}

// ---------------------------------------------------------------------------
// isReEngaged
// ---------------------------------------------------------------------------

describe("isReEngaged", () => {
  it("returns false when updatedAt is missing", () => {
    expect(isReEngaged({ createdAt: new Date(NOW).toISOString(), updatedAt: null })).toBe(false);
  });

  it("returns false when createdAt is missing", () => {
    expect(isReEngaged({ updatedAt: new Date(NOW).toISOString(), createdAt: null })).toBe(false);
  });

  it("returns false when both timestamps are missing", () => {
    expect(isReEngaged({ createdAt: null, updatedAt: null })).toBe(false);
  });

  it("returns false when updatedAt equals createdAt (diff = 0 ms)", () => {
    const ts = new Date(NOW).toISOString();
    expect(isReEngaged({ createdAt: ts, updatedAt: ts })).toBe(false);
  });

  it("returns false when diff is exactly 60 000 ms (boundary — not > 60 s)", () => {
    const lead = makeLead({ createdMsAgo: 120_000, updatedMsAgo: 60_000 });
    expect(isReEngaged(lead)).toBe(false);
  });

  it("returns true when diff is 60 001 ms (just above threshold)", () => {
    const lead = makeLead({ createdMsAgo: 120_001, updatedMsAgo: 60_000 });
    expect(isReEngaged(lead)).toBe(true);
  });

  it("returns true for a genuinely re-engaged lead (diff >> 60 s)", () => {
    // e.g. created 30 days ago, updated 1 day ago
    const lead = makeLead({ createdMsAgo: 30 * 86_400_000, updatedMsAgo: 86_400_000 });
    expect(isReEngaged(lead)).toBe(true);
  });

  it("uses Math.abs so updatedAt earlier than createdAt also counts", () => {
    // Simulate clock skew: updatedAt 2 min BEFORE createdAt
    const lead = {
      createdAt: new Date(NOW).toISOString(),
      updatedAt: new Date(NOW - 120_000).toISOString(),
    };
    expect(isReEngaged(lead)).toBe(true);
  });

  it("matches the badge display — a lead that shows the badge also passes the filter", () => {
    const lead = makeLead({ createdMsAgo: 10 * 86_400_000, updatedMsAgo: 86_400_000 });
    // The badge shows when isReEngaged is true; the filter should match exactly
    const badgeShown = isReEngaged(lead);
    const passesReEngagedFilter = passesFilter(lead, "re-engaged");
    expect(badgeShown).toBe(true);
    expect(passesReEngagedFilter).toBe(badgeShown);
  });
});

// ---------------------------------------------------------------------------
// passesFilter — "all"
// ---------------------------------------------------------------------------

describe('passesFilter — "all"', () => {
  it("returns true for every lead regardless of timestamps", () => {
    const leads = [
      makeLead({ createdMsAgo: 0, updatedMsAgo: 0 }),
      makeLead({ createdMsAgo: 60 * 86_400_000, updatedMsAgo: 60 * 86_400_000 }),
      { createdAt: null, updatedAt: null },
    ];
    for (const lead of leads) {
      expect(passesFilter(lead, "all", NOW)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// passesFilter — "re-engaged"
// ---------------------------------------------------------------------------

describe('passesFilter — "re-engaged"', () => {
  it("includes a lead that qualifies as re-engaged", () => {
    const lead = makeLead({ createdMsAgo: 20 * 86_400_000, updatedMsAgo: 86_400_000 });
    expect(passesFilter(lead, "re-engaged", NOW)).toBe(true);
  });

  it("excludes a lead whose timestamps are too close together", () => {
    const lead = makeLead({ createdMsAgo: 1_000, updatedMsAgo: 0 });
    expect(passesFilter(lead, "re-engaged", NOW)).toBe(false);
  });

  it("excludes a lead with missing updatedAt", () => {
    expect(passesFilter({ createdAt: new Date(NOW).toISOString(), updatedAt: null }, "re-engaged", NOW)).toBe(false);
  });

  it("result is always consistent with isReEngaged (badge parity)", () => {
    const samples = [
      makeLead({ createdMsAgo: 0, updatedMsAgo: 0 }),
      makeLead({ createdMsAgo: 90_000, updatedMsAgo: 0 }),
      makeLead({ createdMsAgo: 10 * 86_400_000, updatedMsAgo: 3 * 86_400_000 }),
    ];
    for (const lead of samples) {
      expect(passesFilter(lead, "re-engaged", NOW)).toBe(isReEngaged(lead));
    }
  });
});

// ---------------------------------------------------------------------------
// passesFilter — "7d"
// ---------------------------------------------------------------------------

describe('passesFilter — "7d"', () => {
  it("includes a lead updated 1 hour ago", () => {
    const lead = makeLead({ createdMsAgo: 5 * 86_400_000, updatedMsAgo: 3_600_000 });
    expect(passesFilter(lead, "7d", NOW)).toBe(true);
  });

  it("includes a lead updated exactly at the 7-day boundary", () => {
    const lead = makeLead({ createdMsAgo: 10 * 86_400_000, updatedMsAgo: 7 * 24 * 60 * 60 * 1000 });
    expect(passesFilter(lead, "7d", NOW)).toBe(true);
  });

  it("excludes a lead updated 8 days ago", () => {
    const lead = makeLead({ createdMsAgo: 15 * 86_400_000, updatedMsAgo: 8 * 86_400_000 });
    expect(passesFilter(lead, "7d", NOW)).toBe(false);
  });

  it("excludes a lead with missing updatedAt", () => {
    expect(passesFilter({ createdAt: new Date(NOW).toISOString(), updatedAt: null }, "7d", NOW)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// passesFilter — "30d"
// ---------------------------------------------------------------------------

describe('passesFilter — "30d"', () => {
  it("includes a lead updated 15 days ago", () => {
    const lead = makeLead({ createdMsAgo: 60 * 86_400_000, updatedMsAgo: 15 * 86_400_000 });
    expect(passesFilter(lead, "30d", NOW)).toBe(true);
  });

  it("includes a lead updated exactly at the 30-day boundary", () => {
    const lead = makeLead({ createdMsAgo: 60 * 86_400_000, updatedMsAgo: 30 * 24 * 60 * 60 * 1000 });
    expect(passesFilter(lead, "30d", NOW)).toBe(true);
  });

  it("excludes a lead updated 31 days ago", () => {
    const lead = makeLead({ createdMsAgo: 60 * 86_400_000, updatedMsAgo: 31 * 86_400_000 });
    expect(passesFilter(lead, "30d", NOW)).toBe(false);
  });

  it("excludes a lead with missing updatedAt", () => {
    expect(passesFilter({ createdAt: new Date(NOW).toISOString(), updatedAt: null }, "30d", NOW)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Cross-filter consistency
// ---------------------------------------------------------------------------

describe("filter consistency across all modes", () => {
  it("a lead in the 7d window also passes the 30d filter", () => {
    const lead = makeLead({ createdMsAgo: 10 * 86_400_000, updatedMsAgo: 5 * 86_400_000 });
    expect(passesFilter(lead, "7d", NOW)).toBe(true);
    expect(passesFilter(lead, "30d", NOW)).toBe(true);
    expect(passesFilter(lead, "all", NOW)).toBe(true);
  });

  it("a lead in the 30d window but outside 7d is excluded from 7d only", () => {
    const lead = makeLead({ createdMsAgo: 40 * 86_400_000, updatedMsAgo: 20 * 86_400_000 });
    expect(passesFilter(lead, "7d", NOW)).toBe(false);
    expect(passesFilter(lead, "30d", NOW)).toBe(true);
    expect(passesFilter(lead, "all", NOW)).toBe(true);
  });

  it("a lead older than 30 days fails both time-window filters but always passes 'all'", () => {
    const lead = makeLead({ createdMsAgo: 90 * 86_400_000, updatedMsAgo: 45 * 86_400_000 });
    expect(passesFilter(lead, "7d", NOW)).toBe(false);
    expect(passesFilter(lead, "30d", NOW)).toBe(false);
    expect(passesFilter(lead, "all", NOW)).toBe(true);
  });

  it("all filter keys are exercised in a single batch without unexpected throws", () => {
    const lead = makeLead({ createdMsAgo: 5 * 86_400_000, updatedMsAgo: 2 * 86_400_000 });
    const filters: FilterKey[] = ["all", "re-engaged", "7d", "30d"];
    expect(() => {
      for (const f of filters) passesFilter(lead, f, NOW);
    }).not.toThrow();
  });
});
