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
