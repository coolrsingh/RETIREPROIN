import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdvisorSection from "./advisor-section";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockReset();
});

describe("AdvisorSection — phone validation", () => {
  it("blocks submission and shows error when phone is empty", async () => {
    render(<AdvisorSection />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId("button-advisor-submit"));

    expect(
      screen.getByText("Enter a valid 10-digit mobile number"),
    ).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("blocks submission and shows error when phone has fewer than 10 digits", async () => {
    render(<AdvisorSection />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId("input-advisor-phone"), "98765");
    await user.click(screen.getByTestId("button-advisor-submit"));

    expect(
      screen.getByText("Enter a valid 10-digit mobile number"),
    ).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("clears the phone error when the user starts typing again", async () => {
    render(<AdvisorSection />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId("button-advisor-submit"));
    expect(
      screen.getByText("Enter a valid 10-digit mobile number"),
    ).toBeInTheDocument();

    await user.type(screen.getByTestId("input-advisor-phone"), "9");
    expect(
      screen.queryByText("Enter a valid 10-digit mobile number"),
    ).not.toBeInTheDocument();
  });
});

describe("AdvisorSection — valid submission", () => {
  it("calls POST /api/lead with phone and name on a valid submission", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    render(<AdvisorSection defaultName="Test User" />);
    const user = userEvent.setup();

    await user.type(
      screen.getByTestId("input-advisor-phone"),
      "9876543210",
    );
    await user.click(screen.getByTestId("button-advisor-submit"));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/lead");
    expect(options.method).toBe("POST");

    const body = JSON.parse(options.body as string) as Record<string, string>;
    expect(body.phone).toBeTruthy();
    expect(body.name).toBe("Test User");
  });

  it("renders the success state after a 200 response", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    render(<AdvisorSection />);
    const user = userEvent.setup();

    await user.type(
      screen.getByTestId("input-advisor-phone"),
      "9876543210",
    );
    await user.click(screen.getByTestId("button-advisor-submit"));

    await waitFor(() =>
      expect(screen.getByText("You're on the list!")).toBeInTheDocument(),
    );
  });

  it("renders the error state after a non-200 response", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    render(<AdvisorSection />);
    const user = userEvent.setup();

    await user.type(
      screen.getByTestId("input-advisor-phone"),
      "9876543210",
    );
    await user.click(screen.getByTestId("button-advisor-submit"));

    await waitFor(() =>
      expect(
        screen.getByText(/Something went wrong/i),
      ).toBeInTheDocument(),
    );
  });

  it("renders the error state when fetch throws a network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    render(<AdvisorSection />);
    const user = userEvent.setup();

    await user.type(
      screen.getByTestId("input-advisor-phone"),
      "9876543210",
    );
    await user.click(screen.getByTestId("button-advisor-submit"));

    await waitFor(() =>
      expect(
        screen.getByText(/Something went wrong/i),
      ).toBeInTheDocument(),
    );
  });
});

describe("AdvisorSection — Submit another button", () => {
  it("returns to the form and hides the success message when Submit another is clicked", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    render(<AdvisorSection />);
    const user = userEvent.setup();

    // Submit successfully
    await user.type(screen.getByTestId("input-advisor-phone"), "9876543210");
    await user.click(screen.getByTestId("button-advisor-submit"));

    // Wait for success screen
    await waitFor(() =>
      expect(screen.getByText("You're on the list!")).toBeInTheDocument(),
    );

    // Click "Submit another"
    await user.click(screen.getByRole("button", { name: /submit another/i }));

    // Success message should be gone
    await waitFor(() =>
      expect(screen.queryByText("You're on the list!")).not.toBeInTheDocument(),
    );

    // Form inputs should be visible again
    expect(screen.getByTestId("input-advisor-phone")).toBeInTheDocument();
    expect(screen.getByTestId("input-advisor-name")).toBeInTheDocument();
    expect(screen.getByTestId("input-advisor-email")).toBeInTheDocument();
    expect(screen.getByTestId("button-advisor-submit")).toBeInTheDocument();
  });
});

describe("AdvisorSection — duplicate submission prevention", () => {
  it("disables the submit button and shows 'Sending…' while a fetch is in flight, and calls fetch only once", async () => {
    // A fetch that never resolves so we can inspect mid-flight state
    let resolveFetch!: () => void;
    const inflight = new Promise<{ ok: boolean }>(resolve => {
      resolveFetch = () => resolve({ ok: true });
    });
    mockFetch.mockReturnValueOnce(inflight);

    render(<AdvisorSection defaultName="Test User" />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId("input-advisor-phone"), "9876543210");

    // Click submit — fetch is now pending
    await user.click(screen.getByTestId("button-advisor-submit"));

    // Button must be disabled mid-flight
    const submitButton = screen.getByTestId("button-advisor-submit");
    expect(submitButton).toBeDisabled();

    // Button must show the spinner label
    expect(submitButton).toHaveTextContent("Sending…");

    // Fetch called exactly once — no duplicate
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Attempting a second click while disabled must not trigger another fetch
    await user.click(submitButton);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Let the fetch settle so the component doesn't leave dangling state
    resolveFetch();
    await waitFor(() =>
      expect(screen.getByText("You're on the list!")).toBeInTheDocument(),
    );
  });
});

describe("AdvisorSection — optional email field", () => {
  it("includes email in the POST body when the user fills it in", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    render(<AdvisorSection defaultName="Test User" />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId("input-advisor-phone"), "9876543210");
    await user.type(screen.getByTestId("input-advisor-email"), "test@example.com");
    await user.click(screen.getByTestId("button-advisor-submit"));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string) as Record<string, string>;
    expect(body.email).toBe("test@example.com");
  });

  it("omits email from the POST body when the user leaves it blank", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    render(<AdvisorSection defaultName="Test User" />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId("input-advisor-phone"), "9876543210");
    // email field intentionally left empty
    await user.click(screen.getByTestId("button-advisor-submit"));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string) as Record<string, string>;
    expect(body.email).toBeUndefined();
  });
});
