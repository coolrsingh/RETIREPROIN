import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuickPlanForm from "@/components/quick-plan-form";
import type { QuickPlan } from "@shared/schema";

function renderForm(overrides: { onSubmit?: (data: QuickPlan) => void; isLoading?: boolean } = {}) {
  // Cast vi.fn() so it satisfies the typed prop and retains .mock for assertions
  const onSubmit = (overrides.onSubmit ?? vi.fn()) as ReturnType<typeof vi.fn> & ((data: QuickPlan) => void);
  const isLoading = overrides.isLoading ?? false;
  render(<QuickPlanForm onSubmit={onSubmit} isLoading={isLoading} />);
  return { onSubmit };
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByTestId("input-full-name"), "Jane Doe");
  await user.type(screen.getByTestId("input-dob"), "1985-06-15");
  const incomeInput = screen.getByTestId("input-monthly-income");
  await user.clear(incomeInput);
  await user.type(incomeInput, "60000");
  const expenseInput = screen.getByTestId("input-monthly-expense");
  await user.clear(expenseInput);
  await user.type(expenseInput, "30000");
}

describe("QuickPlanForm – required field validation", () => {
  it("shows a fullName error and does not call onSubmit when fullName is blank", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(screen.getByTestId("input-dob"), "1985-06-15");
    const incomeInput = screen.getByTestId("input-monthly-income");
    await user.clear(incomeInput);
    await user.type(incomeInput, "60000");
    const expenseInput = screen.getByTestId("input-monthly-expense");
    await user.clear(expenseInput);
    await user.type(expenseInput, "30000");

    await user.click(screen.getByTestId("button-create-plan"));

    await waitFor(() => {
      expect(screen.getByText("Full name is required")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a dob error and does not call onSubmit when date of birth is blank", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(screen.getByTestId("input-full-name"), "Jane Doe");
    const incomeInput = screen.getByTestId("input-monthly-income");
    await user.clear(incomeInput);
    await user.type(incomeInput, "60000");
    const expenseInput = screen.getByTestId("input-monthly-expense");
    await user.clear(expenseInput);
    await user.type(expenseInput, "30000");

    await user.click(screen.getByTestId("button-create-plan"));

    await waitFor(() => {
      expect(screen.getByText("Date of birth is required")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a monthly income error and does not call onSubmit when income is zero", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(screen.getByTestId("input-full-name"), "Jane Doe");
    await user.type(screen.getByTestId("input-dob"), "1985-06-15");

    const incomeInput = screen.getByTestId("input-monthly-income");
    await user.clear(incomeInput);
    await user.type(incomeInput, "0");

    const expenseInput = screen.getByTestId("input-monthly-expense");
    await user.clear(expenseInput);
    await user.type(expenseInput, "30000");

    await user.click(screen.getByTestId("button-create-plan"));

    await waitFor(() => {
      expect(screen.getByText("Monthly income is required")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("blocks submission when all required fields are left at their blank defaults", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.click(screen.getByTestId("button-create-plan"));

    await waitFor(() => {
      expect(screen.getByText("Full name is required")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("QuickPlanForm – invalid numeric value blocked", () => {
  it("does not call onSubmit when retirement age is below the minimum (18)", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await fillRequiredFields(user);

    const ageInput = screen.getByTestId("input-retirement-age");
    await user.clear(ageInput);
    await user.type(ageInput, "10");

    await user.click(screen.getByTestId("button-create-plan"));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it("does not call onSubmit when retirement age exceeds the maximum (100)", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await fillRequiredFields(user);

    const ageInput = screen.getByTestId("input-retirement-age");
    await user.clear(ageInput);
    await user.type(ageInput, "150");

    await user.click(screen.getByTestId("button-create-plan"));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});

describe("QuickPlanForm – valid submission", () => {
  it("calls onSubmit with the correct data when all required fields are valid", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(screen.getByTestId("input-full-name"), "Jane Doe");
    await user.type(screen.getByTestId("input-dob"), "1985-06-15");

    const incomeInput = screen.getByTestId("input-monthly-income");
    await user.clear(incomeInput);
    await user.type(incomeInput, "80000");

    const expenseInput = screen.getByTestId("input-monthly-expense");
    await user.clear(expenseInput);
    await user.type(expenseInput, "40000");

    await user.click(screen.getByTestId("button-create-plan"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce();
    });

    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.fullName).toBe("Jane Doe");
    expect(submitted.dob).toBe("1985-06-15");
    expect(submitted.monthlyIncomeTotal).toBe(80000);
    expect(submitted.monthlyExpenseTotal).toBe(40000);
  });

  it("does not show any validation errors after a successful submission", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByTestId("input-full-name"), "Jane Doe");
    await user.type(screen.getByTestId("input-dob"), "1985-06-15");

    const incomeInput = screen.getByTestId("input-monthly-income");
    await user.clear(incomeInput);
    await user.type(incomeInput, "80000");

    const expenseInput = screen.getByTestId("input-monthly-expense");
    await user.clear(expenseInput);
    await user.type(expenseInput, "40000");

    await user.click(screen.getByTestId("button-create-plan"));

    await waitFor(() => {
      expect(screen.queryByText("Full name is required")).not.toBeInTheDocument();
      expect(screen.queryByText("Date of birth is required")).not.toBeInTheDocument();
      expect(screen.queryByText("Monthly income is required")).not.toBeInTheDocument();
    });
  });
});

describe("QuickPlanForm – child row validation", () => {
  it("blocks submission and shows an error when a child row is added but left completely blank", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await fillRequiredFields(user);

    // Add a child row without filling any fields
    await user.click(screen.getByTestId("button-add-child"));

    await user.click(screen.getByTestId("button-create-plan"));

    await waitFor(() => {
      expect(screen.getByTestId("error-child-dob-0")).toBeInTheDocument();
      expect(screen.getByTestId("error-child-dob-0")).toHaveTextContent(
        "Child must have a name or date of birth"
      );
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("allows submission when a child row has a name but no DOB", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await fillRequiredFields(user);

    await user.click(screen.getByTestId("button-add-child"));
    await user.type(screen.getByTestId("input-child-name-0"), "Alice");

    await user.click(screen.getByTestId("button-create-plan"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce();
    });
    expect(screen.queryByTestId("error-child-dob-0")).not.toBeInTheDocument();
  });

  it("allows submission when a child row has a DOB but no name", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await fillRequiredFields(user);

    await user.click(screen.getByTestId("button-add-child"));
    await user.type(screen.getByTestId("input-child-dob-0"), "2015-03-20");

    await user.click(screen.getByTestId("button-create-plan"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce();
    });
  });

  it("clears the blank-child error when the user types a name without re-submitting", async () => {
    const user = userEvent.setup();
    renderForm();

    await fillRequiredFields(user);

    // Add a blank child row and submit to trigger the error
    await user.click(screen.getByTestId("button-add-child"));
    await user.click(screen.getByTestId("button-create-plan"));

    await waitFor(() => {
      expect(screen.getByTestId("error-child-dob-0")).toBeInTheDocument();
    });

    // Type a name — the error should clear immediately, no re-submit needed
    await user.type(screen.getByTestId("input-child-name-0"), "Alice");

    await waitFor(() => {
      expect(screen.queryByTestId("error-child-dob-0")).not.toBeInTheDocument();
    });
  });

  it("removes the error when the child row is removed before submitting", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await fillRequiredFields(user);

    // Add blank child then submit to trigger error
    await user.click(screen.getByTestId("button-add-child"));
    await user.click(screen.getByTestId("button-create-plan"));

    await waitFor(() => {
      expect(screen.getByTestId("error-child-dob-0")).toBeInTheDocument();
    });

    // Remove the child row
    await user.click(screen.getByTestId("button-remove-child-0"));

    // Submit again — should now succeed
    await user.click(screen.getByTestId("button-create-plan"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce();
    });
    expect(screen.queryByTestId("error-child-dob-0")).not.toBeInTheDocument();
  });
});

describe("QuickPlanForm – loading state", () => {
  it("shows the loading label and disables the button when isLoading is true", () => {
    renderForm({ isLoading: true });

    const btn = screen.getByTestId("button-create-plan");
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent("Generating your plan");
  });

  it("shows the default label and the button is enabled when isLoading is false", () => {
    renderForm({ isLoading: false });

    const btn = screen.getByTestId("button-create-plan");
    expect(btn).not.toBeDisabled();
    expect(btn).toHaveTextContent("Generate My Plan");
  });
});

// ---------------------------------------------------------------------------
// 320px layout regression tests
//
// jsdom does not compute real CSS layout, so we assert the Tailwind classes
// that prevent horizontal overflow on very small phones (320px).  These tests
// act as a regression guard: if a refactor strips a class that keeps a row
// from overflowing at 320px the test will fail and catch the regression.
// ---------------------------------------------------------------------------
describe("QuickPlanForm – 320px layout regression (no horizontal overflow)", () => {
  beforeEach(() => {
    // Simulate a 320px wide viewport so any code that branches on window.innerWidth
    // behaves as it would on the narrowest real phone.
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 320 });
    window.dispatchEvent(new Event("resize"));
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1024 });
  });

  it("savings header row has flex-wrap so the toggle button wraps instead of overflowing", () => {
    renderForm();
    const row = screen.getByTestId("savings-header-row");
    expect(row.className).toContain("flex-wrap");
  });

  it("salary-growth input row has flex-wrap so the '% per year' label wraps at 320px", () => {
    renderForm();
    const row = screen.getByTestId("salary-growth-row");
    expect(row.className).toContain("flex-wrap");
  });

  it("mini-retirement toggle card header has items-start so the switch doesn't force a wide single line", () => {
    renderForm();
    // The outer flex container inside the mini-retirement CardHeader
    const card = screen.getByTestId("card-mini-retirement");
    const header = card.querySelector('[class*="flex"][class*="items-start"][class*="justify-between"]');
    expect(header).not.toBeNull();
  });

  it("mini-retirement switch has shrink-0 so it never squashes the title text", () => {
    renderForm();
    const toggle = screen.getByTestId("toggle-mini-retirement");
    // The Switch root element carries the shrink-0 class passed via className
    expect(toggle.className).toContain("shrink-0");
  });

  it("existing-EMI toggle card header has items-start to avoid single-line overflow", () => {
    renderForm();
    const card = screen.getByTestId("card-existing-emi");
    const header = card.querySelector('[class*="flex"][class*="items-start"][class*="justify-between"]');
    expect(header).not.toBeNull();
  });

  it("existing-EMI switch has shrink-0 so it never squashes the title text", () => {
    renderForm();
    const toggle = screen.getByTestId("toggle-existing-emi");
    expect(toggle.className).toContain("shrink-0");
  });

  it("children grid row defaults to grid-cols-1 so columns don't overflow a 320px screen", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByTestId("button-add-child"));

    // The child row container is the first element with a grid class inside card-children
    const card = screen.getByTestId("card-children");
    const childRow = card.querySelector('[class*="grid-cols-1"]');
    expect(childRow).not.toBeNull();
    // Also confirm it carries sm: and md: responsive variants (so wider screens use more cols)
    expect(childRow!.className).toContain("sm:grid-cols-2");
    expect(childRow!.className).toContain("md:grid-cols-5");
  });
});
