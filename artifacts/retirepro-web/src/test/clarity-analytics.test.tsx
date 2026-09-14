import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, waitFor } from "@testing-library/react";
import { Router, useLocation } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { afterEach, describe, expect, it, vi } from "vitest";

import ClarityAnalytics from "@/components/clarity-analytics";

const clarityScriptSelector = 'script[src^="https://www.clarity.ms/tag/"]';

function TrackedRouteAnalytics() {
  const [location] = useLocation();

  if (location === "/blog") {
    return <ClarityAnalytics projectId="xy8ayun8sm" />;
  }

  if (location === "/free-plan") {
    return <ClarityAnalytics projectId="xy8bw01xo3" />;
  }

  return null;
}

describe("Clarity analytics loading", () => {
  afterEach(() => {
    document.querySelectorAll(clarityScriptSelector).forEach((script) => script.remove());
    vi.restoreAllMocks();
  });

  it("keeps the HTML shell free of a second Clarity tag while the route loader owns injection", async () => {
    const htmlShell = readFileSync(
      resolve(import.meta.dirname, "../../index.html"),
      "utf8",
    );

    expect(htmlShell).not.toContain("clarity.ms/tag/");

    render(<ClarityAnalytics projectId="xy8ayun8sm" />);

    await waitFor(() => {
      expect(document.querySelectorAll(clarityScriptSelector)).toHaveLength(1);
    });
  });

  it("keeps one Clarity script when navigating between tracked routes without contacting Clarity", async () => {
    const externalRequest = vi.spyOn(window, "fetch");
    const location = memoryLocation({ path: "/blog" });

    render(
      <Router hook={location.hook}>
        <TrackedRouteAnalytics />
      </Router>,
    );

    await waitFor(() => {
      expect(document.querySelectorAll(clarityScriptSelector)).toHaveLength(1);
    });

    location.navigate("/free-plan");
    await waitFor(() => {
      expect(document.querySelectorAll(clarityScriptSelector)).toHaveLength(1);
    });

    expect(document.querySelector(clarityScriptSelector)).toHaveAttribute(
      "src",
      "https://www.clarity.ms/tag/xy8ayun8sm",
    );
    expect(externalRequest).not.toHaveBeenCalled();
  });
});