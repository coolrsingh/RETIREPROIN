import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { RequestHandler } from "express";

vi.hoisted(() => {
  process.env.DATABASE_URL ??= "postgresql://phase-one-flow-test";
});

const mockNavigate = vi.fn();

vi.mock("wouter", () => ({
  useLocation: () => ["/free-plan", mockNavigate],
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("framer-motion", () => ({
  motion: new Proxy({}, {
    get: (_target, tag: string) => {
      const { forwardRef, createElement } = require("react");
      return forwardRef(({ children, ...rest }: any, ref: any) =>
        createElement(tag, { ref, ...rest }, children)
      );
    },
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/hooks/usePageMeta", () => ({ usePageMeta: () => {} }));
vi.mock("../../../api-server/src/replitAuth", () => ({
  setupAuth: vi.fn(async () => undefined),
  isAuthenticated: ((_req: any, _res: any, next: any) => next()) as RequestHandler,
}));
vi.mock("../../../api-server/src/storage", () => ({ storage: {} }));
vi.mock("../../../api-server/src/db", () => ({ db: {} }));

import FreePlan from "@/pages/free-plan";
// @ts-expect-error Test-only JavaScript bridge keeps API source out of the web tsc graph.
import { startPhaseOneTestServer } from "./phase1-test-server.js";

class MockResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
}

const nativeFetch = globalThis.fetch;
const stored = new Map<string, string>();
const currentYear = new Date().getFullYear();

function savedJson<T>(key: string): T {
  const value = stored.get(key);
  expect(value, `${key} should be saved`).toBeDefined();
  return JSON.parse(value!) as T;
}

function submittedRequest(): any {
  const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
  const [, init] = fetchMock.mock.calls[0];
  return JSON.parse(init.body);
}

async function fillIdentity(user: ReturnType<typeof userEvent.setup>, birthYear: string) {
  await user.type(screen.getByTestId("input-full-name"), "Phase One User");
  await user.selectOptions(screen.getByTestId("input-dob-month"), "01");
  await user.selectOptions(screen.getByTestId("input-dob-year"), birthYear);
}

describe("Phase 1 quick-plan form → guest route → chart data", () => {
  let server: { close: (callback: (error?: Error) => void) => void };
  let baseUrl: string;

  beforeAll(async () => {
    ({ server, baseUrl } = await startPhaseOneTestServer());
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  });

  beforeEach(() => {
    stored.clear();
    mockNavigate.mockClear();
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn((key: string) => stored.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => stored.set(key, value)),
      removeItem: vi.fn((key: string) => stored.delete(key)),
      clear: vi.fn(() => stored.clear()),
    });
    vi.stubGlobal("fetch", vi.fn((input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === "string" && input.startsWith("/") ? `${baseUrl}${input}` : input;
      return nativeFetch(url, init);
    }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("maps spouse, EPF, NPS, and assumption controls into the returned chart series", async () => {
    const user = userEvent.setup();
    render(<FreePlan />);

    await fillIdentity(user, String(currentYear - 40));
    await user.clear(screen.getByTestId("input-monthly-income"));
    await user.type(screen.getByTestId("input-monthly-income"), "100000");
    await user.clear(screen.getByTestId("input-monthly-expense"));
    await user.type(screen.getByTestId("input-monthly-expense"), "50000");

    await user.click(screen.getByTestId("toggle-spouse"));
    fireEvent.change(screen.getByTestId("input-spouse-dob"), {
      target: { value: `${currentYear - 38}-01-01` },
    });
    await user.clear(screen.getByTestId("input-spouse-income"));
    await user.type(screen.getByTestId("input-spouse-income"), "50000");

    await user.clear(screen.getByTestId("input-epf-corpus"));
    await user.type(screen.getByTestId("input-epf-corpus"), "800000");
    await user.clear(screen.getByTestId("input-nps-corpus"));
    await user.type(screen.getByTestId("input-nps-corpus"), "200000");
    fireEvent.change(screen.getByTestId("input-inflation-range"), { target: { value: "6.5" } });
    fireEvent.change(screen.getByTestId("input-pre-return-range"), { target: { value: "11.5" } });

    await user.click(screen.getByTestId("button-create-plan"));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/plan/preview"));

    const submitted = submittedRequest();
    const result = savedJson<any>("guestCalcResult");
    expect(submitted).toEqual(expect.objectContaining({
      personaMode: "accumulating",
      spouseMonthlyIncome: 50000,
      epfCorpus: 800000,
      npsCorpus: 200000,
      assumptions: expect.objectContaining({ inflationHeadline: 6.5, returnPre: 11.5 }),
    }));
    expect(result.cashflowSeries[0].income).toBe(1800000);

    const withoutEpfResponse = await nativeFetch(`${baseUrl}/api/plan/try`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...submitted, epfCorpus: 0 }),
    });
    const withoutNpsResponse = await nativeFetch(`${baseUrl}/api/plan/try`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...submitted, npsCorpus: 0 }),
    });
    const withoutEpf = await withoutEpfResponse.json() as any;
    const withoutNps = await withoutNpsResponse.json() as any;
    expect(result.netWorthSeries[0].value).toBeGreaterThan(withoutEpf.netWorthSeries[0].value);
    expect(result.netWorthSeries[0].value).toBeGreaterThan(withoutNps.netWorthSeries[0].value);
  });

  it("maps the retired persona controls into a declining drawdown chart", async () => {
    const user = userEvent.setup();
    render(<FreePlan />);

    await user.click(screen.getByTestId("persona-retired"));
    await fillIdentity(user, String(currentYear - 60));
    await user.clear(screen.getByTestId("input-current-corpus"));
    await user.type(screen.getByTestId("input-current-corpus"), "5000000");
    await user.clear(screen.getByTestId("input-monthly-withdrawal"));
    await user.type(screen.getByTestId("input-monthly-withdrawal"), "60000");
    await user.clear(screen.getByTestId("input-monthly-expense"));
    await user.type(screen.getByTestId("input-monthly-expense"), "60000");

    await user.click(screen.getByTestId("button-create-plan"));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/plan/preview"));

    const submitted = submittedRequest();
    const result = savedJson<any>("guestCalcResult");
    expect(submitted).toEqual(expect.objectContaining({
      personaMode: "retired",
      currentCorpus: 5000000,
      monthlyWithdrawal: 60000,
      monthlyIncomeTotal: 0,
    }));
    expect(result.netWorthSeries.at(-1).value).toBeLessThan(result.netWorthSeries[0].value);
  });
});