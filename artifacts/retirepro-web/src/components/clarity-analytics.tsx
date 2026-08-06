import { useEffect } from "react";

// Microsoft Clarity project ID for the blog section.
const CLARITY_PROJECT_ID = "xy8ayun8sm";

/**
 * Injects the Microsoft Clarity tracking snippet once per page load.
 * Mount this only on the pages that should be tracked (see App.tsx, which
 * renders it for /blog and /blog/* routes).
 */
export default function ClarityAnalytics() {
  useEffect(() => {
    if (document.querySelector(`script[src^="https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}"]`)) {
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
    })(window, document, "clarity", "script", CLARITY_PROJECT_ID);
  }, []);

  return null;
}
