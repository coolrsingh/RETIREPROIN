/**
 * Layout regression tests for the landing page hero section at 320px.
 *
 * jsdom does not compute real CSS media queries, so these tests verify:
 *  1. The `hero-grid` class is applied so the media-query override in the
 *     inline <style> block can target it at runtime.
 *  2. The inline <style> block contains the correct single-column override
 *     for `.hero-grid` scoped inside the `max-width: 640px` media rule.
 *  3. The hero-cta class is applied so buttons receive the column-direction
 *     override at 320px.
 *  4. The hero-h class is applied so the headline font-size override fires.
 *  5. The hero-card class is applied so max-width is removed at 320px.
 *  6. All key hero elements — headline, both CTA buttons, and the plan card —
 *     are present in the DOM and not hidden.
 *
 * If a future refactor removes any of these classes or rewrites the media
 * query, the corresponding test will fail and surface the regression.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("wouter", () => ({
  useLocation: () => ["/", vi.fn()],
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Framer-motion mock: replace motion.div/motion.section/etc. with plain divs
// using a string-keyed factory to avoid JSX namespace issues.
vi.mock("framer-motion", () => {
  function makeTag(tag: string) {
    return function MotionTag(props: Record<string, unknown>) {
      const {
        children,
        initial: _i,
        animate: _a,
        transition: _t,
        whileInView: _w,
        viewport: _v,
        ...rest
      } = props;
      return React.createElement(tag, rest, children as React.ReactNode);
    };
  }

  return {
    motion: new Proxy({} as Record<string, ReturnType<typeof makeTag>>, {
      get(_target, prop: string) {
        return makeTag(prop);
      },
    }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

vi.mock("@/components/brand-logo", () => ({
  default: () => <div data-testid="brand-logo">RetirePro</div>,
}));

vi.mock("@/components/quick-plan-form", () => ({
  default: () => <div data-testid="quick-plan-form">Planner form</div>,
}));

vi.mock("@/components/advisor-section", () => ({
  default: () => <div data-testid="advisor-section">Advisor</div>,
}));

// ---------------------------------------------------------------------------
// Component under test
// ---------------------------------------------------------------------------
import Landing from "@/pages/landing";

// ---------------------------------------------------------------------------
// CSS helpers
// ---------------------------------------------------------------------------

/**
 * Returns the text content of every <style> tag rendered into the document.
 */
function getAllStyles(): string {
  return Array.from(document.querySelectorAll("style"))
    .map((s) => s.textContent ?? "")
    .join("\n");
}

/**
 * Extracts the body of the `@media (max-width: 640px)` block from the
 * aggregate inline styles.  Returns an empty string if the block is absent.
 *
 * We parse by finding the opening `@media (max-width: 640px)` token, then
 * walking characters to find the matching closing brace, so nested braces
 * inside rule-sets are handled correctly.
 */
function get640pxMediaBody(): string {
  const css = getAllStyles();
  const marker = "max-width: 640px";
  const start = css.indexOf(marker);
  if (start === -1) return "";

  // Walk backwards to find the opening '@media'
  const atIdx = css.lastIndexOf("@media", start);
  if (atIdx === -1) return "";

  // Find the first '{' after '@media …'
  const openBrace = css.indexOf("{", start);
  if (openBrace === -1) return "";

  // Walk forward, counting brace depth to find the matching '}'
  let depth = 0;
  let i = openBrace;
  while (i < css.length) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) return css.slice(openBrace + 1, i);
    }
    i++;
  }
  return "";
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe("Landing hero – 320px layout regression", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 320,
    });
    window.dispatchEvent(new Event("resize"));
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  // ── Class presence ────────────────────────────────────────────────────────

  it("applies the hero-grid class to the hero container so the 640px media-query can target it", () => {
    render(<Landing />);
    const heroGrid = document.querySelector(".hero-grid");
    expect(heroGrid).not.toBeNull();
  });

  it("applies the hero-cta class so buttons receive the column-direction override at 320px", () => {
    render(<Landing />);
    const ctaContainer = document.querySelector(".hero-cta");
    expect(ctaContainer).not.toBeNull();
  });

  it("applies the hero-h class to the headline so font-size is clamped at 320px", () => {
    render(<Landing />);
    const headline = document.querySelector(".hero-h");
    expect(headline).not.toBeNull();
  });

  it("applies the hero-card class so max-width is cleared and the card fills the column at 320px", () => {
    render(<Landing />);
    const card = document.querySelector(".hero-card");
    expect(card).not.toBeNull();
  });

  // ── Media-query rule correctness (scoped to the 640px block) ─────────────

  it("the @media (max-width: 640px) block exists in the inline styles", () => {
    render(<Landing />);
    const body = get640pxMediaBody();
    expect(body.length).toBeGreaterThan(0);
  });

  it("the 640px media block forces .hero-grid to a single column", () => {
    render(<Landing />);
    const body = get640pxMediaBody();
    expect(body).toMatch(/\.hero-grid\s*\{[^}]*grid-template-columns:\s*1fr\s*!important/);
  });

  it("the 640px media block collapses the .hero-grid gap so columns don't clip", () => {
    render(<Landing />);
    const body = get640pxMediaBody();
    expect(body).toMatch(/\.hero-grid\s*\{[^}]*gap:\s*\d+px\s*!important/);
  });

  it("the 640px media block stacks .hero-cta buttons vertically (flex-direction: column)", () => {
    render(<Landing />);
    const body = get640pxMediaBody();
    expect(body).toMatch(/\.hero-cta\s*\{[^}]*flex-direction:\s*column\s*!important/);
  });

  it("the 640px media block makes each .hero-cta button full-width", () => {
    render(<Landing />);
    const body = get640pxMediaBody();
    expect(body).toMatch(
      /\.hero-cta button,\s*\.hero-cta a\s*\{[^}]*width:\s*100%\s*!important/
    );
  });

  it("the 640px media block overrides .hero-h font-size to 36px", () => {
    render(<Landing />);
    const body = get640pxMediaBody();
    expect(body).toMatch(/\.hero-h\s*\{[^}]*font-size:\s*36px\s*!important/);
  });

  it("the 640px media block sets .hero-card max-width to 100% so it fills the column", () => {
    render(<Landing />);
    const body = get640pxMediaBody();
    expect(body).toMatch(/\.hero-card\s*\{[^}]*max-width:\s*100%\s*!important/);
  });

  // ── Element visibility ────────────────────────────────────────────────────

  it("headline text is present in the DOM and not inside an aria-hidden subtree", () => {
    render(<Landing />);
    const headline = document.querySelector("h1.hero-h") as HTMLElement | null;
    expect(headline).not.toBeNull();
    expect(headline!.textContent).toMatch(/retirement number/i);
    expect(headline!.closest("[aria-hidden='true']")).toBeNull();
  });

  it("primary CTA button is visible and not inside an aria-hidden subtree", () => {
    render(<Landing />);
    const cta = screen.getByTestId("button-get-started");
    expect(cta).toBeInTheDocument();
    expect(cta.closest("[aria-hidden='true']")).toBeNull();
  });

  it("secondary Sign-in CTA button is visible and not inside an aria-hidden subtree", () => {
    render(<Landing />);
    const signIn = screen.getByTestId("button-sign-in");
    expect(signIn).toBeInTheDocument();
    expect(signIn.closest("[aria-hidden='true']")).toBeNull();
  });

  it("the hero-grid contains both child columns (text + plan card)", () => {
    render(<Landing />);
    const heroGrid = document.querySelector(".hero-grid") as HTMLElement | null;
    expect(heroGrid).not.toBeNull();
    expect(Array.from(heroGrid!.children).length).toBeGreaterThanOrEqual(2);
  });

  it("the plan card label is visible inside the hero at 320px", () => {
    render(<Landing />);
    expect(screen.getByText(/Priya's Retirement Plan/i)).toBeInTheDocument();
  });

  it("the hero section has overflow: hidden so neither column bleeds past the viewport edge", () => {
    render(<Landing />);
    const section = document.querySelector(
      "section[style*='overflow']"
    ) as HTMLElement | null;
    expect(section).not.toBeNull();
    expect(section!.style.overflow).toBe("hidden");
  });
});
