// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListingType } from "@pixegotchi/shared";
import { afterEach, describe, expect, it, vi } from "vitest";
import MarketplacePage from "./MarketplacePage";

const marketplaceTestState = vi.hoisted(() => ({
  activeListingCount: 0,
  showError: vi.fn(),
}));

vi.mock("@/services/queries/marketplace.queries", () => ({
  useMarketplaceConfig: () => ({
    data: {
      commissionBps: 500,
      listingDurationDays: 7,
      maxActiveListings: 10,
      minUnitPrice: "1",
      maxUnitPrice: "1000000000",
      enabledCurrencies: ["pgc"],
    },
  }),
  useMarketplaceListings: (
    _listingType?: ListingType,
    mine = false,
  ) => ({
    data: {
      listings: mine
        ? Array.from(
            { length: marketplaceTestState.activeListingCount },
            (_, index) => ({
              id: 100 + index,
              source: "player",
              seller: { id: 1, username: "owner" },
              listingType: "egg",
              initialQuantity: 1,
              remainingQuantity: 1,
              unitPrice: "100",
              currency: "pgc",
              status: "active",
              createdAt: "2026-07-17T10:00:00.000Z",
              expiresAt: "2026-07-24T10:00:00.000Z",
              closedAt: null,
              asset: {
                id: 100 + index,
                createdAt: "2026-07-17T09:00:00.000Z",
              },
            }),
          )
        : [
            {
              id: 7,
              source: "player",
              seller: { id: 42, username: "seller" },
              listingType: "egg",
              initialQuantity: 1,
              remainingQuantity: 1,
              unitPrice: "120",
              currency: "pgc",
              status: "active",
              createdAt: "2026-07-17T10:00:00.000Z",
              expiresAt: "2026-07-24T10:00:00.000Z",
              closedAt: null,
              asset: {
                id: 55,
                createdAt: "2026-07-17T09:00:00.000Z",
              },
            },
          ],
    },
    isLoading: false,
    isError: false,
  }),
  useMarketplaceSellable: () => ({
    data: {
      assets: [
        {
          listingType: "egg",
          maxQuantity: 1,
          asset: {
            id: 55,
            createdAt: "2026-07-17T09:00:00.000Z",
          },
        },
      ],
      activeListingCount: 0,
      maxActiveListings: 10,
    },
    isLoading: false,
    isError: false,
  }),
  useCreateMarketplaceListing: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useBuyMarketplaceListing: () => ({
    mutate: vi.fn(),
    isPending: false,
    variables: undefined,
  }),
  useCancelMarketplaceListing: () => ({
    mutate: vi.fn(),
    isPending: false,
    variables: undefined,
  }),
}));

vi.mock("@/services/queries/egg.queries", () => ({
  useCreateEgg: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/services/queries/room-cosmetics.queries", () => ({
  useRoomCosmeticsShop: () => ({
    data: { offers: [] },
    isLoading: false,
    isError: false,
  }),
  usePurchaseRoomCosmetic: () => ({
    mutate: vi.fn(),
    isPending: false,
    variables: undefined,
  }),
}));

vi.mock("@/hooks/useConfirmationModal", () => ({
  useConfirmationModal: () => ({
    confirm: vi.fn().mockResolvedValue(true),
  }),
}));

vi.mock("@/hooks/useFeedbackModal", () => ({
  useFeedbackModal: () => ({
    showSuccess: vi.fn(),
    showError: marketplaceTestState.showError,
    showApiError: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  marketplaceTestState.activeListingCount = 0;
  marketplaceTestState.showError.mockClear();
});

describe("MarketplacePage modal flows", () => {
  it("shows offers as list rows and opens purchase details", async () => {
    const user = userEvent.setup();
    render(<MarketplacePage />);

    expect(
      screen.getByRole("button", { name: /^buy$/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /^sell$/i }),
    ).toBeTruthy();
    const categoryButtons = screen.getAllByRole("button").filter((button) =>
      ["Test", "Eggs", "Items", "Chests", "Room", "Pixegotchis"].includes(
        button.textContent ?? "",
      ),
    );
    expect(categoryButtons[0]?.textContent).toBe("Test");
    expect(screen.getByRole("button", { name: "Eggs" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Items" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Chests" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Room" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Pixegotchis" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Test" })).toBeTruthy();
    expect(screen.getByText("official")).toBeTruthy();
    expect(screen.getByText("player")).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: /Element Egg #55/ }),
    );

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Unhatched egg")).toBeTruthy();
    expect(within(dialog).getByText("seller")).toBeTruthy();
    expect(within(dialog).getByRole("button", { name: "BUY" })).toBeTruthy();
  });

  it("opens one add-listing modal with category and asset steps", async () => {
    const user = userEvent.setup();
    render(<MarketplacePage />);

    await user.click(
      screen.getByRole("button", { name: /^sell$/i }),
    );

    expect(screen.getByText("My active listings")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "ADD LISTING" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Items" }),
    ).toBeNull();

    await user.click(screen.getByRole("button", { name: "ADD LISTING" }));

    expect(screen.getByRole("dialog")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Eggs" }));
    await user.click(
      screen.getByRole("button", { name: /Element Egg #55/ }),
    );

    expect(screen.getByText("PRICE FOR 1 (PGC)")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "CREATE LISTING" }),
    ).toBeTruthy();
  });

  it("shows a feedback modal instead of sell flow at the listing limit", async () => {
    marketplaceTestState.activeListingCount = 10;
    const user = userEvent.setup();
    render(<MarketplacePage />);

    await user.click(
      screen.getByRole("button", { name: /^sell$/i }),
    );
    await user.click(screen.getByRole("button", { name: "ADD LISTING" }));

    expect(marketplaceTestState.showError).toHaveBeenCalledWith({
      title: "Listing limit reached",
      message:
        "You already have the maximum of 10 active listings. Cancel one before adding another.",
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
