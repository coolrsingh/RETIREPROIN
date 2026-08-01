/**
 * Integration test: re-engagement badge chain
 *
 * Verifies the full path:
 *   POST /api/lead (first submission) → lead stored with createdAt
 *   → createdAt backdated to simulate time passing (>60 s)
 *   → second POST /api/lead (same phone) → upsert bumps updatedAt
 *   → updatedAt > createdAt by more than 60 s in the persisted row
 *   → isReEngaged logic (inlined from leadFilters.ts) returns true
 *   → GET /api/leads row has both timestamp fields correctly set
 *
 * isReEngaged is inlined here to avoid a cross-package import that falls
 * outside this artifact's tsconfig rootDir.  It must remain in sync with
 * artifacts/retirepro-web/src/lib/leadFilters.ts.
 */

import { describe, it, expect, afterEach } from "vitest";
import { storage } from "../storage";
import { db } from "../db";
import { leads } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Inlined from artifacts/retirepro-web/src/lib/leadFilters.ts
// Keep in sync with the source.
// ---------------------------------------------------------------------------
function isReEngaged(lead: { updatedAt?: Date | string | null; createdAt?: Date | string | null }): boolean {
  if (!lead.updatedAt || !lead.createdAt) return false;
  const diff = Math.abs(
    new Date(lead.updatedAt as string).getTime() - new Date(lead.createdAt as string).getTime()
  );
  return diff > 60_000;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A clearly test-only phone number that won't collide with real leads. */
const TEST_PHONE = "0000000000_reengagement_test";

afterEach(async () => {
  await db.delete(leads).where(eq(leads.phone, TEST_PHONE));
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("lead re-engagement — full storage chain", () => {
  it(
    "second submission for the same phone sets updatedAt > createdAt by >60 s, so isReEngaged is true",
    async () => {
      // 1. First submission — creates the lead row.
      const firstLead = await storage.createLead({
        name: "Test User",
        phone: TEST_PHONE,
        email: "reengagement-test@example.com",
      });

      expect(firstLead.createdAt).not.toBeNull();
      expect(firstLead.updatedAt).not.toBeNull();

      // Immediately after insert the timestamps are essentially equal, so
      // the lead is NOT yet re-engaged.
      expect(isReEngaged(firstLead)).toBe(false);

      // 2. Backdate createdAt to simulate that the first submission happened
      //    2 minutes ago.  This is what would be true in production when a
      //    real user resubmits after some time.
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      await db
        .update(leads)
        .set({ createdAt: twoMinutesAgo })
        .where(eq(leads.phone, TEST_PHONE));

      // 3. Second submission — same phone number, different name/email.
      //    The upsert sets updatedAt: new Date(), so the gap will be ~2 min.
      const secondLead = await storage.createLead({
        name: "Test User Updated",
        phone: TEST_PHONE,
        email: "reengagement-test-updated@example.com",
      });

      // Must be the same row (upsert, not insert).
      expect(secondLead.id).toBe(firstLead.id);

      // 4. Confirm timestamps: updatedAt must be strictly later than createdAt.
      expect(secondLead.createdAt).not.toBeNull();
      expect(secondLead.updatedAt).not.toBeNull();

      const createdMs = new Date(secondLead.createdAt as Date).getTime();
      const updatedMs = new Date(secondLead.updatedAt as Date).getTime();
      expect(updatedMs).toBeGreaterThan(createdMs);

      // The gap must exceed the 60-second threshold.
      expect(updatedMs - createdMs).toBeGreaterThan(60_000);

      // 5. isReEngaged on the actual persisted lead must return true.
      expect(isReEngaged(secondLead)).toBe(true);
    },
  );

  it("GET /api/leads row exposes both createdAt and updatedAt fields with correct types", async () => {
    // Insert a lead then read it back exactly as GET /api/leads does
    // (db.select().from(leads)) to confirm the response shape includes
    // both timestamp columns.
    await storage.createLead({
      name: "Shape Test User",
      phone: TEST_PHONE,
    });

    const [row] = await db
      .select()
      .from(leads)
      .where(eq(leads.phone, TEST_PHONE));

    expect(row).toBeDefined();
    expect(row.createdAt).toBeInstanceOf(Date);
    expect(row.updatedAt).toBeInstanceOf(Date);
    // Both fields must be non-null — they are required for badge rendering.
    expect(row.createdAt).not.toBeNull();
    expect(row.updatedAt).not.toBeNull();
  });

  it("isReEngaged returns false for a fresh lead (updatedAt ≈ createdAt)", async () => {
    const lead = await storage.createLead({
      name: "Fresh User",
      phone: TEST_PHONE,
    });
    // No time has elapsed — gap is milliseconds, well under 60 s.
    expect(isReEngaged(lead)).toBe(false);
  });
});
