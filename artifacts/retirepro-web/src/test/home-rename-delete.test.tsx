/**
 * Tests for rename and delete plan actions on the home dashboard.
 *
 * Covers:
 *  - Optimistic rename: card label updates immediately before the server responds.
 *  - Optimistic delete: card disappears immediately before the server responds.
 *  - Rollback on rename failure: original list is restored and a toast is shown.
 *  - Rollback on delete failure: original list is restored and a toast is shown.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ---------------------------------------------------------------------------
// Module mocks — must be at module scope so Vitest hoists them.
// ---------------------------------------------------------------------------

const mockToast = vi.fn();

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "u1", firstName: "Test", role: "user" },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/", vi.fn()],
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/profile-menu", () => ({
  default: () => <div data-testid="profile-menu" />,
}));

vi.mock("@/components/brand-logo", () => ({
  default: () => <div data-testid="brand-logo" />,
}));

vi.mock("@/lib/formatCorpus", () => ({
  formatCorpus: () => null,
}));

// Mock @workspace/api-client-react so that:
//  - getListScenariosQueryKey returns a stable key
//  - useListScenarios delegates to useQuery with that key so optimistic
//    updates via queryClient.setQueryData are reflected in the rendered output.
//
// The queryFn reads whatever is currently in the cache so that
// invalidateQueries() in onSettled is a no-op: it re-fetches but returns
// the same data that is already cached (either the optimistic value on
// success or the rolled-back value on error), preventing the empty-array
// placeholder from overwriting real test data.
vi.mock("@workspace/api-client-react", async () => {
  const { useQuery, useQueryClient } = await import("@tanstack/react-query");
  const QUERY_KEY = ["scenarios", "list"];

  class ResponseValidationError extends Error {
    url: string;
    method: string;
    constructor(message: string, url = "", method = "GET") {
      super(message);
      this.name = "ResponseValidationError";
      this.url = url;
      this.method = method;
    }
  }

  return {
    ResponseValidationError,
    getListScenariosQueryKey: () => QUERY_KEY,
    useListScenarios: ({ query }: { query?: Record<string, unknown> } = {}) => {
      const qc = useQueryClient();
      return useQuery({
        queryKey: QUERY_KEY,
        queryFn: () =>
          Promise.resolve((qc.getQueryData(QUERY_KEY) as unknown[]) ?? []),
        ...(query ?? {}),
      });
    },
  };
});

// Import after mocks are registered.
import Home from "@/pages/home";
import { getListScenariosQueryKey } from "@workspace/api-client-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SCENARIO_A = {
  id: "sc-aaa",
  name: "Retirement Alpha",
  mode: "quick",
  selfRetirementAge: 60,
  projectedCorpus: null,
  updatedAt: new Date("2025-01-01").toISOString(),
};

const SCENARIO_B = {
  id: "sc-bbb",
  name: "Retirement Beta",
  mode: "detailed",
  selfRetirementAge: 65,
  projectedCorpus: null,
  updatedAt: new Date("2025-02-01").toISOString(),
};

function buildQueryClient(initialScenarios: typeof SCENARIO_A[]) {
  const qc = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        // Prevent background re-fetches from overwriting the pre-seeded data
        // with the mock queryFn's empty array during tests.
        staleTime: Infinity,
      },
      mutations: { retry: false },
    },
  });
  qc.setQueryData(getListScenariosQueryKey(), initialScenarios);
  return qc;
}

function renderHome(qc: QueryClient) {
  return render(
    <QueryClientProvider client={qc}>
      <Home />
    </QueryClientProvider>
  );
}

// Suppress noisy console.error from Radix UI portal warnings in jsdom.
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  mockToast.mockClear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Rename — happy path (optimistic update)
// ---------------------------------------------------------------------------

describe("Home – rename plan (happy path)", () => {
  it("updates the card label optimistically before the server responds", async () => {
    const user = userEvent.setup();
    const qc = buildQueryClient([SCENARIO_A, SCENARIO_B]);

    // fetch resolves with the updated scenario after a short delay
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ...SCENARIO_A, name: "Renamed Plan" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    renderHome(qc);

    // The original card is rendered
    await screen.findByText("Retirement Alpha");

    // Open the dropdown
    await user.click(screen.getByTestId(`btn-options-${SCENARIO_A.id}`));

    // Click Rename
    await user.click(screen.getByTestId(`btn-rename-${SCENARIO_A.id}`));

    // The rename dialog input is present with the current name pre-filled
    const input = await screen.findByTestId("input-rename");
    expect(input).toHaveValue("Retirement Alpha");

    // Clear and type a new name
    await user.clear(input);
    await user.type(input, "Renamed Plan");

    // Confirm
    await user.click(screen.getByTestId("btn-rename-confirm"));

    // Optimistic update: the card should immediately show the new name
    await waitFor(() => {
      expect(screen.getByText("Renamed Plan")).toBeInTheDocument();
    });

    // The old name is gone
    expect(screen.queryByText("Retirement Alpha")).not.toBeInTheDocument();

    // PUT request was made with the correct payload
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/scenarios/${SCENARIO_A.id}`,
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ name: "Renamed Plan" }),
      })
    );
  });

  it("shows a success toast and closes the dialog after rename", async () => {
    const user = userEvent.setup();
    const qc = buildQueryClient([SCENARIO_A]);

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ...SCENARIO_A, name: "New Name" }),
    }));

    renderHome(qc);
    await screen.findByText("Retirement Alpha");

    await user.click(screen.getByTestId(`btn-options-${SCENARIO_A.id}`));
    await user.click(screen.getByTestId(`btn-rename-${SCENARIO_A.id}`));

    const input = await screen.findByTestId("input-rename");
    await user.clear(input);
    await user.type(input, "New Name");
    await user.click(screen.getByTestId("btn-rename-confirm"));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Plan renamed" })
      );
    });

    // Dialog is closed
    await waitFor(() => {
      expect(screen.queryByTestId("input-rename")).not.toBeInTheDocument();
    });
  });

  it("does not call fetch and closes dialog when name is unchanged", async () => {
    const user = userEvent.setup();
    const qc = buildQueryClient([SCENARIO_A]);

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderHome(qc);
    await screen.findByText("Retirement Alpha");

    await user.click(screen.getByTestId(`btn-options-${SCENARIO_A.id}`));
    await user.click(screen.getByTestId(`btn-rename-${SCENARIO_A.id}`));

    // Input is pre-filled with current name; click Save without changing it
    await screen.findByTestId("input-rename");
    await user.click(screen.getByTestId("btn-rename-confirm"));

    await waitFor(() => {
      expect(screen.queryByTestId("input-rename")).not.toBeInTheDocument();
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Rename — error path (rollback)
// ---------------------------------------------------------------------------

describe("Home – rename plan (server failure → rollback)", () => {
  it("restores the original name and shows an error toast when PUT fails", async () => {
    const user = userEvent.setup();
    const qc = buildQueryClient([SCENARIO_A]);

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    renderHome(qc);
    await screen.findByText("Retirement Alpha");

    await user.click(screen.getByTestId(`btn-options-${SCENARIO_A.id}`));
    await user.click(screen.getByTestId(`btn-rename-${SCENARIO_A.id}`));

    const input = await screen.findByTestId("input-rename");
    await user.clear(input);
    await user.type(input, "Will Fail");
    await user.click(screen.getByTestId("btn-rename-confirm"));

    // Error toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "destructive" })
      );
    });

    // Rollback: the original name is restored
    await waitFor(() => {
      expect(screen.getByText("Retirement Alpha")).toBeInTheDocument();
    });
    expect(screen.queryByText("Will Fail")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Rename — duplicate-name validation
// ---------------------------------------------------------------------------

describe("Home – rename plan (duplicate-name validation)", () => {
  it("shows the duplicate-name error when the user types a name that matches another plan", async () => {
    const user = userEvent.setup();
    const qc = buildQueryClient([SCENARIO_A, SCENARIO_B]);
    vi.stubGlobal("fetch", vi.fn());

    renderHome(qc);
    await screen.findByText("Retirement Alpha");

    await user.click(screen.getByTestId(`btn-options-${SCENARIO_A.id}`));
    await user.click(screen.getByTestId(`btn-rename-${SCENARIO_A.id}`));

    const input = await screen.findByTestId("input-rename");
    await user.clear(input);
    // Type the name of the OTHER existing plan (Scenario B)
    await user.type(input, SCENARIO_B.name);

    await waitFor(() => {
      expect(screen.getByTestId("rename-duplicate-error")).toBeInTheDocument();
    });
    expect(screen.getByTestId("rename-duplicate-error")).toHaveTextContent(
      "You already have a plan with this name."
    );
  });

  it("disables the Save button when a duplicate name is entered", async () => {
    const user = userEvent.setup();
    const qc = buildQueryClient([SCENARIO_A, SCENARIO_B]);
    vi.stubGlobal("fetch", vi.fn());

    renderHome(qc);
    await screen.findByText("Retirement Alpha");

    await user.click(screen.getByTestId(`btn-options-${SCENARIO_A.id}`));
    await user.click(screen.getByTestId(`btn-rename-${SCENARIO_A.id}`));

    const input = await screen.findByTestId("input-rename");
    await user.clear(input);
    await user.type(input, SCENARIO_B.name);

    await waitFor(() => {
      expect(screen.getByTestId("btn-rename-confirm")).toBeDisabled();
    });
  });

  it("does NOT call fetch when the user somehow submits a duplicate name", async () => {
    const user = userEvent.setup();
    const qc = buildQueryClient([SCENARIO_A, SCENARIO_B]);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderHome(qc);
    await screen.findByText("Retirement Alpha");

    await user.click(screen.getByTestId(`btn-options-${SCENARIO_A.id}`));
    await user.click(screen.getByTestId(`btn-rename-${SCENARIO_A.id}`));

    const input = await screen.findByTestId("input-rename");
    await user.clear(input);
    await user.type(input, SCENARIO_B.name);

    // Wait for the duplicate error to appear so we know the guard is active
    await waitFor(() => {
      expect(screen.getByTestId("rename-duplicate-error")).toBeInTheDocument();
    });

    // Press Enter — handleRenameSubmit guards against isDuplicateName
    await user.keyboard("{Enter}");

    // fetch must not have been called
    expect(fetchMock).not.toHaveBeenCalled();
    // Dialog remains open
    expect(screen.getByTestId("input-rename")).toBeInTheDocument();
  });

  it("clears the duplicate-name error when the user corrects the name", async () => {
    const user = userEvent.setup();
    const qc = buildQueryClient([SCENARIO_A, SCENARIO_B]);
    vi.stubGlobal("fetch", vi.fn());

    renderHome(qc);
    await screen.findByText("Retirement Alpha");

    await user.click(screen.getByTestId(`btn-options-${SCENARIO_A.id}`));
    await user.click(screen.getByTestId(`btn-rename-${SCENARIO_A.id}`));

    const input = await screen.findByTestId("input-rename");
    await user.clear(input);
    await user.type(input, SCENARIO_B.name);

    await waitFor(() => {
      expect(screen.getByTestId("rename-duplicate-error")).toBeInTheDocument();
    });

    // Correct the name to something unique
    await user.clear(input);
    await user.type(input, "Unique New Name");

    await waitFor(() => {
      expect(screen.queryByTestId("rename-duplicate-error")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("btn-rename-confirm")).not.toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Rename — blank-name validation
// ---------------------------------------------------------------------------

describe("Home – rename plan (blank-name validation)", () => {
  it("disables the Save button when the input is blank", async () => {
    const user = userEvent.setup();
    const qc = buildQueryClient([SCENARIO_A]);
    vi.stubGlobal("fetch", vi.fn());

    renderHome(qc);
    await screen.findByText("Retirement Alpha");

    await user.click(screen.getByTestId(`btn-options-${SCENARIO_A.id}`));
    await user.click(screen.getByTestId(`btn-rename-${SCENARIO_A.id}`));

    const input = await screen.findByTestId("input-rename");
    await user.clear(input);

    await waitFor(() => {
      expect(screen.getByTestId("btn-rename-confirm")).toBeDisabled();
    });
  });

  it("disables the Save button when the input contains only whitespace", async () => {
    const user = userEvent.setup();
    const qc = buildQueryClient([SCENARIO_A]);
    vi.stubGlobal("fetch", vi.fn());

    renderHome(qc);
    await screen.findByText("Retirement Alpha");

    await user.click(screen.getByTestId(`btn-options-${SCENARIO_A.id}`));
    await user.click(screen.getByTestId(`btn-rename-${SCENARIO_A.id}`));

    const input = await screen.findByTestId("input-rename");
    await user.clear(input);
    await user.type(input, "   ");

    await waitFor(() => {
      expect(screen.getByTestId("btn-rename-confirm")).toBeDisabled();
    });
  });

  it("does NOT call fetch when the user presses Enter with a blank name", async () => {
    const user = userEvent.setup();
    const qc = buildQueryClient([SCENARIO_A]);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderHome(qc);
    await screen.findByText("Retirement Alpha");

    await user.click(screen.getByTestId(`btn-options-${SCENARIO_A.id}`));
    await user.click(screen.getByTestId(`btn-rename-${SCENARIO_A.id}`));

    const input = await screen.findByTestId("input-rename");
    await user.clear(input);

    // Press Enter — handleRenameSubmit should close dialog without fetching
    await user.keyboard("{Enter}");

    // Dialog closes (blank name => same as unchanged behaviour: just close)
    await waitFor(() => {
      expect(screen.queryByTestId("input-rename")).not.toBeInTheDocument();
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Delete — happy path (optimistic update)
// ---------------------------------------------------------------------------

describe("Home – delete plan (happy path)", () => {
  it("removes the card from the list optimistically after confirming the dialog", async () => {
    const user = userEvent.setup();
    const qc = buildQueryClient([SCENARIO_A, SCENARIO_B]);

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }));

    renderHome(qc);

    // Both cards visible
    await screen.findByText("Retirement Alpha");
    await screen.findByText("Retirement Beta");

    // Open dropdown for Alpha
    await user.click(screen.getByTestId(`btn-options-${SCENARIO_A.id}`));
    await user.click(screen.getByTestId(`btn-delete-${SCENARIO_A.id}`));

    // Confirmation dialog should appear
    await screen.findByTestId("btn-delete-confirm");

    // Confirm deletion
    await user.click(screen.getByTestId("btn-delete-confirm"));

    // Optimistic update: Alpha card should be gone
    await waitFor(() => {
      expect(screen.queryByTestId(`card-scenario-${SCENARIO_A.id}`)).not.toBeInTheDocument();
    });

    // Beta card remains
    expect(screen.getByTestId(`card-scenario-${SCENARIO_B.id}`)).toBeInTheDocument();

    // DELETE request was made
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      `/api/scenarios/${SCENARIO_A.id}`,
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("shows a success toast after deletion", async () => {
    const user = userEvent.setup();
    const qc = buildQueryClient([SCENARIO_A]);

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }));

    renderHome(qc);
    await screen.findByText("Retirement Alpha");

    await user.click(screen.getByTestId(`btn-options-${SCENARIO_A.id}`));
    await user.click(screen.getByTestId(`btn-delete-${SCENARIO_A.id}`));
    await user.click(await screen.findByTestId("btn-delete-confirm"));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Plan deleted" })
      );
    });
  });

  it("closes the confirmation dialog without deleting when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const qc = buildQueryClient([SCENARIO_A]);

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderHome(qc);
    await screen.findByText("Retirement Alpha");

    await user.click(screen.getByTestId(`btn-options-${SCENARIO_A.id}`));
    await user.click(screen.getByTestId(`btn-delete-${SCENARIO_A.id}`));
    await screen.findByTestId("btn-delete-confirm");

    // Click the AlertDialog Cancel button
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    // Dialog should be gone, card should still exist
    await waitFor(() => {
      expect(screen.queryByTestId("btn-delete-confirm")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId(`card-scenario-${SCENARIO_A.id}`)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Delete — error path (rollback)
// ---------------------------------------------------------------------------

describe("Home – delete plan (server failure → rollback)", () => {
  it("restores the card and shows an error toast when DELETE fails", async () => {
    const user = userEvent.setup();
    const qc = buildQueryClient([SCENARIO_A, SCENARIO_B]);

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    renderHome(qc);

    await screen.findByText("Retirement Alpha");

    await user.click(screen.getByTestId(`btn-options-${SCENARIO_A.id}`));
    await user.click(screen.getByTestId(`btn-delete-${SCENARIO_A.id}`));
    await user.click(await screen.findByTestId("btn-delete-confirm"));

    // Error toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "destructive" })
      );
    });

    // Rollback: both cards are back
    await waitFor(() => {
      expect(screen.getByTestId(`card-scenario-${SCENARIO_A.id}`)).toBeInTheDocument();
    });
    expect(screen.getByTestId(`card-scenario-${SCENARIO_B.id}`)).toBeInTheDocument();
  });
});
