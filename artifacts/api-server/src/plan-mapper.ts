/**
 * plan-mapper.ts
 *
 * Pure functions that convert validated QuickPlan request data into the
 * scenarioData shape consumed by calculateRetirementPlan.
 *
 * Extracting the mapping as pure functions makes the asset-assembly contract
 * independently testable without standing up an HTTP server.
 */

export interface PlanAsset {
  id: string;
  kind: string;
  value: string;
  expectedReturnPre: string;
  expectedReturnPost: string;
}

/**
 * Build the asset list for a guest/in-memory plan.
 *
 * Rules:
 * - Accumulating mode: assetsLumpSum + EPF corpus + NPS corpus each become
 *   separate equity assets with their own expected return rates.
 * - Retired mode: ONLY currentCorpus is included.  EPF and NPS are excluded
 *   because users enter currentCorpus as their total invested balance
 *   (which already includes any EPF/NPS balance).  Adding them separately
 *   would double-count those amounts and inflate the drawdown projection.
 */
export function buildGuestAssets(
  planData: {
    personaMode?: string;
    assetsLumpSum?: number;
    epfCorpus?: number;
    npsCorpus?: number;
    currentCorpus?: number;
  },
  returnPreStr: string,
  returnPostStr: string,
): PlanAsset[] {
  if (planData.personaMode === "retired") {
    // Retired mode: currentCorpus is the sole corpus asset.
    return planData.currentCorpus && planData.currentCorpus > 0
      ? [
          {
            id: "corpus",
            kind: "equity",
            value: String(planData.currentCorpus),
            expectedReturnPre: returnPostStr,  // conservative throughout drawdown
            expectedReturnPost: returnPostStr,
          },
        ]
      : [];
  }

  // Accumulating mode: individual components are separate assets.
  const assets: PlanAsset[] = [];
  if (planData.assetsLumpSum && planData.assetsLumpSum > 0) {
    assets.push({
      id: "1",
      kind: "equity",
      value: String(planData.assetsLumpSum),
      expectedReturnPre: returnPreStr,
      expectedReturnPost: returnPostStr,
    });
  }
  if (planData.epfCorpus && planData.epfCorpus > 0) {
    assets.push({
      id: "epf",
      kind: "equity",
      value: String(planData.epfCorpus),
      expectedReturnPre: "8",
      expectedReturnPost: returnPostStr,
    });
  }
  if (planData.npsCorpus && planData.npsCorpus > 0) {
    assets.push({
      id: "nps",
      kind: "equity",
      value: String(planData.npsCorpus),
      expectedReturnPre: "10",
      expectedReturnPost: returnPostStr,
    });
  }
  return assets;
}
