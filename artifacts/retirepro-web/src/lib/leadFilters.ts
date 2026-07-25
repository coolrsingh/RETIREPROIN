/**
 * Lead filter utilities — shared between the leads-admin view and its tests.
 * Keeping these as pure functions makes them easy to unit-test without
 * mounting the full React component.
 */

/** A lead is considered "re-engaged" when updatedAt differs from createdAt by more than 60 seconds. */
export function isReEngaged(lead: { updatedAt?: string | null; createdAt?: string | null }): boolean {
  if (!lead.updatedAt || !lead.createdAt) return false;
  const diff = Math.abs(
    new Date(lead.updatedAt).getTime() - new Date(lead.createdAt).getTime()
  );
  return diff > 60_000;
}

export type FilterKey = "all" | "re-engaged" | "7d" | "30d";

/** Returns true when the lead passes the given filter. */
export function passesFilter(
  lead: { updatedAt?: string | null; createdAt?: string | null },
  filter: FilterKey,
  now = Date.now()
): boolean {
  if (filter === "re-engaged") return isReEngaged(lead);
  if (filter === "7d") {
    const cutoff = now - 7 * 24 * 60 * 60 * 1000;
    return !!lead.updatedAt && new Date(lead.updatedAt).getTime() >= cutoff;
  }
  if (filter === "30d") {
    const cutoff = now - 30 * 24 * 60 * 60 * 1000;
    return !!lead.updatedAt && new Date(lead.updatedAt).getTime() >= cutoff;
  }
  // "all"
  return true;
}
