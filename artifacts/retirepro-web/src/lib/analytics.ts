type AnalyticsValue = string | number | boolean;
type AnalyticsParams = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    gtag?: (
      command: "config" | "event",
      target: string,
      params?: AnalyticsParams,
    ) => void;
  }
}

/**
 * Sends an anonymous GA4 event when analytics is available.
 * Tracking must never block or break the product if a browser blocks GA.
 */
export function trackEvent(name: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  try {
    window.gtag("event", name, params);
  } catch {
    // Analytics is best-effort and must not affect the user flow.
  }
}

export function trackLoginIntent(source: string) {
  trackEvent("login_clicked", { source });
}