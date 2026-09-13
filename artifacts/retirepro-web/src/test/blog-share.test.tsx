import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { trackEvent } = vi.hoisted(() => ({
  trackEvent: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent,
}));

import BlogShare from "@/components/blog-share";

const article = {
  title: "Tax planning & early retirement",
  slug: "tax-planning-2026",
};
const articleUrl = `https://retirepro.in/blog/${article.slug}`;

function renderShare() {
  return render(<BlogShare {...article} />);
}

describe("BlogShare", () => {
  beforeEach(() => {
    trackEvent.mockClear();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
  });

  it("uses the current article slug in every share destination", () => {
    renderShare();

    expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveAttribute(
      "href",
      `https://wa.me/?text=${encodeURIComponent(article.title)}%20${encodeURIComponent(articleUrl)}`,
    );
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`,
    );
    expect(screen.getByRole("link", { name: "X" })).toHaveAttribute(
      "href",
      `https://x.com/intent/post?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(articleUrl)}`,
    );
  });

  it("records only the channel, blog source, and article identifier", async () => {
    renderShare();

    fireEvent.click(screen.getByRole("link", { name: "WhatsApp" }));
    fireEvent.click(screen.getByRole("link", { name: "LinkedIn" }));
    fireEvent.click(screen.getByRole("link", { name: "X" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));

    await waitFor(() => expect(trackEvent).toHaveBeenCalledTimes(4));

    expect(trackEvent).toHaveBeenNthCalledWith(1, "share_clicked", {
      channel: "whatsapp",
      source: "blog",
      article: article.slug,
    });
    expect(trackEvent).toHaveBeenNthCalledWith(2, "share_clicked", {
      channel: "linkedin",
      source: "blog",
      article: article.slug,
    });
    expect(trackEvent).toHaveBeenNthCalledWith(3, "share_clicked", {
      channel: "x",
      source: "blog",
      article: article.slug,
    });
    expect(trackEvent).toHaveBeenNthCalledWith(4, "share_clicked", {
      channel: "copy_link",
      source: "blog",
      article: article.slug,
    });
  });

  it("copies the current article URL", async () => {
    renderShare();

    const writeText = navigator.clipboard!.writeText as ReturnType<typeof vi.fn>;
    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(articleUrl));
    expect(screen.getByRole("button", { name: "Copied!" })).toBeInTheDocument();
  });

  it("keeps the link-sharing controls available when native sharing is unavailable", () => {
    renderShare();

    expect(screen.queryByRole("button", { name: "Share" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "WhatsApp" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "LinkedIn" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "X" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy link" })).toBeInTheDocument();
  });
});