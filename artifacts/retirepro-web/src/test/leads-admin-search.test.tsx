/**
 * Tests for search + filter combination on the Leads Admin page.
 *
 * Covers:
 *  - Search by name / email / phone narrows the displayed rows.
 *  - Search AND filter buttons apply AND logic (both must pass).
 *  - The clear (×) button resets the search input to empty.
 *  - Empty state shows the typed search term and a "Clear search" link when
 *    no rows match.
 *  - Export CSV button is disabled when the combined result is empty,
 *    confirming it operates on the filtered+searched set.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LeadsAdmin from "@/pages/leads-admin";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

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
  useLocation: () => ["/leads", vi.fn()],
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/brand-logo", () => ({
  default: () => <span data-testid="brand-logo">RetirePro</span>,
}));

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

// Use real Date.now() so that time-window filters (7d / 30d) work correctly
// against the component's own passesFilter which also uses Date.now().
const realNow = Date.now();
const daysAgo = (n: number) => new Date(realNow - n * 86_400_000).toISOString();

/** Lead created and updated at the same time — NOT re-engaged, older than 30 d. */
const aliceLead = {
  id: "1",
  name: "Alice Sharma",
  email: "alice@example.com",
  phone: "9100000001",   // unique prefix "910" — not a substring of any other phone
  createdAt: daysAgo(60),
  updatedAt: daysAgo(60),
  utm: { utm_source: "facebook" },
};

/** Lead created 15 d ago, updated 2 d ago — re-engaged, inside 7 d window. */
const bobLead = {
  id: "2",
  name: "Bob Mehta",
  email: "bob@example.com",
  phone: "8200000002",   // unique prefix "820"
  createdAt: daysAgo(15),
  updatedAt: daysAgo(2),
  utm: { utm_source: "instagram" },
};

/** Lead created 5 d ago, never re-engaged, inside 7 d window. */
const carolLead = {
  id: "3",
  name: "Carol Nair",
  email: "carol@example.com",
  phone: "7300000003",   // unique prefix "730"
  createdAt: daysAgo(5),
  updatedAt: daysAgo(5),
  utm: { utm_source: "facebook" },
};

const allLeads = [aliceLead, bobLead, carolLead];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
}

function renderLeadsAdmin(queryClient: QueryClient) {
  // Seed the cache so the component never actually fetches.
  queryClient.setQueryData(["/api/leads"], allLeads);

  return render(
    <QueryClientProvider client={queryClient}>
      <LeadsAdmin />
    </QueryClientProvider>
  );
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe("Leads Admin — search + filter", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = makeQueryClient();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // 1. Search by name
  // -------------------------------------------------------------------------
  it("narrows rows when typing a name in the search box", async () => {
    renderLeadsAdmin(queryClient);
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/search by name/i);
    await user.type(input, "alice");

    await waitFor(() => {
      expect(screen.getByText("Alice Sharma")).toBeInTheDocument();
      expect(screen.queryByText("Bob Mehta")).not.toBeInTheDocument();
      expect(screen.queryByText("Carol Nair")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // 2. Search by email
  // -------------------------------------------------------------------------
  it("narrows rows when typing an email fragment", async () => {
    renderLeadsAdmin(queryClient);
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/search by name/i);
    await user.type(input, "bob@");

    await waitFor(() => {
      expect(screen.queryByText("Alice Sharma")).not.toBeInTheDocument();
      expect(screen.getByText("Bob Mehta")).toBeInTheDocument();
      expect(screen.queryByText("Carol Nair")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // 3. Search by phone
  // -------------------------------------------------------------------------
  it("narrows rows when typing a phone fragment", async () => {
    renderLeadsAdmin(queryClient);
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/search by name/i);
    // Carol's phone starts with the unique prefix "730"
    await user.type(input, "730");

    await waitFor(() => {
      expect(screen.queryByText("Alice Sharma")).not.toBeInTheDocument();
      expect(screen.queryByText("Bob Mehta")).not.toBeInTheDocument();
      expect(screen.getByText("Carol Nair")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // 4. Search + filter = AND logic
  // -------------------------------------------------------------------------
  it("applies AND logic: search 're-engaged' filter shows only leads that pass both", async () => {
    renderLeadsAdmin(queryClient);
    const user = userEvent.setup();

    // Activate the Re-engaged filter — only bobLead qualifies.
    const reEngagedBtn = screen.getByRole("button", { name: /re-engaged/i });
    await user.click(reEngagedBtn);

    // All three names should reduce to just Bob after the filter.
    await waitFor(() => {
      expect(screen.queryByText("Alice Sharma")).not.toBeInTheDocument();
      expect(screen.getByText("Bob Mehta")).toBeInTheDocument();
      expect(screen.queryByText("Carol Nair")).not.toBeInTheDocument();
    });

    // Now search for "carol" — no results because carol isn't re-engaged.
    const input = screen.getByPlaceholderText(/search by name/i);
    await user.type(input, "carol");

    await waitFor(() => {
      expect(screen.queryByText("Carol Nair")).not.toBeInTheDocument();
      // Empty state should be visible.
      expect(screen.getByText(/no leads match/i)).toBeInTheDocument();
    });
  });

  it("keeps a lead visible only when it passes both the time-window filter AND the search term", async () => {
    renderLeadsAdmin(queryClient);
    const user = userEvent.setup();

    // 7d filter: only Bob (2 d ago) and Carol (5 d ago) qualify.
    const sevenDayBtn = screen.getByRole("button", { name: /last 7 days/i });
    await user.click(sevenDayBtn);

    // Search for "alice" — alice was updated 60 days ago so she fails the 7d filter.
    const input = screen.getByPlaceholderText(/search by name/i);
    await user.type(input, "alice");

    await waitFor(() => {
      expect(screen.queryByText("Alice Sharma")).not.toBeInTheDocument();
      expect(screen.getByText(/no leads match/i)).toBeInTheDocument();
    });

    // Clear the search; Bob and Carol should reappear.
    await user.clear(input);
    await waitFor(() => {
      expect(screen.getByText("Bob Mehta")).toBeInTheDocument();
      expect(screen.getByText("Carol Nair")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // 5. Clear (×) button resets search
  // -------------------------------------------------------------------------
  it("clear (×) button resets the search input and restores all rows", async () => {
    renderLeadsAdmin(queryClient);
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/search by name/i);
    await user.type(input, "alice");

    // Confirm narrowed state.
    await waitFor(() =>
      expect(screen.queryByText("Bob Mehta")).not.toBeInTheDocument()
    );

    // The × button should now exist.
    const clearBtn = screen.getByRole("button", { name: /clear search/i });
    await user.click(clearBtn);

    // Input should be empty and all leads visible again.
    await waitFor(() => {
      expect(input).toHaveValue("");
      expect(screen.getByText("Alice Sharma")).toBeInTheDocument();
      expect(screen.getByText("Bob Mehta")).toBeInTheDocument();
      expect(screen.getByText("Carol Nair")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // 6. Empty state shows search term + clear action
  // -------------------------------------------------------------------------
  it("shows the typed term in the empty state and a clear link when nothing matches", async () => {
    renderLeadsAdmin(queryClient);
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/search by name/i);
    await user.type(input, "zzznomatch");

    await waitFor(() => {
      // Empty-state message contains the search term.
      expect(screen.getByText(/no leads match "zzznomatch"/i)).toBeInTheDocument();
      // "Clear search" link is present.
      expect(screen.getByText(/clear search/i)).toBeInTheDocument();
    });
  });

  it("clear link in the empty state resets both search and filter", async () => {
    renderLeadsAdmin(queryClient);
    const user = userEvent.setup();

    // Activate a filter first.
    const sevenDayBtn = screen.getByRole("button", { name: /last 7 days/i });
    await user.click(sevenDayBtn);

    // Search for something that won't match.
    const input = screen.getByPlaceholderText(/search by name/i);
    await user.type(input, "zzznomatch");

    await waitFor(() =>
      expect(screen.getByText(/no leads match/i)).toBeInTheDocument()
    );

    // The clear link should say "clear search & filter" when both are active.
    const clearLink = screen.getByText(/clear search & filter/i);
    await user.click(clearLink);

    await waitFor(() => {
      expect(input).toHaveValue("");
      // All leads visible again (filter also cleared).
      expect(screen.getByText("Alice Sharma")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // 7. Export CSV button is disabled when the combined result is empty
  // -------------------------------------------------------------------------
  it("disables Export CSV button when search + filter produce zero rows", async () => {
    renderLeadsAdmin(queryClient);
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/search by name/i);
    await user.type(input, "zzznomatch");

    await waitFor(() => {
      const exportBtn = screen.getByRole("button", { name: /export csv/i });
      expect(exportBtn).toBeDisabled();
    });
  });

  it("Export CSV button is enabled when there are matching rows", async () => {
    renderLeadsAdmin(queryClient);

    await waitFor(() => {
      const exportBtn = screen.getByRole("button", { name: /export csv/i });
      expect(exportBtn).not.toBeDisabled();
    });
  });
});
