/**
 * api-request-shapes.test.tsx
 *
 * Verifies that the lead-capture modal and profile-edit dialog send exactly the
 * field names the server expects.
 *
 * Coverage:
 *  - POST /api/lead  – body must contain `name`, `phone`, optional `email` /
 *                      `scenarioId`.  Extra fields (e.g. `consent`) must NOT be
 *                      forwarded.
 *  - PUT  /api/profile – body may contain only the fields listed in the
 *                        server's allow-list: firstName, lastName, phone, dob,
 *                        retirementAge, monthlyIncome, monthlyExpenses,
 *                        monthlySavings, incomeGrowthRate, currentAssets.
 *
 * Both tests run purely in-process against mocked hooks — no network needed.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ---------------------------------------------------------------------------
// Module-level mocks (Vitest hoists these before imports)
// ---------------------------------------------------------------------------

const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

// ── lead-capture-modal deps ─────────────────────────────────────────────────

/** Captured args from createLead.mutate({ data: ... }) */
let capturedLeadPayload: unknown = undefined;
const mockCreateLeadMutate = vi.fn((args: unknown) => {
  capturedLeadPayload = args;
});

vi.mock("@workspace/api-client-react", () => ({
  useCreateLead: (opts: any) => ({
    mutate: (args: unknown) => {
      mockCreateLeadMutate(args);
      // Immediately invoke onSuccess so the component resets correctly.
      opts?.mutation?.onSuccess?.();
    },
    isPending: false,
  }),
  useUpdateProfile: (opts: any) => ({
    mutate: (args: unknown) => {
      mockUpdateProfileMutate(args);
      opts?.mutation?.onSuccess?.();
    },
    isPending: false,
  }),
  useGetProfile: () => ({
    data: {
      firstName: "Arjun",
      phone: "9876543210",
      dob: "1985-06-15",
      retirementAge: 60,
      monthlyIncome: "80000",
      monthlyExpenses: "50000",
      monthlySavings: "30000",
      incomeGrowthRate: "8",
      currentAssets: "2000000",
    },
  }),
  getGetProfileQueryKey: () => ["/api/profile"],
}));

/** Captured args from updateProfile.mutate({ data: ... }) */
let capturedProfilePayload: unknown = undefined;
const mockUpdateProfileMutate = vi.fn((args: unknown) => {
  capturedProfilePayload = args;
});

// profile-menu depends on wouter & apiRequest (for share)
vi.mock("wouter", () => ({
  useLocation: () => ["/", vi.fn()],
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/queryClient", () => ({
  apiRequest: vi.fn().mockResolvedValue({}),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={makeQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests: lead-capture modal (POST /api/lead)
// ---------------------------------------------------------------------------

describe("LeadCaptureModal — POST /api/lead request shape", () => {
  beforeEach(() => {
    capturedLeadPayload = undefined;
    mockCreateLeadMutate.mockClear();
    mockToast.mockClear();
  });

  async function renderAndSubmit(scenarioId?: string) {
    const { default: LeadCaptureModal } = await import(
      "@/components/lead-capture-modal"
    );
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <Wrap>
        <LeadCaptureModal
          isOpen
          onClose={onClose}
          onSuccess={onSuccess}
          scenarioId={scenarioId}
        />
      </Wrap>,
    );

    const user = userEvent.setup();
    await user.type(screen.getByTestId("input-lead-name"), "Priya Sharma");
    await user.type(screen.getByTestId("input-lead-email"), "priya@example.com");
    await user.type(screen.getByTestId("input-lead-phone"), "9876543210");
    await user.click(screen.getByTestId("checkbox-consent"));
    await user.click(screen.getByTestId("button-submit-lead"));
  }

  it("sends name, phone and email in the POST body", async () => {
    await renderAndSubmit();

    await waitFor(() => expect(mockCreateLeadMutate).toHaveBeenCalledOnce());

    const payload = capturedLeadPayload as { data: Record<string, unknown> };
    expect(payload.data.name).toBe("Priya Sharma");
    expect(payload.data.phone).toBe("9876543210");
    expect(payload.data.email).toBe("priya@example.com");
  });

  it("sends scenarioId when one is provided", async () => {
    await renderAndSubmit("scenario-abc-123");

    await waitFor(() => expect(mockCreateLeadMutate).toHaveBeenCalledOnce());

    const payload = capturedLeadPayload as { data: Record<string, unknown> };
    expect(payload.data.scenarioId).toBe("scenario-abc-123");
  });

  it("sends scenarioId as null when no scenarioId prop is passed", async () => {
    await renderAndSubmit(undefined);

    await waitFor(() => expect(mockCreateLeadMutate).toHaveBeenCalledOnce());

    const payload = capturedLeadPayload as { data: Record<string, unknown> };
    expect(payload.data.scenarioId).toBeNull();
  });

  it("does NOT forward the consent field to the server", async () => {
    await renderAndSubmit();

    await waitFor(() => expect(mockCreateLeadMutate).toHaveBeenCalledOnce());

    const payload = capturedLeadPayload as { data: Record<string, unknown> };
    expect("consent" in payload.data).toBe(false);
  });

  it("sends exactly the allowed keys (name, phone, email, scenarioId)", async () => {
    await renderAndSubmit("s-99");

    await waitFor(() => expect(mockCreateLeadMutate).toHaveBeenCalledOnce());

    const payload = capturedLeadPayload as { data: Record<string, unknown> };
    const sentKeys = Object.keys(payload.data).sort();
    expect(sentKeys).toEqual(["email", "name", "phone", "scenarioId"]);
  });
});

// ---------------------------------------------------------------------------
// Tests: profile menu (PUT /api/profile request shape)
// ---------------------------------------------------------------------------

describe("ProfileMenu — PUT /api/profile request shape", () => {
  /** Server-side allow-list for PUT /api/profile */
  const SERVER_ALLOWED_KEYS = new Set([
    "phone",
    "dob",
    "retirementAge",
    "monthlyIncome",
    "monthlyExpenses",
    "monthlySavings",
    "incomeGrowthRate",
    "currentAssets",
    "firstName",
    "lastName",
  ]);

  beforeEach(() => {
    capturedProfilePayload = undefined;
    mockUpdateProfileMutate.mockClear();
    mockToast.mockClear();
  });

  async function renderProfileMenuAndSave() {
    const { default: ProfileMenu } = await import(
      "@/components/profile-menu"
    );

    render(
      <Wrap>
        <ProfileMenu user={{ firstName: "Arjun", email: "arjun@test.com" }} />
      </Wrap>,
    );

    const user = userEvent.setup();

    // Open the dropdown
    await user.click(screen.getByRole("button", { name: /arjun/i }));

    // Click Edit Profile inside the dropdown
    await user.click(await screen.findByRole("button", { name: /edit profile/i }));

    // The dialog should now be open — save without changing any field
    await user.click(await screen.findByRole("button", { name: /save changes/i }));
  }

  it("calls the update mutation when Save Changes is clicked", async () => {
    await renderProfileMenuAndSave();

    await waitFor(() =>
      expect(mockUpdateProfileMutate).toHaveBeenCalledOnce(),
    );
  });

  it("sends only server-allowed field names in the PUT body", async () => {
    await renderProfileMenuAndSave();

    await waitFor(() => expect(mockUpdateProfileMutate).toHaveBeenCalledOnce());

    const payload = capturedProfilePayload as { data: Record<string, unknown> };
    const sentKeys = Object.keys(payload.data);

    for (const key of sentKeys) {
      expect(SERVER_ALLOWED_KEYS.has(key)).toBe(true);
    }
  });

  it("does not send unknown fields that would be silently ignored server-side", async () => {
    await renderProfileMenuAndSave();

    await waitFor(() => expect(mockUpdateProfileMutate).toHaveBeenCalledOnce());

    const payload = capturedProfilePayload as { data: Record<string, unknown> };
    // Fields that are NOT in the server allow-list and must NOT appear
    const forbidden = ["email", "id", "userId", "consent", "profileImageUrl", "role"];
    for (const key of forbidden) {
      expect(key in payload.data).toBe(false);
    }
  });

  it("sends firstName, not fullName or name", async () => {
    await renderProfileMenuAndSave();

    await waitFor(() => expect(mockUpdateProfileMutate).toHaveBeenCalledOnce());

    const payload = capturedProfilePayload as { data: Record<string, unknown> };
    // The server field is `firstName` — not `name` or `fullName`
    expect("firstName" in payload.data).toBe(true);
    expect("name" in payload.data).toBe(false);
    expect("fullName" in payload.data).toBe(false);
  });

  it("profile values from useGetProfile are pre-populated in the PUT body", async () => {
    await renderProfileMenuAndSave();

    await waitFor(() => expect(mockUpdateProfileMutate).toHaveBeenCalledOnce());

    const payload = capturedProfilePayload as { data: Record<string, unknown> };
    // Values come from the mocked useGetProfile response above
    expect(payload.data.phone).toBe("9876543210");
    expect(payload.data.monthlyIncome).toBe("80000");
    expect(payload.data.retirementAge).toBe(60);
  });
});
