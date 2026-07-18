// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ModalShell from "./ModalShell";

afterEach(cleanup);

describe("ModalShell focus", () => {
  it("keeps input focus when a parent render provides a new onClose callback", () => {
    const { rerender } = render(
      <ModalShell isOpen onClose={() => undefined} title="Sell item">
        <input aria-label="Price" />
      </ModalShell>,
    );
    const input = screen.getByRole("textbox", { name: "Price" });
    input.focus();

    rerender(
      <ModalShell isOpen onClose={vi.fn()} title="Sell item">
        <input aria-label="Price" value="1" readOnly />
      </ModalShell>,
    );

    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "Price" }),
    );
  });
});

describe("ModalShell body scroll lock", () => {
  it("keeps the body locked until the last overlapping modal closes", () => {
    document.body.style.overflow = "scroll";

    const Modals = ({
      firstOpen,
      secondOpen,
    }: {
      firstOpen: boolean;
      secondOpen: boolean;
    }) => (
      <>
        <ModalShell
          isOpen={firstOpen}
          onClose={() => undefined}
          title="First modal">
          First
        </ModalShell>
        <ModalShell
          isOpen={secondOpen}
          onClose={() => undefined}
          title="Second modal">
          Second
        </ModalShell>
      </>
    );

    const { rerender } = render(<Modals firstOpen secondOpen />);

    expect(document.body.style.overflow).toBe("hidden");

    rerender(<Modals firstOpen={false} secondOpen />);

    expect(document.body.style.overflow).toBe("hidden");

    rerender(<Modals firstOpen={false} secondOpen={false} />);

    expect(document.body.style.overflow).toBe("scroll");
  });
});
