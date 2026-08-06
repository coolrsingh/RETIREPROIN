import { useEffect } from "react";

interface ClarityAnalyticsProps {
  /** Microsoft Clarity project ID for the page(s) this is mounted on. */
  projectId: string;
}

/**
 * Injects the Microsoft Clarity tracking snippet for a given project ID,
 * once per page load. Different sections of the site use different Clarity
 * projects, so mount this with the right `projectId` per route (see App.tsx).
 */
export default function ClarityAnalytics({ projectId }: ClarityAnalyticsProps) {
  useEffect(() => {
    if (document.querySelector(`script[src^="https://www.clarity.ms/tag/${projectId}"]`)) {
      return;
    }

    (function (c: any, l: Document, a: string, r: string, i: string) {
      c[a] =
        c[a] ||
        function (...args: unknown[]) {
          (c[a].q = c[a].q || []).push(args);
        };
      const t = l.createElement(r) as HTMLScriptElement;
      t.async = true;
      t.src = "https://www.clarity.ms/tag/" + i;
      const y = l.getElementsByTagName(r)[0];
      y.parentNode?.insertBefore(t, y);
    })(window, document, "clarity", "script", projectId);
  }, [projectId]);

  return null;
}
