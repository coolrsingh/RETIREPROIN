/**
 * response-validation-error-toast.test.tsx
 *
 * Verifies that when the API client throws a ResponseValidationError the
 * "update available" toast fires on both home.tsx and plan-dashboard.tsx,
 * and that console.error is called with the expected fields (url, method,
 * message).
 *
 * Coverage:
 *  - Home      – useListScenarios throws ResponseValidationError → toast fires
 *  - Home      – console.error receives { url, method, message }
 *  - Home      – no toast when useListScenarios resolves normally
 *  - Dashboard – useGetScenario throws ResponseValidationError → toast fires
 *  - Dashboard – console.error receives { url, method, message }
 *  - Dashboard – no toast when useGetScenario resolves normally
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ---------------------------------------------------------------------------
// Mutable control variables — tests set these in beforeEach to inject errors.
// var is used so these exist (as undefined/null) before vi.mock factories run.
// ---------------------------------------------------------------------------

// eslint-disable-next-line no-var
var listScenariosError: Error | null = null;
// eslint-disable-next-line no-var
var getScenarioError: Error | null = null;
// eslint-disable-next-line no-var
var getScenarioData: Record<string, unknown> | undefined = undefined;

// RVE is populated by the vi.mock factory once the mock module is imported.
// It is used to construct error instances in beforeEach.
// eslint-disable-next-line no-var
var RVE: {
  new (message: string, url?: string, method?: string): Error & {
    url: string;
    method: string;
  };
};

// ---------------------------------------------------------------------------
// Module mocks — Vitest hoists these to before any imports.
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
    error: null,
  }),
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/", vi.fn()],
  useRoute: (_pattern: string) => [true, { id: "plan-123" }],
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

vi.mock("@/lib/authUtils", () => ({
  isUnauthorizedError: () => false,
}));

vi.mock("@/lib/queryClient", () => ({
  apiRequest: vi.fn().mockResolvedValue({}),
}));

// Heavy plan-dashboard sub-components — stubbed out
vi.mock("@/components/plan-chart", () => ({ default: () => <div data-testid="plan-chart" /> }));
vi.mock("@/components/cashflow-chart", () => ({ default: () => <div data-testid="cashflow-chart" /> }));
vi.mock("@/components/cashflow-advisor", () => ({ default: () => <div data-testid="cashflow-advisor" /> }));
vi.mock("@/components/period-report", () => ({ default: () => <div data-testid="period-report" /> }));
vi.mock("@/components/kpi-cards", () => ({ default: () => <div data-testid="kpi-cards" /> }));
vi.mock("@/components/assumptions-panel", () => ({ default: () => <div data-testid="assumptions-panel" /> }));
vi.mock("@/components/savings-insights-chart", () => ({ default: () => <div data-testid="savings-insights-chart" /> }));
vi.mock("@/components/lead-capture-modal", () => ({ default: () => null }));

// api-client-react — defines ResponseValidationError internally (avoids
// hoisting issues with class declarations) and exposes it via the RVE var.
// useListScenarios / useGetScenario read the mutable control vars at call
// time (during render), so beforeEach values are always picked up.
vi.mock("@workspace/api-client-react", () => {
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

  // Expose to test code via the module-scope var
  RVE = ResponseValidationError;

  return {
    ResponseValidationError,
    getListScenariosQueryKey: () => ["scenarios", "list"],
    useListScenarios: () => ({
      data: listScenariosError ? undefined : [],
      isLoading: false,
      error: listScenariosError,
    }),
    getGetScenarioQueryKey: (id: string) => ["scenario", id],
    useGetScenario: (_id: string) => ({
      data: getScenarioData,
      isLoading: false,
      error: getScenarioError,
    }),
    getGetCrmDefaultsQueryKey: () => ["crmDefaults"],
    useGetCrmDefaults: () => ({ data: undefined }),
  };
});

// Imported after mocks are registered
import Home from "@/pages/home";
import PlanDashboard from "@/pages/plan-dashboard";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeQC() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={makeQC()}>{children}</QueryClientProvider>;
}

// ---------------------------------------------------------------------------
// Global setup / teardown
// ---------------------------------------------------------------------------

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  // Reset control vars to "no error" state before each test
  listScenariosError = null;
  getScenarioError = null;
  getScenarioData = undefined;

  mockToast.mockClear();
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ===========================================================================
// home.tsx — useListScenarios throws ResponseValidationError
// ===========================================================================

describe("Home – ResponseValidationError from useListScenarios", () => {
  it("fires the 'update available' toast when useListScenarios throws ResponseValidationError", async () => {
    listScenariosError = new RVE(
      "Unexpected field 'corpus' in response",
      "https://api.example.com/scenarios",
      "GET",
    );

    render(
      <Wrap>
        <Home />
      </Wrap>,
    );

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Update available",
          description: "We deployed an update — please refresh the page.",
          variant: "destructive",
        }),
      );
    });
  });

  it("logs console.error with url, method, and message when ResponseValidationError is thrown", async () => {
    const err = new RVE(
      "Unexpected field 'corpus' in response",
      "https://api.example.com/scenarios",
      "GET",
    );
    listScenariosError = err;

    render(
      <Wrap>
        <Home />
      </Wrap>,
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[ResponseValidationError]",
        expect.objectContaining({
          url: err.url,
          method: err.method,
          message: err.message,
        }),
      );
    });
  });

  it("does NOT fire the 'update available' toast when useListScenarios resolves normally", async () => {
    // listScenariosError is null — normal scenario

    render(
      <Wrap>
        <Home />
      </Wrap>,
    );

    // Allow effects to flush
    await new Promise((r) => setTimeout(r, 80));

    const updateCalls = mockToast.mock.calls.filter(
      (args) => args[0]?.title === "Update available",
    );
    expect(updateCalls).toHaveLength(0);
  });
});

// ===========================================================================
// plan-dashboard.tsx — useGetScenario throws ResponseValidationError
// ===========================================================================

describe("PlanDashboard – ResponseValidationError from useGetScenario", () => {
  it("fires the 'update available' toast when useGetScenario throws ResponseValidationError", async () => {
    getScenarioError = new RVE(
      "Missing required field 'projections' in response",
      "https://api.example.com/scenarios/plan-123",
      "GET",
    );

    render(
      <Wrap>
        <PlanDashboard />
      </Wrap>,
    );

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Update available",
          description: "We deployed an update — please refresh the page.",
          variant: "destructive",
        }),
      );
    });
  });

  it("logs console.error with url, method, and message when ResponseValidationError is thrown", async () => {
    const err = new RVE(
      "Missing required field 'projections' in response",
      "https://api.example.com/scenarios/plan-123",
      "GET",
    );
    getScenarioError = err;

    render(
      <Wrap>
        <PlanDashboard />
      </Wrap>,
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[ResponseValidationError]",
        expect.objectContaining({
          url: err.url,
          method: err.method,
          message: err.message,
        }),
      );
    });
  });

  it("does NOT fire the 'update available' toast when useGetScenario resolves normally", async () => {
    // Provide a minimal scenario so the component doesn't show "Plan Not Found"
    getScenarioData = {
      id: "plan-123",
      name: "My Retirement Plan",
      updatedAt: new Date("2025-01-01").toISOString(),
      assumptions: { returnPre: 12, returnPost: 8 },
    };

    render(
      <Wrap>
        <PlanDashboard />
      </Wrap>,
    );

    await new Promise((r) => setTimeout(r, 80));

    const updateCalls = mockToast.mock.calls.filter(
      (args) => args[0]?.title === "Update available",
    );
    expect(updateCalls).toHaveLength(0);
  });
});
