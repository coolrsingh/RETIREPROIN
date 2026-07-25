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
