// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ElementType,
  Item,
  ItemType,
  Pixegotchi,
  PixegotchiGender,
  PixegotchiStatus,
  RarityType,
} from "@pixegotchi/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePixegotchiStore } from "@/store/pixegotchi.store";
import ItemModal from "./ItemModal";

const item: Item = {
  itemId: "test-apple",
  name: "Test Apple",
  description: "Restores hunger",
  itemType: ItemType.food,
  rarity: RarityType.common,
  effects: {
    health: 0,
    hunger: 10,
    energy: 0,
    happiness: 0,
    cleanliness: 0,
    buffs: [],
  },
  cooldownMinutes: 0,
  maxPerDay: null,
  minLevel: 1,
  iconUrl: "🍎",
  isStackable: true,
  maxStack: 99,
  isTradable: false,
};

const currentPixegotchi: Pixegotchi = {
  id: 1,
  userId: 1,
  eggId: 1,
  nftAddress: null,
  genomeHash: "test-genome",
  element: ElementType.fire,
  rarity: RarityType.common,
  gender: PixegotchiGender.male,
  traits: [],
  name: "Testgo",
  status: PixegotchiStatus.active,
  level: 1,
  experience: 0,
  health: 100,
  hunger: 50,
  energy: 100,
  happiness: 100,
  cleanliness: 100,
  healthZeroAt: null,
  criticalSince: null,
  lastFedAt: null,
  lastPlayedAt: null,
  lastSleptAt: null,
  lastCleanedAt: null,
  lastHealedAt: null,
  lastBoostedAt: null,
  lastUpdateAt: null,
  hatchedAt: null,
};

beforeEach(() => {
  usePixegotchiStore.setState({ currentPixegotchi });
});

afterEach(() => {
  cleanup();
  usePixegotchiStore.setState({ currentPixegotchi: null });
  vi.restoreAllMocks();
});

describe("ItemModal action flow", () => {
  it(
    "uses the selected quantity and closes after success",
    async () => {
      const user = userEvent.setup();
      const onUse = vi.fn().mockResolvedValue(undefined);
      const onClose = vi.fn();

      render(
        <ItemModal
          item={item}
          quantity={3}
          isOpen
          canUseItem
          onClose={onClose}
          onUse={onUse}
        />,
      );

      await user.click(screen.getByRole("button", { name: "+" }));
      await user.click(screen.getByRole("button", { name: "Use item" }));

      await waitFor(() => {
        expect(onUse).toHaveBeenCalledWith(item.itemId, 2);
        expect(onClose).toHaveBeenCalledOnce();
      });
    },
    10_000,
  );

  it("keeps the modal open when item usage fails", async () => {
    const user = userEvent.setup();
    const error = new Error("Use failed");
    const onUse = vi.fn().mockRejectedValue(error);
    const onClose = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <ItemModal
        item={item}
        quantity={1}
        isOpen
        canUseItem
        onClose={onClose}
        onUse={onUse}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Use item" }));

    await waitFor(() => {
      expect(onUse).toHaveBeenCalledWith(item.itemId, 1);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to use item:",
        error,
      );
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(
      (screen.getByRole("button", { name: "Use item" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });

  it("shows the blocked reason and prevents item usage", async () => {
    const user = userEvent.setup();
    const onUse = vi.fn().mockResolvedValue(undefined);

    render(
      <ItemModal
        item={item}
        quantity={1}
        isOpen
        canUseItem={false}
        disabledReason="Only revive items can be used."
        onClose={vi.fn()}
        onUse={onUse}
      />,
    );

    expect(screen.getByText("Only revive items can be used.")).toBeTruthy();
    const useButton = screen.getByRole("button", { name: "Use item" });
    expect((useButton as HTMLButtonElement).disabled).toBe(true);

    await user.click(useButton);

    expect(onUse).not.toHaveBeenCalled();
  });
});
