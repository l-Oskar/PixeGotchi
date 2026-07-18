// @vitest-environment jsdom

import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTelegramSwipes } from "./useTelegramSwipes";

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(window, "Telegram");
});

describe("useTelegramSwipes", () => {
  it("restores vertical swipes when unmounted while disabled", () => {
    const disableVerticalSwipes = vi.fn();
    const enableVerticalSwipes = vi.fn();

    Object.defineProperty(window, "Telegram", {
      configurable: true,
      value: {
        WebApp: {
          disableVerticalSwipes,
          enableVerticalSwipes,
          isReady: true,
        },
      },
    });

    const { unmount } = renderHook(() => useTelegramSwipes(true));

    expect(disableVerticalSwipes).toHaveBeenCalledOnce();
    expect(enableVerticalSwipes).not.toHaveBeenCalled();

    unmount();

    expect(enableVerticalSwipes).toHaveBeenCalledOnce();
  });
});
