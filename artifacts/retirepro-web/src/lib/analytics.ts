type AnalyticsValue = string | number | boolean;
type AnalyticsParams = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    gtag?: (
      command: "config" | "event",
      target: string,
      params?: AnalyticsParams,
    ) => void;
    umami?: {
      track: (name: string, data?: AnalyticsParams) => void;
    };
  }
}

/**
 * Sends anonymous product events to configured analytics providers.
 * Tracking must never block or break the product if a provider is unavailable.
 */
export function trackEvent(name: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") return;

  try {
    window.gtag?.("event", name, params);
  } catch {
    // Analytics is best-effort and must not affect the user flow.
  }

  try {
    window.umami?.track(name, params);
  } catch {
    // Analytics is best-effort and must not affect the user flow.
  }
}

export function trackLoginIntent(source: string) {
  trackEvent("login_clicked", { source });
}