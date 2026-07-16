import { beforeEach, describe, expect, it } from "vitest";
import { useConfirmationModalStore } from "./confirmation-modal.store";

const resetStore = () => {
  useConfirmationModalStore.getState().resolveConfirmation(false);
  useConfirmationModalStore.setState({ confirmation: null });
};

describe("confirmation modal store", () => {
  beforeEach(resetStore);

  it("resolves true when the action is confirmed", async () => {
    const result = useConfirmationModalStore
      .getState()
      .requestConfirmation({
        title: "Send to Vault?",
        message: "The pet will become inactive.",
      });

    expect(useConfirmationModalStore.getState().confirmation).toMatchObject({
      title: "Send to Vault?",
    });

    useConfirmationModalStore.getState().resolveConfirmation(true);

    await expect(result).resolves.toBe(true);
    expect(useConfirmationModalStore.getState().confirmation).toBeNull();
  });

  it("resolves false when the action is cancelled", async () => {
    const result = useConfirmationModalStore
      .getState()
      .requestConfirmation({
        title: "Confirm action",
        message: "Continue?",
      });

    useConfirmationModalStore.getState().resolveConfirmation(false);

    await expect(result).resolves.toBe(false);
  });

  it("cancels the previous request when a new one replaces it", async () => {
    const firstResult = useConfirmationModalStore
      .getState()
      .requestConfirmation({
        title: "First action",
        message: "First message",
      });
    const secondResult = useConfirmationModalStore
      .getState()
      .requestConfirmation({
        title: "Second action",
        message: "Second message",
      });

    await expect(firstResult).resolves.toBe(false);
    expect(useConfirmationModalStore.getState().confirmation).toMatchObject({
      title: "Second action",
    });

    useConfirmationModalStore.getState().resolveConfirmation(true);
    await expect(secondResult).resolves.toBe(true);
  });
});
