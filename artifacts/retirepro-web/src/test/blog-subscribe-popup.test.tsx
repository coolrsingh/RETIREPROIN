import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import BlogSubscribePopup from "@/components/blog-subscribe-popup";

describe("BlogSubscribePopup – exit intent", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("opens when a desktop pointer leaves through the top browser edge", () => {
    render(<BlogSubscribePopup />);

    fireEvent.mouseOut(document, { relatedTarget: null, clientY: 0 });

    expect(
      screen.getByRole("heading", { name: /before you go—keep your retirement plan on track/i }),
    ).toBeInTheDocument();
  });

  it("does not reopen again during the same browser session after dismissal", () => {
    const { unmount } = render(<BlogSubscribePopup />);

    fireEvent.mouseOut(document, { relatedTarget: null, clientY: 0 });
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    unmount();

    render(<BlogSubscribePopup />);
    fireEvent.mouseOut(document, { relatedTarget: null, clientY: 0 });

    expect(
      screen.queryByRole("heading", { name: /before you go—keep your retirement plan on track/i }),
    ).not.toBeInTheDocument();
  });
});