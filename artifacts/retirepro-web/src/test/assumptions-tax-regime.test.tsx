/**
 * Tests that the Tax Regime row in AssumptionsPanel reflects the CRM default.
 *
 * Covers:
 *  - "Old Regime" label when crmDefaults.taxRegime === 'old'
 *  - "New Regime" label when crmDefaults.taxRegime === 'new'
 *  - Defaults to "New Regime" when taxRegime is null / undefined
 *  - Display updates when crmDefaults prop changes (settings change → re-render)
 *  - React Query cache-invalidation path: invalidateQueries triggers a refetch
 *    and AssumptionsPanel reflects the new taxRegime without a page reload
 */

import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/lib/queryClient", () => ({
  queryClient: new QueryClient(),
  apiRequest: vi.fn(),
}));

/**
 * Mock for @workspace/api-client-react.
 *
 * useGetCrmDefaults is implemented here as a thin wrapper around
 * React Query's useQuery using the generated query key, so tests that
 * call invalidateQueries({ queryKey: getGetCrmDefaultsQueryKey() }) will
 * trigger a real refetch through the same subscription path that
 * plan-dashboard.tsx uses in production.
 */
vi.mock("@workspace/api-client-react", async () => {
  const { useQuery } = await import("@tanstack/react-query");
  return {
    useUpdateScenario: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
    getListScenariosQueryKey: () => ["scenarios", "list"],
    /** Mirrors the generated helper — returns the canonical query key. */
    getGetCrmDefaultsQueryKey: () => ["/api/crm/defaults"] as const,
    /**
     * Mirrors the generated hook's signature.
     * Callers may pass options.query.queryFn so tests can control the
     * refetch result without hitting the network.
     */
    useGetCrmDefaults: (options?: {
      query?: {
        queryKey?: readonly unknown[];
        queryFn?: () => Promise<unknown>;
        staleTime?: number;
        enabled?: boolean;
      };
    }) => {
      const key = options?.query?.queryKey ?? (["/api/crm/defaults"] as const);
      const { queryKey: _k, queryFn: _f, ...restOpts } = options?.query ?? {};
      return useQuery({
        queryKey: key,
        queryFn: _f ?? (() => Promise.resolve(null)),
        ...restOpts,
      });
    },
  };
});

// Import after mocks
import AssumptionsPanel from "@/components/assumptions-panel";
import { useGetCrmDefaults, getGetCrmDefaultsQueryKey } from "@workspace/api-client-react";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const BASE_SCENARIO = {
  id: "sc-test-001",
  assumptions: {
    inflationHeadline: "6.0",
    inflationEdu: "8.0",
    inflationHealth: "7.0",
    returnPre: "10.0",
    returnPost: "7.0",
    lifeExpectancy: 85,
    source: "crm",
  },
};

function renderPanel(crmDefaults: { taxRegime?: string | null } | null | undefined) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <AssumptionsPanel scenario={BASE_SCENARIO} crmDefaults={crmDefaults} />
    </QueryClientProvider>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// "Old Regime" display
// ---------------------------------------------------------------------------

describe("AssumptionsPanel – Tax Regime row (Old Regime)", () => {
  it('shows "Old Regime" when crmDefaults.taxRegime is "old"', () => {
    renderPanel({ taxRegime: "old" });
    expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("Old Regime");
  });

  it('does not show "New Regime" when taxRegime is "old"', () => {
    renderPanel({ taxRegime: "old" });
    expect(screen.getByTestId("assumption-tax-regime")).not.toHaveTextContent("New Regime");
  });
});

// ---------------------------------------------------------------------------
// "New Regime" display
// ---------------------------------------------------------------------------

describe("AssumptionsPanel – Tax Regime row (New Regime)", () => {
  it('shows "New Regime" when crmDefaults.taxRegime is "new"', () => {
    renderPanel({ taxRegime: "new" });
    expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("New Regime");
  });

  it('does not show "Old Regime" when taxRegime is "new"', () => {
    renderPanel({ taxRegime: "new" });
    expect(screen.getByTestId("assumption-tax-regime")).not.toHaveTextContent("Old Regime");
  });
});

// ---------------------------------------------------------------------------
// Fallback / edge cases
// ---------------------------------------------------------------------------

describe("AssumptionsPanel – Tax Regime row (fallback)", () => {
  it('shows "New Regime" when taxRegime is null (defaults to new)', () => {
    renderPanel({ taxRegime: null });
    expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("New Regime");
  });

  it('shows "New Regime" when taxRegime is undefined', () => {
    renderPanel({ taxRegime: undefined });
    expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("New Regime");
  });

  it('shows "New Regime" when crmDefaults is null', () => {
    renderPanel(null);
    expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("New Regime");
  });

  it('shows "New Regime" when crmDefaults is undefined', () => {
    renderPanel(undefined);
    expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("New Regime");
  });
});

// ---------------------------------------------------------------------------
// Settings change → display updates
// ---------------------------------------------------------------------------

describe("AssumptionsPanel – Tax Regime updates after a settings change", () => {
  it('re-renders "New Regime" after taxRegime changes from "old" to "new"', () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Initial render: Old Regime (the current CRM setting)
    const { rerender } = render(
      <QueryClientProvider client={qc}>
        <AssumptionsPanel scenario={BASE_SCENARIO} crmDefaults={{ taxRegime: "old" }} />
      </QueryClientProvider>
    );

    expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("Old Regime");

    // Admin saves New Regime in CRM Settings → parent re-fetches and passes new prop
    rerender(
      <QueryClientProvider client={qc}>
        <AssumptionsPanel scenario={BASE_SCENARIO} crmDefaults={{ taxRegime: "new" }} />
      </QueryClientProvider>
    );

    expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("New Regime");
    expect(screen.getByTestId("assumption-tax-regime")).not.toHaveTextContent("Old Regime");
  });

  it('re-renders "Old Regime" after taxRegime changes from "new" to "old"', () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { rerender } = render(
      <QueryClientProvider client={qc}>
        <AssumptionsPanel scenario={BASE_SCENARIO} crmDefaults={{ taxRegime: "new" }} />
      </QueryClientProvider>
    );

    expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("New Regime");

    rerender(
      <QueryClientProvider client={qc}>
        <AssumptionsPanel scenario={BASE_SCENARIO} crmDefaults={{ taxRegime: "old" }} />
      </QueryClientProvider>
    );

    expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("Old Regime");
    expect(screen.getByTestId("assumption-tax-regime")).not.toHaveTextContent("New Regime");
  });

  it("always shows the label matching the most recently passed crmDefaults", () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { rerender } = render(
      <QueryClientProvider client={qc}>
        <AssumptionsPanel scenario={BASE_SCENARIO} crmDefaults={{ taxRegime: "new" }} />
      </QueryClientProvider>
    );

    // Cycle: new → old → new
    const cycles: Array<"old" | "new"> = ["old", "new", "old", "new"];
    for (const regime of cycles) {
      rerender(
        <QueryClientProvider client={qc}>
          <AssumptionsPanel scenario={BASE_SCENARIO} crmDefaults={{ taxRegime: regime }} />
        </QueryClientProvider>
      );
      const expected = regime === "old" ? "Old Regime" : "New Regime";
      const unexpected = regime === "old" ? "New Regime" : "Old Regime";
      expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent(expected);
      expect(screen.getByTestId("assumption-tax-regime")).not.toHaveTextContent(unexpected);
    }
  });
});

// ---------------------------------------------------------------------------
// React Query cache-invalidation path
//
// Mirrors what happens in production when an admin saves new CRM defaults
// in settings-crm.tsx (onSuccess handler):
//
//   queryClient.invalidateQueries({ queryKey: ["/api/crm/defaults"] })
//
// React Query marks the query stale and triggers a background refetch.
// Any mounted component that subscribed via useGetCrmDefaults (same query key)
// re-renders with the fresh data — no page reload required.
//
// The stub below mirrors plan-dashboard.tsx's useGetCrmDefaults call,
// using the generated getGetCrmDefaultsQueryKey() helper so that a key
// mismatch between the hook and the invalidation call would be caught here.
// ---------------------------------------------------------------------------

/**
 * Minimal stub of the plan-dashboard's CRM-defaults subscription.
 *
 * Uses the mocked useGetCrmDefaults (which wraps useQuery with the
 * getGetCrmDefaultsQueryKey() key) plus a caller-supplied queryFn so
 * tests can deterministically control what the refetch returns.
 *
 * The queryFn must return a CrmDefaultsData-compatible object; `id` is the
 * only required field — all other fields are optional/nullable.
 */
function PlanDashboardStub({
  queryFn,
}: {
  queryFn: () => Promise<{ id: string; taxRegime?: string | null }>;
}) {
  const { data: crmDefaults } = useGetCrmDefaults({
    query: {
      queryKey: getGetCrmDefaultsQueryKey(),
      // Cast to any so the test stub's partial type satisfies the generated
      // QueryFunction<CrmDefaultsData> slot — the mock already replaces the
      // real hook, so only the runtime shape matters here.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryFn: queryFn as any,
      // staleTime: 0 ensures invalidateQueries triggers an immediate refetch
      staleTime: 0,
    },
  });

  return <AssumptionsPanel scenario={BASE_SCENARIO} crmDefaults={crmDefaults} />;
}

/** Builds a minimal CrmDefaultsData-shaped stub (id required; rest optional). */
function crmStub(taxRegime: "old" | "new"): { id: string; taxRegime: "old" | "new" } {
  return { id: "crm-defaults-1", taxRegime };
}

describe("AssumptionsPanel – React Query cache-invalidation path", () => {
  it('shows "Old Regime" from the initial fetch result', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const queryFn = vi.fn().mockResolvedValue(crmStub("old"));

    render(
      <QueryClientProvider client={qc}>
        <PlanDashboardStub queryFn={queryFn} />
      </QueryClientProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("Old Regime")
    );
    expect(screen.getByTestId("assumption-tax-regime")).not.toHaveTextContent("New Regime");
    // Confirms the queryFn was actually called (real fetch path, not stale skip)
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it('updates to "New Regime" after invalidateQueries triggers a refetch — no page reload', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Step 1: initial fetch returns Old Regime
    const queryFn = vi.fn().mockResolvedValue(crmStub("old"));

    render(
      <QueryClientProvider client={qc}>
        <PlanDashboardStub queryFn={queryFn} />
      </QueryClientProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("Old Regime")
    );

    // Step 2: admin saves New Regime in settings-crm.tsx → onSuccess calls:
    //   queryClient.invalidateQueries({ queryKey: getGetCrmDefaultsQueryKey() })
    // Update the queryFn so the background refetch returns the new value,
    // then call invalidateQueries with the same key the hook and settings page use.
    queryFn.mockResolvedValue(crmStub("new"));
    await qc.invalidateQueries({ queryKey: getGetCrmDefaultsQueryKey() });

    // Step 3: the subscription fires and AssumptionsPanel reflects the change
    await waitFor(() =>
      expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("New Regime")
    );
    expect(screen.getByTestId("assumption-tax-regime")).not.toHaveTextContent("Old Regime");
    // Confirms a second fetch was issued (the invalidation triggered a real refetch)
    expect(queryFn).toHaveBeenCalledTimes(2);
  });

  it('updates to "Old Regime" after invalidateQueries when refetch returns "old"', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const queryFn = vi.fn().mockResolvedValue(crmStub("new"));

    render(
      <QueryClientProvider client={qc}>
        <PlanDashboardStub queryFn={queryFn} />
      </QueryClientProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("New Regime")
    );

    // Admin switches back to Old Regime
    queryFn.mockResolvedValue(crmStub("old"));
    await qc.invalidateQueries({ queryKey: getGetCrmDefaultsQueryKey() });

    await waitFor(() =>
      expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("Old Regime")
    );
    expect(screen.getByTestId("assumption-tax-regime")).not.toHaveTextContent("New Regime");
    expect(queryFn).toHaveBeenCalledTimes(2);
  });

  it("reflects each refetch result after repeated invalidations — no page reload between them", async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const queryFn = vi.fn().mockResolvedValue(crmStub("new"));

    render(
      <QueryClientProvider client={qc}>
        <PlanDashboardStub queryFn={queryFn} />
      </QueryClientProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent("New Regime")
    );

    // Simulate multiple admin saves: new → old → new → old
    const cycles: Array<"old" | "new"> = ["old", "new", "old", "new"];
    for (const regime of cycles) {
      queryFn.mockResolvedValue(crmStub(regime));
      await qc.invalidateQueries({ queryKey: getGetCrmDefaultsQueryKey() });

      const expected = regime === "old" ? "Old Regime" : "New Regime";
      const unexpected = regime === "old" ? "New Regime" : "Old Regime";

      await waitFor(() =>
        expect(screen.getByTestId("assumption-tax-regime")).toHaveTextContent(expected)
      );
      expect(screen.getByTestId("assumption-tax-regime")).not.toHaveTextContent(unexpected);
    }
  });
});
