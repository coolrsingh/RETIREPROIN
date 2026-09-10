import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LeadsAdmin from "@/pages/leads-admin";

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { role: "admin" }, isAuthenticated: true, isLoading: false }),
}));
vi.mock("wouter", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock("@/components/brand-logo", () => ({ default: () => <span>RetirePro</span> }));

const leads = Array.from({ length: 51 }, (_, index) => ({
  id: String(index + 1),
  name: `Lead ${String(index + 1).padStart(2, "0")}`,
  email: `lead${index + 1}@example.com`,
  phone: `900000${String(index + 1).padStart(4, "0")}`,
  createdAt: new Date(2026, 0, index + 1).toISOString(),
  updatedAt: new Date(2026, 0, index + 1).toISOString(),
  utm: { utm_source: "direct" },
}));

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  client.setQueryData(["/api/leads"], leads);
  return render(
    <QueryClientProvider client={client}>
      <LeadsAdmin />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Leads Admin pagination and export", () => {
  it("renders 50 leads per page and navigates to the remainder", async () => {
    renderPage();
    const user = userEvent.setup();

    expect(screen.getAllByText(/^Lead \d{2}$/)).toHaveLength(50);
    expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next page" }));

    await waitFor(() => {
      expect(screen.getAllByText(/^Lead \d{2}$/)).toHaveLength(1);
      expect(screen.getByText(/Page 2 of 2/)).toBeInTheDocument();
    });
  });

  it("exports all leads even when search leaves one visible row", async () => {
    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/search by name/i), "Lead 51");
    await user.click(screen.getByRole("button", { name: "Export CSV" }));

    expect(createObjectURL).toHaveBeenCalledOnce();
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    const csv = await blob.text();
    expect(csv).toContain('"Lead 01"');
    expect(csv).toContain('"Lead 51"');
    expect(csv.trim().split("\n")).toHaveLength(52);
  });
});