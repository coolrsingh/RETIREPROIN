import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("wouter", () => ({
  useLocation: () => ["/free-plan", mockNavigate],
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        const { forwardRef, createElement } = require("react");
        return forwardRef(({ children, ...rest }: any, ref: any) =>
          createElement(tag, { ref, ...rest }, children)
        );
      },
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/hooks/usePageMeta", () => ({
  usePageMeta: () => {},
}));

const mockNavigate = vi.fn();

import FreePlan from "@/pages/free-plan";

class MockResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByTestId("input-full-name"), "Arjun Sharma");
  await user.type(screen.getByTestId("input-dob"), "1985-06-15");

  const incomeInput = screen.getByTestId("input-monthly-income");
  await user.clear(incomeInput);
  await user.type(incomeInput, "80000");

  const expenseInput = screen.getByTestId("input-monthly-expense");
  await user.clear(expenseInput);
  await user.type(expenseInput, "40000");
}

describe("FreePlan page — API integration", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("POSTs to /api/plan/try with the correct Content-Type and JSON body on valid submit", async () => {
    const fakeResult = { corpus: 12000000 };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeResult,
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<FreePlan />);
    await fillValidForm(user);
    await user.click(screen.getByTestId("button-create-plan"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledOnce();
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/plan/try");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });

    const body = JSON.parse(init.body);
    expect(body.fullName).toBe("Arjun Sharma");
    expect(body.dob).toBe("1985-06-15");
    expect(body.monthlyIncomeTotal).toBe(80000);
    expect(body.monthlyExpenseTotal).toBe(40000);
  });

  it("persists result to sessionStorage and navigates to /plan/preview on success", async () => {
    const fakeResult = { corpus: 12000000 };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeResult,
    }));

    const user = userEvent.setup();
    render(<FreePlan />);
    await fillValidForm(user);
    await user.click(screen.getByTestId("button-create-plan"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/plan/preview");
    });

    const ssSetItem = sessionStorage.setItem as ReturnType<typeof vi.fn>;
    const guestResultCall = ssSetItem.mock.calls.find(
      ([key]: [string]) => key === "guestCalcResult"
    );
    expect(guestResultCall).toBeDefined();
    expect(JSON.parse(guestResultCall![1])).toEqual(fakeResult);

    const guestFormCall = ssSetItem.mock.calls.find(
      ([key]: [string]) => key === "guestCalcForm"
    );
    expect(guestFormCall).toBeDefined();
    const savedForm = JSON.parse(guestFormCall![1]);
    expect(savedForm.fullName).toBe("Arjun Sharma");
  });

  it("does not call the API when required fields are blank (validation guard)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<FreePlan />);

    await user.click(screen.getByTestId("button-create-plan"));

    await waitFor(() => {
      expect(screen.getByText("Full name is required")).toBeInTheDocument();
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows an error alert when the API returns a non-OK response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Plan limit reached. Please upgrade." }),
    }));

    const user = userEvent.setup();
    render(<FreePlan />);
    await fillValidForm(user);
    await user.click(screen.getByTestId("button-create-plan"));

    await waitFor(() => {
      expect(
        screen.getByText("Plan limit reached. Please upgrade.")
      ).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows a generic error alert when the fetch call throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network failure")));

    const user = userEvent.setup();
    render(<FreePlan />);
    await fillValidForm(user);
    await user.click(screen.getByTestId("button-create-plan"));

    await waitFor(() => {
      expect(screen.getByText("Network failure")).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("disables the submit button while the request is in-flight", async () => {
    let resolveFetch!: (value: unknown) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
      )
    );

    const user = userEvent.setup();
    render(<FreePlan />);
    await fillValidForm(user);
    await user.click(screen.getByTestId("button-create-plan"));

    await waitFor(() => {
      expect(screen.getByTestId("button-create-plan")).toBeDisabled();
    });

    resolveFetch({ ok: true, json: async () => ({}) });
  });
});
