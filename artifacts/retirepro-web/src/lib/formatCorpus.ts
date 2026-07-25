/**
 * Formats a projected retirement corpus number for display on plan cards.
 * Returns null when the corpus is missing or non-positive.
 */
export function formatCorpus(corpus: number | null | undefined): string | null {
  if (corpus == null || corpus <= 0) return null;
  if (corpus >= 10_000_000) {
    return `₹${(corpus / 10_000_000).toFixed(1)} Cr projected`;
  }
  if (corpus >= 100_000) {
    return `₹${(corpus / 100_000).toFixed(1)} L projected`;
  }
  return `₹${corpus.toLocaleString('en-IN', { maximumFractionDigits: 0 })} projected`;
}
