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
// Combined filter + search (mirrors leads-admin.tsx filteredLeads logic)
// ---------------------------------------------------------------------------

/**
 * Mirrors the filteredLeads computation in leads-admin.tsx so we can unit-test
 * the AND combination of filter button and search query without mounting React.
 */
function applyFilterAndSearch(
  leads: Array<{
    createdAt: string | null;
    updatedAt: string | null;
    name?: string;
    email?: string;
    phone?: string;
  }>,
  filter: FilterKey,
  searchQuery: string,
  now = NOW,
): typeof leads {
  const searchTerm = searchQuery.trim().toLowerCase();
  return leads.filter((lead) => {
    if (!passesFilter(lead, filter, now)) return false;
    if (searchTerm) {
      const name = (lead.name ?? "").toLowerCase();
      const email = (lead.email ?? "").toLowerCase();
      const phone = (lead.phone ?? "").toLowerCase();
      if (
        !name.includes(searchTerm) &&
        !email.includes(searchTerm) &&
        !phone.includes(searchTerm)
      )
        return false;
    }
    return true;
  });
}

/** Extend makeLead with contact fields for search tests. */
function makeFullLead(opts: {
  createdMsAgo: number;
  updatedMsAgo: number;
  name?: string;
  email?: string;
  phone?: string;
}): {
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  phone: string;
} {
  return {
    createdAt: new Date(NOW - opts.createdMsAgo).toISOString(),
    updatedAt: new Date(NOW - opts.updatedMsAgo).toISOString(),
    name: opts.name ?? "Test User",
    email: opts.email ?? "test@example.com",
    phone: opts.phone ?? "9999999999",
  };
}

describe("filter + search combined (AND logic)", () => {
  // Two leads: one re-engaged, one not.
  // The re-engaged one matches the search term; the other does not.
  const reEngagedMatchingSearch = makeFullLead({
    createdMsAgo: 10 * 86_400_000,
    updatedMsAgo: 86_400_000,          // re-engaged: diff > 60 s
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "9876543210",
  });
  const notReEngagedNoSearchMatch = makeFullLead({
    createdMsAgo: 5 * 86_400_000,
    updatedMsAgo: 5 * 86_400_000 - 1_000, // NOT re-engaged: diff < 60 s
    name: "Rohan Mehta",
    email: "rohan@example.com",
    phone: "8888888888",
  });
  // A lead that matches the search but is outside the 7-day window.
  const oldMatchingSearch = makeFullLead({
    createdMsAgo: 60 * 86_400_000,
    updatedMsAgo: 20 * 86_400_000,     // 20 days old — outside 7d, inside 30d
    name: "Priya Old",
    email: "priya.old@example.com",
    phone: "7777777777",
  });

  const allLeads = [reEngagedMatchingSearch, notReEngagedNoSearchMatch, oldMatchingSearch];

  it("filter active + search match — returns only leads that pass BOTH", () => {
    // Filter: re-engaged; search: "priya"
    const result = applyFilterAndSearch(allLeads, "re-engaged", "priya");
    // reEngagedMatchingSearch passes both; oldMatchingSearch is re-engaged? Check:
    // oldMatchingSearch: diff = 60*86400000 - 20*86400000 = 40 days >> 60s → re-engaged AND name includes "priya"
    // Both should be in the result.
    expect(result).toContain(reEngagedMatchingSearch);
    expect(result).toContain(oldMatchingSearch);
    // notReEngagedNoSearchMatch fails the filter
    expect(result).not.toContain(notReEngagedNoSearchMatch);
    expect(result).toHaveLength(2);
  });

  it("filter active + search no-match — returns empty list when search term has no hits", () => {
    // Filter: re-engaged; search term that matches nobody
    const result = applyFilterAndSearch(allLeads, "re-engaged", "zzznomatch");
    expect(result).toHaveLength(0);
  });

  it("filter 'all' + search — returns every lead whose contact fields match the term", () => {
    // filter: all; search: "priya"
    const result = applyFilterAndSearch(allLeads, "all", "priya");
    expect(result).toContain(reEngagedMatchingSearch);
    expect(result).toContain(oldMatchingSearch);
    expect(result).not.toContain(notReEngagedNoSearchMatch);
    expect(result).toHaveLength(2);
  });

  it("filter 'all' + empty search — returns all leads without any omissions or duplicates", () => {
    const result = applyFilterAndSearch(allLeads, "all", "");
    expect(result).toHaveLength(allLeads.length);
    // No duplicates
    const ids = result.map((l) => l.email);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("clearing search while filter is active — result equals filter-only result", () => {
    // First apply filter + search, then clear search
    const withSearch = applyFilterAndSearch(allLeads, "7d", "priya");
    const searchCleared = applyFilterAndSearch(allLeads, "7d", "");
    // The cleared-search result must be a superset of the search result
    for (const lead of withSearch) {
      expect(searchCleared).toContain(lead);
    }
    // And the cleared result should equal the pure filter result
    const filterOnly = allLeads.filter((l) => passesFilter(l, "7d", NOW));
    expect(searchCleared).toEqual(filterOnly);
  });

  it("search by email while a time filter is active — correct intersection", () => {
    // Filter: 30d (oldMatchingSearch is 20 days old → passes); search: "old"
    const result = applyFilterAndSearch(allLeads, "30d", "old");
    expect(result).toContain(oldMatchingSearch);
    expect(result).not.toContain(reEngagedMatchingSearch); // name is "Priya Sharma", not "old"
    expect(result).not.toContain(notReEngagedNoSearchMatch);
  });

  it("search by phone while a filter is active — phone match is honoured", () => {
    // Filter: all; search: "8888" — matches notReEngagedNoSearchMatch's phone
    const result = applyFilterAndSearch(allLeads, "all", "8888");
    expect(result).toContain(notReEngagedNoSearchMatch);
    expect(result).not.toContain(reEngagedMatchingSearch);
    expect(result).not.toContain(oldMatchingSearch);
  });

  it("no lead appears more than once regardless of filter+search combination", () => {
    const combinations: Array<[FilterKey, string]> = [
      ["all", ""],
      ["all", "priya"],
      ["re-engaged", "priya"],
      ["7d", ""],
      ["30d", "old"],
    ];
    for (const [filter, search] of combinations) {
      const result = applyFilterAndSearch(allLeads, filter, search);
      const emails = result.map((l) => l.email);
      expect(new Set(emails).size).toBe(emails.length);
    }
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
