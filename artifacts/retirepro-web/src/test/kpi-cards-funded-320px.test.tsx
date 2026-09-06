import React from "react";
import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import KpiCards from "@/components/kpi-cards";

const fundedCalculations = {
  summary: {
    requiredCorpusAtRetirement: 30_000_000,
    projectedCorpusAtRetirement: 32_000_000,
    gap: -2_000_000,
    retirementYear: new Date().getFullYear() + 12,
    sipRequired: 25_000,
  },
};

describe("KPI cards — fully funded plan at 320px", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 320,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1024,
    });
  });

  it("renders only the four funded-plan cards and hides SIP", () => {
    render(<KpiCards calculations={fundedCalculations} />);

    const cards = screen.getByTestId("kpi-cards");
    expect(cards.children).toHaveLength(4);
    expect(screen.getByTestId("kpi-required-corpus")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-projected-corpus")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-funding-gap")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-years-to-retirement")).toBeInTheDocument();
    expect(screen.queryByTestId("kpi-sip-required")).not.toBeInTheDocument();
    expect(within(screen.getByTestId("kpi-funding-gap")).getByText("On track for retirement")).toBeVisible();
  });

  it("keeps a single-column mobile layout and uses four columns only on large screens", () => {
    render(<KpiCards calculations={fundedCalculations} />);

    expect(screen.getByTestId("kpi-cards")).toHaveClass(
      "grid-cols-1",
      "md:grid-cols-2",
      "lg:grid-cols-4",
    );
    expect(screen.getByTestId("kpi-cards")).not.toHaveClass("lg:grid-cols-5");
  });

  it("uses green borders, headings, icons, and values on every funded card", () => {
    render(<KpiCards calculations={fundedCalculations} />);

    for (const testId of [
      "kpi-required-corpus",
      "kpi-projected-corpus",
      "kpi-funding-gap",
      "kpi-years-to-retirement",
    ]) {
      const card = screen.getByTestId(testId);
      expect(card.style.border).toContain("22, 163, 74");
      expect(card.querySelector("p")?.style.color).toBe("rgb(21, 128, 61)");
      expect(card.querySelector("span")?.style.background).toContain("22, 163, 74");
    }
  });
});