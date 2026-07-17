// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListingType } from "@pixegotchi/shared";
import { afterEach, describe, expect, it, vi } from "vitest";
import MarketplacePage from "./MarketplacePage";

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
        ? []
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
      assets: [],
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
    showApiError: vi.fn(),
  }),
}));

afterEach(cleanup);

describe("MarketplacePage navigation", () => {
  it("shows Buy/Sell categories and Official/Player badges", async () => {
    const user = userEvent.setup();
    render(<MarketplacePage />);

    expect(screen.getByRole("button", { name: "Buy" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sell" })).toBeTruthy();
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

    await user.click(screen.getByRole("button", { name: "Sell" }));

    expect(screen.getByText("Choose asset")).toBeTruthy();
    expect(screen.getByText("My active listings")).toBeTruthy();
  });
});
