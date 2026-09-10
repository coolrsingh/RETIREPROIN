import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SubscribersAdmin from "@/pages/subscribers-admin";

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
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/brand-logo", () => ({
  default: () => <span data-testid="brand-logo">RetirePro</span>,
}));

const sourceA = "blog-why-indians-fail";
const sourceB = "blog-nps-ppf-sip";

const subscribers = [
  ...Array.from({ length: 55 }, (_, index) => ({
    id: `a-${index}`,
    email: index < 2 ? `target-a${index}@example.com` : `reader-a${index}@example.com`,
    source: sourceA,
    createdAt: "2026-09-01T12:00:00.000Z",
  })),
  ...Array.from({ length: 55 }, (_, index) => ({
    id: `b-${index}`,
    email: index === 0 ? "target-b@example.com" : `reader-b${index}@example.com`,
    source: sourceB,
    createdAt: "2026-09-02T12:00:00.000Z",
  })),
];

function renderSubscribers() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: Infinity },
    },
  });
  queryClient.setQueryData(["/api/subscribers"], subscribers);

  return render(
    <QueryClientProvider client={queryClient}>
      <SubscribersAdmin />
    </QueryClientProvider>,
  );
}

afterEach(cleanup);

describe("Subscribers Admin — combined search, source filter, and pagination", () => {
  it("applies search and source with AND logic and reports the rendered result count", async () => {
    renderSubscribers();
    const user = userEvent.setup();

    await user.selectOptions(screen.getByRole("combobox"), sourceA);
    await user.type(screen.getByPlaceholderText(/search email/i), "target");

    await waitFor(() => {
      expect(screen.getByText(/2 of 110 shown/i)).toBeInTheDocument();
    });

    const bodyRows = within(screen.getByRole("table"))
      .getAllByRole("row")
      .slice(1);
    expect(bodyRows).toHaveLength(2);
    expect(screen.getByText("target-a0@example.com")).toBeInTheDocument();
    expect(screen.getByText("target-a1@example.com")).toBeInTheDocument();
    expect(screen.queryByText("target-b@example.com")).not.toBeInTheDocument();
  });

  it("returns to page 1 when either the email search or source filter changes", async () => {
    renderSubscribers();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText(/Page 2 of 3/i)).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/search email/i), "@example.com");
    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText(/Page 2 of 3/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox"), sourceA);
    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
    });
  });
});