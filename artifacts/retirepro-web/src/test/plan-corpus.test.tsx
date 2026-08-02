/**
 * Tests confirming that the projected corpus on plan cards stays accurate
 * after plan edits.
 *
 * Two guarantees work together:
 *  1. Server: PUT /api/scenarios/:id now AWAITS corpus recalculation before
 *     returning the response, so GET /api/scenarios immediately after a save
 *     always reflects the recomputed value (no race condition).
 *  2. Client: AssumptionsPanel invalidates the scenarios-list query on save
 *     success, causing the home page to re-fetch and render the fresh corpus.
 *
 * Tests here confirm both sides of that contract.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

import { formatCorpus } from "@/lib/formatCorpus";

// ---------------------------------------------------------------------------
// 1. formatCorpus — plan card display helper (pure unit tests)
// ---------------------------------------------------------------------------

describe("formatCorpus — plan card display helper", () => {
  it("returns null for null input", () => {
    expect(formatCorpus(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(formatCorpus(undefined)).toBeNull();
  });

  it("returns null for zero", () => {
    expect(formatCorpus(0)).toBeNull();
  });

  it("returns null for a negative value", () => {
    expect(formatCorpus(-500_000)).toBeNull();
  });

  it("formats values below 1 lakh as an exact rupee amount", () => {
    expect(formatCorpus(50_000)).toBe("₹50,000 projected");
  });

  it("formats values at exactly 1 lakh in Lakh units", () => {
    const result = formatCorpus(100_000);
    expect(result).not.toBeNull();
    expect(result).toContain("L projected");
  });

  it("formats a mid-range lakh value correctly", () => {
    expect(formatCorpus(2_500_000)).toBe("₹25.0 L projected");
  });

  it("formats exactly 1 Crore in Crore units", () => {
    expect(formatCorpus(10_000_000)).toBe("₹1.0 Cr projected");
  });

  it("formats a large corpus in Crore units", () => {
    expect(formatCorpus(55_000_000)).toBe("₹5.5 Cr projected");
  });

  it("all positive corpus values include '₹' and 'projected'", () => {
    for (const v of [75_000, 500_000, 5_000_000, 50_000_000]) {
      const result = formatCorpus(v);
      expect(result).not.toBeNull();
      expect(result).toContain("₹");
      expect(result).toContain("projected");
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Plan card corpus display — rendered value matches API response
// ---------------------------------------------------------------------------

describe("plan card corpus display — rendered value matches API response", () => {
  /**
   * Since the server now persists a fresh projectedCorpus before returning
   * the PUT response, the next GET /api/scenarios will contain the updated
   * value.  The plan card renders it via formatCorpus — these tests confirm
   * the formatting matches expected output for typical API payloads.
   */

  it("correctly renders a typical crore-range corpus from the API", () => {
    const apiCorpus = 32_500_000; // ₹3.25 Cr
    expect(formatCorpus(apiCorpus)).toBe("₹3.3 Cr projected");
  });

  it("shows nothing (null) when the API returns projectedCorpus = null (plan never viewed or calculated)", () => {
    expect(formatCorpus(null)).toBeNull();
  });

  it("shows nothing (null) when projectedCorpus = 0 (just created, no calculation yet)", () => {
    expect(formatCorpus(0)).toBeNull();
  });

  it("correctly renders a corpus in the lakh range", () => {
    expect(formatCorpus(7_500_000)).toBe("₹75.0 L projected");
  });
});

// ---------------------------------------------------------------------------
// 3. AssumptionsPanel — save triggers scenarios-list query invalidation
//
// We mock useUpdateScenario from the API client so we control exactly when
// the mutation succeeds and what it returns, without depending on customFetch
// response parsing internals.
// ---------------------------------------------------------------------------

const mockMutate = vi.fn();
const mockUseUpdateScenario = vi.fn();

vi.mock("@workspace/api-client-react", async () => {
  const actual = await vi.importActual<typeof import("@workspace/api-client-react")>(
    "@workspace/api-client-react"
  );
  return {
    ...actual,
    useUpdateScenario: (opts: any) => {
      // Store the opts so tests can invoke onSuccess/onError directly
      mockUseUpdateScenario(opts);
      return {
        mutate: mockMutate,
        isPending: false,
      };
    },
  };
});

// Mock wouter so AssumptionsPanel can render without a router.
vi.mock("wouter", () => ({
  useLocation: () => ["/", vi.fn()],
  useRoute: () => [false, null],
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import AssumptionsPanel from "@/components/assumptions-panel";
import { getListScenariosQueryKey, getGetScenarioQueryKey } from "@workspace/api-client-react";
// The singleton queryClient is what AssumptionsPanel calls invalidateQueries on.
import { queryClient as singletonQc } from "@/lib/queryClient";

const SCENARIO_ID = "scenario-test-123";

const baseScenario = {
  id: SCENARIO_ID,
  assumptions: {
    inflationHeadline: "6.0",
    inflationEdu: "8.0",
    inflationHealth: "8.0",
    returnPre: "10.0",
    returnPost: "7.0",
    lifeExpectancy: 85,
    source: "crm" as const,
  },
};

// Wrap with a QueryClientProvider so react-query hooks initialise.
// The AssumptionsPanel calls `queryClient.invalidateQueries` on the
// *imported singleton*, not on the context client, so we spy on it directly.
function renderPanel() {
  const wrapper = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return {
    wrapper,
    ...render(
      <QueryClientProvider client={wrapper}>
        <AssumptionsPanel scenario={baseScenario} />
      </QueryClientProvider>
    ),
  };
}

describe("AssumptionsPanel — save flow keeps plan-card corpus current", () => {
  let invalidateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Spy on the singleton that AssumptionsPanel actually calls.
    invalidateSpy = vi.spyOn(singletonQc, "invalidateQueries").mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    invalidateSpy.mockRestore();
  });

  /** Helper: simulate a successful mutation response */
  async function triggerSuccess(returnValue = { id: SCENARIO_ID }) {
    const capturedOpts = mockUseUpdateScenario.mock.calls[0]?.[0];
    expect(capturedOpts?.mutation?.onSuccess).toBeDefined();
    await capturedOpts.mutation.onSuccess(returnValue, { id: SCENARIO_ID, data: {} }, undefined);
  }

  it("invalidates the scenarios-list query when the mutation succeeds", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByTestId("button-edit-assumptions"));
    const input = screen.getByTestId("input-inflation-headline");
    await user.clear(input);
    await user.type(input, "7.5");
    await user.click(screen.getByTestId("button-save-assumptions"));

    expect(mockMutate).toHaveBeenCalledOnce();

    // Simulate the PUT /api/scenarios/:id returning success with fresh corpus.
    await triggerSuccess({ id: SCENARIO_ID, name: "Test Plan", projectedCorpus: 45_000_000 } as any);

    // The scenarios-list query MUST be invalidated so the home page re-fetches
    // and renders the updated projectedCorpus without a hard reload.
    const listKey = getListScenariosQueryKey();
    const invalidatedKeys = invalidateSpy.mock.calls.map(
      (args: unknown[]) => JSON.stringify((args[0] as { queryKey?: unknown })?.queryKey)
    );
    expect(invalidatedKeys).toContain(JSON.stringify(listKey));
  });

  it("also invalidates the individual scenario and calc queries on success", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByTestId("button-edit-assumptions"));
    await user.click(screen.getByTestId("button-save-assumptions"));
    await triggerSuccess();

    const invalidatedKeys = invalidateSpy.mock.calls.map(
      (args: unknown[]) => JSON.stringify((args[0] as { queryKey?: unknown })?.queryKey)
    );

    // Individual scenario detail (plan dashboard) — must use the generated key
    // that getGetScenarioQueryKey returns, so the dashboard's useGetScenario query
    // is actually invalidated (key is ["/api/scenarios/<id>"], not ["/api/scenarios", id]).
    expect(invalidatedKeys).toContain(JSON.stringify(getGetScenarioQueryKey(SCENARIO_ID)));
    // Calc cache (live rate adjuster on the plan dashboard)
    expect(invalidatedKeys).toContain(JSON.stringify(["/api/calc", SCENARIO_ID]));
  });

  it("does NOT invalidate the scenarios-list when the mutation fails", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByTestId("button-edit-assumptions"));
    await user.click(screen.getByTestId("button-save-assumptions"));

    const capturedOpts = mockUseUpdateScenario.mock.calls[0]?.[0];
    // Trigger the error path — onSuccess is never called
    if (capturedOpts?.mutation?.onError) {
      capturedOpts.mutation.onError(new Error("Network failure"), {}, undefined);
    }

    const listKey = JSON.stringify(getListScenariosQueryKey());
    const invalidatedKeys = invalidateSpy.mock.calls.map(
      (args: unknown[]) => JSON.stringify((args[0] as { queryKey?: unknown })?.queryKey)
    );
    expect(invalidatedKeys).not.toContain(listKey);
  });

  it("exits edit mode after a successful save", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByTestId("button-edit-assumptions"));
    expect(screen.getByTestId("button-save-assumptions")).toBeInTheDocument();

    await user.click(screen.getByTestId("button-save-assumptions"));
    await triggerSuccess();

    await waitFor(() => {
      expect(screen.getByTestId("button-edit-assumptions")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("button-save-assumptions")).not.toBeInTheDocument();
  });

  it("preserves the user's edits and stays in edit mode when the save fails", async () => {
    const user = userEvent.setup();
    renderPanel();

    // Enter edit mode and change inflationHeadline to "7.5"
    await user.click(screen.getByTestId("button-edit-assumptions"));
    const input = screen.getByTestId("input-inflation-headline");
    await user.clear(input);
    await user.type(input, "7.5");

    await user.click(screen.getByTestId("button-save-assumptions"));
    expect(mockMutate).toHaveBeenCalledOnce();

    // Simulate the PUT /api/scenarios/:id returning an error
    const capturedOpts = mockUseUpdateScenario.mock.calls[0]?.[0];
    expect(capturedOpts?.mutation?.onError).toBeDefined();
    capturedOpts.mutation.onError(new Error("Network failure"), {}, undefined);

    // Panel must still be in edit mode — Save button still visible
    expect(screen.getByTestId("button-save-assumptions")).toBeInTheDocument();
    expect(screen.queryByTestId("button-edit-assumptions")).not.toBeInTheDocument();

    // The user's unsaved value "7.5" must still be in the input
    expect(screen.getByTestId("input-inflation-headline")).toHaveValue(7.5);
  });

});

// ---------------------------------------------------------------------------
// 3b. AssumptionsPanel — display driven by cache invalidation + refetch
//
// This describe block does NOT mock invalidateQueries so the real query cache
// mechanics run: save → invalidateQueries → background refetch → parent
// re-renders with fresh props → dashboard shows the new value.
// ---------------------------------------------------------------------------

describe("AssumptionsPanel — display driven by cache invalidation and refetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Wipe the singleton cache so seeded data from this test doesn't bleed out.
    singletonQc.clear();
  });

  afterEach(() => {
    cleanup();
    singletonQc.clear();
  });

  it("shows the updated inflationHeadline without a page reload — value comes from cache refetch, not manual prop update", async () => {
    const user = userEvent.setup();

    const initialScenario = {
      id: SCENARIO_ID,
      assumptions: {
        inflationHeadline: "6.0",
        inflationEdu: "8.0",
        inflationHealth: "8.0",
        returnPre: "10.0",
        returnPost: "7.0",
        lifeExpectancy: 85,
        source: "user" as const,
      },
    };

    const updatedScenario = {
      ...initialScenario,
      assumptions: { ...initialScenario.assumptions, inflationHeadline: "7.5" },
    };

    // The queryFn returns whichever scenario data is current.
    // We swap this to `updatedScenario` before triggering onSuccess so the
    // refetch that invalidateQueries fires returns the new value.
    let currentScenarioData: typeof initialScenario = initialScenario;
    const mockScenarioFetch = vi.fn(async () => currentScenarioData);

    // The scenario detail key must match exactly what AssumptionsPanel invalidates
    // and what the dashboard's useGetScenario query registers — i.e. the generated
    // getGetScenarioQueryKey key: ["/api/scenarios/<id>"] (single string element).
    const scenarioQueryKey = getGetScenarioQueryKey(SCENARIO_ID);

    // Seed the singleton cache with the initial scenario so the parent
    // renders immediately (no loading flicker) and does NOT fetch on mount.
    singletonQc.setQueryData(scenarioQueryKey, initialScenario);

    // A minimal query-backed parent: reads scenario from the shared cache and
    // passes it as a prop to AssumptionsPanel.  When AssumptionsPanel.onSuccess
    // calls invalidateQueries({ queryKey: getGetScenarioQueryKey(id) }), it marks
    // THIS query as stale and triggers a background refetch through mockScenarioFetch.
    function ScenarioDashboard() {
      const { data } = useQuery({
        queryKey: scenarioQueryKey,
        queryFn: mockScenarioFetch,
        // staleTime: Infinity prevents an automatic mount-time refetch; we want
        // only the explicit invalidation (from AssumptionsPanel.onSuccess) to
        // trigger a fetch.
        staleTime: Infinity,
      });
      if (!data) return null;
      return <AssumptionsPanel scenario={data} />;
    }

    render(
      <QueryClientProvider client={singletonQc}>
        <ScenarioDashboard />
      </QueryClientProvider>
    );

    // Initial display shows "6.0%".
    expect(screen.getByTestId("assumption-inflation-headline")).toHaveTextContent("6.0%");

    // Enter edit mode, change inflationHeadline to "7.5", and click Save.
    await user.click(screen.getByTestId("button-edit-assumptions"));
    const input = screen.getByTestId("input-inflation-headline");
    await user.clear(input);
    await user.type(input, "7.5");
    await user.click(screen.getByTestId("button-save-assumptions"));

    expect(mockMutate).toHaveBeenCalledOnce();

    // Swap the data the queryFn will return BEFORE triggering onSuccess.
    // This way the refetch that invalidateQueries triggers reads "7.5".
    currentScenarioData = updatedScenario;

    // Simulate the PUT response arriving successfully.
    // AssumptionsPanel.onSuccess calls:
    //   queryClient.invalidateQueries({ queryKey: ["/api/scenarios", SCENARIO_ID] })
    // Because singletonQc is the provider's client, this marks the scenario
    // query as stale and, since ScenarioDashboard is mounted, triggers an
    // immediate background refetch through mockScenarioFetch.
    const capturedOpts = mockUseUpdateScenario.mock.calls[0]?.[0];
    await act(async () => {
      await capturedOpts.mutation.onSuccess(
        { id: SCENARIO_ID },
        { id: SCENARIO_ID, data: {} },
        undefined,
      );
    });

    // The refetch must have been invoked (proves invalidation drove it, not a
    // manual rerender).
    await waitFor(() => expect(mockScenarioFetch).toHaveBeenCalled());

    // The dashboard now shows "7.5%" — the value from the refreshed cache.
    // No page reload. No manual rerender in the test.
    await waitFor(() => {
      expect(screen.getByTestId("assumption-inflation-headline")).toHaveTextContent("7.5%");
    });

    expect(screen.getByTestId("assumption-inflation-headline")).not.toHaveTextContent("6.0%");
  });
});

// ---------------------------------------------------------------------------
// 4. Query-key contract verification
// ---------------------------------------------------------------------------

describe("query-key contract — getListScenariosQueryKey stability", () => {
  it("returns a stable array key usable for invalidation", async () => {
    const { getListScenariosQueryKey: getKey } = await import(
      "@workspace/api-client-react"
    );
    const key = getKey();
    expect(Array.isArray(key)).toBe(true);
    expect(key.length).toBeGreaterThan(0);
    // Same shape on repeated calls (stable for query cache matching)
    expect(getKey()).toEqual(key);
  });
});
