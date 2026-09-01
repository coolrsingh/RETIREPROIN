/**
 * Regression coverage for the re-engagement badge in the leads table.
 *
 * The assertions are scoped to each lead's table row so the summary card's
 * separate "Re-engaged" label cannot satisfy the badge assertion.
 */

import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LeadsAdmin from "@/pages/leads-admin";

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "admin1", firstName: "Admin", role: "admin" },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

vi.mock("wouter", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/brand-logo", () => ({
  default: () => <span data-testid="brand-logo">RetirePro</span>,
}));

const reEngagedLead = {
  id: "re-engaged-1",
  name: "Re-engaged User",
  email: "reengaged@example.com",
  phone: "9876543210",
  createdAt: "2026-07-01T12:00:00.000Z",
  updatedAt: "2026-07-20T12:00:00.000Z",
  utm: { utm_source: "facebook" },
};

const freshLead = {
  id: "fresh-1",
  name: "Fresh User",
  email: "fresh@example.com",
  phone: "9123456780",
  createdAt: "2026-07-20T12:00:00.000Z",
  updatedAt: "2026-07-20T12:00:00.000Z",
  utm: { utm_source: "instagram" },
};

function renderLeads(leads: object[]) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: Infinity },
    },
  });
  queryClient.setQueryData(["/api/leads"], leads);

  return render(
    <QueryClientProvider client={queryClient}>
      <LeadsAdmin />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
});

describe("Leads Admin — re-engagement badge", () => {
  it("renders the Re-engaged badge for a lead contacted well after creation", () => {
    renderLeads([reEngagedLead]);

    const row = screen.getByRole("row", { name: /Re-engaged User/i });
    expect(within(row).getByText("Re-engaged")).toBeInTheDocument();
  });

  it("does not render the Re-engaged badge for a fresh lead", () => {
    renderLeads([freshLead]);

    const row = screen.getByRole("row", { name: /Fresh User/i });
    expect(within(row).queryByText("Re-engaged")).not.toBeInTheDocument();
  });
});