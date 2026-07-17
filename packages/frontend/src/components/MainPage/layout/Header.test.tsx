// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Header from "./Header";

vi.mock("@tma.js/sdk-react", () => ({
  useSignal: () => 0,
}));

vi.mock("@tma.js/sdk", () => ({
  viewport: {
    safeAreaInsetTop: {},
    contentSafeAreaInsetTop: {},
  },
}));

vi.mock("@/helpers/publicUrl", () => ({
  publicUrl: (path: string) => path,
}));

vi.mock("../../Dropdown/HeaderDropdown", () => ({
  default: () => <div>Menu</div>,
}));

vi.mock("@/services/queries/users.queries", () => ({
  useUserProfile: () => ({
    data: {
      id: 1,
      username: "TanStackUser",
      pgcBalance: "1234.75",
    },
  }),
  useUpdateUserPgc: () => ({
    mutateAsync: vi.fn(),
  }),
}));

afterEach(cleanup);

describe("Header profile data", () => {
  it("renders username and PGC balance from the profile query", () => {
    render(<Header />);

    expect(screen.getByText("TanStackUser")).toBeTruthy();
    expect(screen.getByText("1234")).toBeTruthy();
  });
});
