/**
 * SSR entry point — used only during build-time prerendering.
 *
 * Exports:
 *   render(url): string   — renders the app at the given path to HTML
 *   BLOG_POSTS            — canonical blog post list (for route enumeration)
 */

// ---------------------------------------------------------------------------
// Browser globals polyfill — must come before any React imports
// ---------------------------------------------------------------------------
if (typeof globalThis.window === "undefined") {
  const noop = () => {};
  const noopEl = () => ({
    content: "",
    href: "",
    getAttribute: () => null,
    setAttribute: noop,
  });

  /**
   * Some globalThis properties in Node.js (navigator, location, performance…)
   * are defined with a getter and no setter.  Attempting direct assignment
   * throws.  Use Object.defineProperty as a safe fallback.
   */
  function setGlobal(name: string, value: unknown) {
    try {
      (globalThis as any)[name] = value;
    } catch {
      try {
        Object.defineProperty(globalThis, name, {
          value,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      } catch {
        /* ignore */
      }
    }
  }

  (globalThis as any).window = {
    scrollTo: noop,
    scrollY: 0,
    scrollX: 0,
    innerWidth: 1280,
    innerHeight: 800,
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: noop,
    matchMedia: () => ({
      matches: false,
      addEventListener: noop,
      removeEventListener: noop,
      addListener: noop,
      removeListener: noop,
    }),
    location: {
      pathname: "/",
      href: "https://retirepro.in/",
      origin: "https://retirepro.in",
      search: "",
      hash: "",
    },
    history: { pushState: noop, replaceState: noop, state: null, back: noop, forward: noop },
    getComputedStyle: () => ({ getPropertyValue: () => "", setProperty: noop }),
    requestAnimationFrame: noop,
    cancelAnimationFrame: noop,
    setTimeout: globalThis.setTimeout ?? noop,
    clearTimeout: globalThis.clearTimeout ?? noop,
    setInterval: globalThis.setInterval ?? noop,
    clearInterval: globalThis.clearInterval ?? noop,
    ResizeObserver: class {
      observe = noop;
      unobserve = noop;
      disconnect = noop;
    },
    IntersectionObserver: class {
      observe = noop;
      unobserve = noop;
      disconnect = noop;
    },
    MutationObserver: class {
      observe = noop;
      disconnect = noop;
    },
    performance: { now: () => 0, mark: noop, measure: noop },
    devicePixelRatio: 1,
    screen: { width: 1280, height: 800 },
    navigator: { userAgent: "SSR", language: "en-IN" },
  };

  (globalThis as any).document = {
    title: "",
    cookie: "",
    documentElement: { lang: "en", style: {}, setAttribute: noop },
    head: {
      appendChild: noop,
      querySelector: () => null,
      querySelectorAll: () => [],
    },
    body: {
      classList: { add: noop, remove: noop, contains: () => false },
      style: {},
      appendChild: noop,
    },
    querySelector: () => noopEl(),
    querySelectorAll: () => [],
    getElementById: () => null,
    createElement: (tag: string) => ({
      tagName: tag.toUpperCase(),
      style: {},
      setAttribute: noop,
      getAttribute: () => null,
      appendChild: noop,
      classList: { add: noop, remove: noop, contains: () => false },
      innerHTML: "",
      textContent: "",
    }),
    createTextNode: (text: string) => ({ textContent: text }),
    createComment: () => ({}),
    createDocumentFragment: () => ({ appendChild: noop, childNodes: [] }),
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: noop,
  };

  const _storage = {
    getItem: () => null,
    setItem: noop,
    removeItem: noop,
    clear: noop,
    key: () => null,
    length: 0,
  };
  setGlobal("localStorage", _storage);
  setGlobal("sessionStorage", _storage);
  setGlobal("navigator", { userAgent: "SSR", language: "en-IN" });
  setGlobal("location", (globalThis as any).window.location);
  setGlobal("history", (globalThis as any).window.history);
  setGlobal("getComputedStyle", (globalThis as any).window.getComputedStyle);
  setGlobal("requestAnimationFrame", noop);
  setGlobal("cancelAnimationFrame", noop);
  setGlobal("ResizeObserver", (globalThis as any).window.ResizeObserver);
  setGlobal("IntersectionObserver", (globalThis as any).window.IntersectionObserver);
  setGlobal("MutationObserver", (globalThis as any).window.MutationObserver);
  setGlobal("performance", (globalThis as any).window.performance);
  setGlobal("matchMedia", (globalThis as any).window.matchMedia);
  setGlobal("CSS", { supports: () => false, escape: (s: string) => s });
}

// ---------------------------------------------------------------------------
// React + app imports
// ---------------------------------------------------------------------------
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Router, Switch, Route } from "wouter";

// Public page components
import Landing from "@/pages/landing";
import BlogIndex from "@/pages/blog-index";
import Blog1 from "@/pages/blog-1";
import Blog2 from "@/pages/blog-2";
import Blog3 from "@/pages/blog-3";
import Blog4 from "@/pages/blog-4";
import Blog5 from "@/pages/blog-5";
import Blog6 from "@/pages/blog-6";
import Blog7 from "@/pages/blog-7";
import Blog8 from "@/pages/blog-8";
import Blog9 from "@/pages/blog-9";
import Blog10 from "@/pages/blog-10";
import Blog11 from "@/pages/blog-11";
import FreePlan from "@/pages/free-plan";
import FAQ from "@/pages/faq";
import AdLanding from "@/pages/ad-landing";

// Re-export canonical blog list for use by prerender.mjs
export { BLOG_POSTS } from "@/data/blog-posts";

// ---------------------------------------------------------------------------
// SSR routing helper
// ---------------------------------------------------------------------------

/** Returns a wouter hook that always reports the given static path. */
function makeStaticHook(path: string) {
  return () => [path, (_to: string) => {}] as [string, (to: string) => void];
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Render the React app at `url` to an HTML string.
 * The returned string is the content of <div id="root">…</div>.
 */
export function render(url: string): string {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
      },
    },
  });

  const app = (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router hook={makeStaticHook(url)} base="">
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/blog" component={BlogIndex} />
            <Route path="/blog/why-indians-fail-retirement" component={Blog1} />
            <Route path="/blog/nps-vs-ppf-vs-sip" component={Blog2} />
            <Route path="/blog/real-estate-rich-retirement-illusion" component={Blog3} />
            <Route path="/blog/how-much-to-retire-india" component={Blog4} />
            <Route path="/blog/retirement-corpus-calculator-india-serious-planners" component={Blog5} />
            <Route path="/blog/nps-vs-ups-vs-ops-which-is-better" component={Blog6} />
            <Route path="/blog/how-much-money-to-retire-in-india" component={Blog7} />
            <Route path="/blog/retirement-planning-self-employed-india" component={Blog8} />
            <Route path="/blog/nps-withdrawal-rules-2026" component={Blog9} />
            <Route path="/blog/best-retirement-planning-tool-india" component={Blog10} />
            <Route path="/blog/sabbatical-mini-retirement-startup-calculator" component={Blog11} />
            <Route path="/free-plan" component={FreePlan} />
            <Route path="/faq" component={FAQ} />
            <Route path="/go" component={AdLanding} />
          </Switch>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );

  return renderToString(app);
}
