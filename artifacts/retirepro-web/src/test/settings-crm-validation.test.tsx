/**
 * CRM Defaults form – client-side range validation tests
 *
 * Confirms that the SettingsCrm form shows inline Zod errors for out-of-range
 * values and does NOT call the mutation, then confirms a fully-valid submission
 * DOES call the mutation.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/react";

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock("wouter", () => ({
  useLocation: () => ["/settings", vi.fn()],
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { role: "admin", firstName: "Admin", email: "admin@test.com" },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

const mockMutate = vi.fn();
vi.mock("@workspace/api-client-react", () => ({
  useGetCrmDefaults: () => ({ data: undefined, isLoading: false }),
  getGetCrmDefaultsQueryKey: () => ["/api/crm/defaults"],
  useUpdateCrmDefaults: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/lib/queryClient", () => ({
  queryClient: { invalidateQueries: vi.fn() },
}));

vi.mock("@/components/brand-logo", () => ({
  default: () => <span>RetirePro</span>,
}));

// ── Component under test ──────────────────────────────────────────────────────
import SettingsCrm from "@/pages/settings-crm";

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderForm() {
  render(<SettingsCrm />);
}

/**
 * Set a number input's value via fireEvent.change so the react-hook-form
 * onChange handler receives the full final value in one shot, bypassing
 * jsdom number-input clamping that occurs during character-by-character typing.
 */
function setNumberInput(testId: string, value: number) {
  const input = screen.getByTestId(testId);
  fireEvent.change(input, { target: { value: String(value) } });
}

async function clickSave(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByTestId("button-save"));
}

// ── Out-of-range tests ────────────────────────────────────────────────────────

describe("SettingsCrm – out-of-range inputs produce inline errors and block submission", () => {
  beforeEach(() => {
    mockMutate.mockClear();
  });

  it("shows an error and blocks submit when inflationHeadline exceeds 20", async () => {
    const user = userEvent.setup();
    renderForm();

    setNumberInput("input-inflation-headline", 99);
    await clickSave(user);

    await waitFor(() => {
      expect(
        screen.getByText(/less than or equal to 20/i)
      ).toBeInTheDocument();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows an error and blocks submit when inflationEdu exceeds 20", async () => {
    const user = userEvent.setup();
    renderForm();

    setNumberInput("input-inflation-education", 25);
    await clickSave(user);

    await waitFor(() => {
      expect(
        screen.getByText(/less than or equal to 20/i)
      ).toBeInTheDocument();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows an error and blocks submit when inflationHealth exceeds 20", async () => {
    const user = userEvent.setup();
    renderForm();

    setNumberInput("input-inflation-health", 30);
    await clickSave(user);

    await waitFor(() => {
      expect(
        screen.getByText(/less than or equal to 20/i)
      ).toBeInTheDocument();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows an error and blocks submit when returnPre exceeds 30", async () => {
    const user = userEvent.setup();
    renderForm();

    setNumberInput("input-return-pre", 55);
    await clickSave(user);

    await waitFor(() => {
      expect(
        screen.getByText(/less than or equal to 30/i)
      ).toBeInTheDocument();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows an error and blocks submit when returnPost exceeds 30", async () => {
    const user = userEvent.setup();
    renderForm();

    setNumberInput("input-return-post", 50);
    await clickSave(user);

    await waitFor(() => {
      expect(
        screen.getByText(/less than or equal to 30/i)
      ).toBeInTheDocument();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows an error and blocks submit when lifeExpectancy is below 60", async () => {
    const user = userEvent.setup();
    renderForm();

    setNumberInput("input-life-expectancy", 20);
    await clickSave(user);

    await waitFor(() => {
      expect(
        screen.getByText(/greater than or equal to 60/i)
      ).toBeInTheDocument();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows an error and blocks submit when lifeExpectancy exceeds 100", async () => {
    const user = userEvent.setup();
    renderForm();

    setNumberInput("input-life-expectancy", 120);
    await clickSave(user);

    await waitFor(() => {
      expect(
        screen.getByText(/less than or equal to 100/i)
      ).toBeInTheDocument();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });
});

// ── Valid submission tests ─────────────────────────────────────────────────────

describe("SettingsCrm – valid in-range submission calls the mutation", () => {
  beforeEach(() => {
    mockMutate.mockClear();
  });

  it("calls the update mutation with correct values when all fields are within valid ranges", async () => {
    const user = userEvent.setup();
    renderForm();

    // Set each field to a clearly in-range value
    setNumberInput("input-inflation-headline", 6);
    setNumberInput("input-inflation-education", 8);
    setNumberInput("input-inflation-health", 7);
    setNumberInput("input-return-pre", 10);
    setNumberInput("input-return-post", 7);
    setNumberInput("input-life-expectancy", 85);

    await clickSave(user);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledOnce();
    });

    const submitted = mockMutate.mock.calls[0][0];
    expect(submitted.data.inflationHeadline).toBe(6);
    expect(submitted.data.inflationEdu).toBe(8);
    expect(submitted.data.inflationHealth).toBe(7);
    expect(submitted.data.returnPre).toBe(10);
    expect(submitted.data.returnPost).toBe(7);
    expect(submitted.data.lifeExpectancy).toBe(85);
  });

  it("does not show any range-error messages after a valid submission", async () => {
    const user = userEvent.setup();
    renderForm();

    // Default values (all valid) — just save without overriding anything
    await clickSave(user);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledOnce();
    });

    expect(
      screen.queryByText(/less than or equal to/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/greater than or equal to/i)
    ).not.toBeInTheDocument();
  });
});
