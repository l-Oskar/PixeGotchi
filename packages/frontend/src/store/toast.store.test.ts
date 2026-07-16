import { beforeEach, describe, expect, it } from "vitest";
import { useToastStore } from "./toast.store";

const resetStore = () => {
  useToastStore.setState({ toasts: [] });
};

describe("toast store", () => {
  beforeEach(resetStore);

  it("adds and dismisses a toast", () => {
    const id = useToastStore.getState().addToast({
      variant: "success",
      message: "Saved successfully.",
    });

    expect(useToastStore.getState().toasts).toEqual([
      {
        id,
        variant: "success",
        message: "Saved successfully.",
      },
    ]);

    useToastStore.getState().dismissToast(id);
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it("keeps only the three newest toasts", () => {
    for (let index = 1; index <= 4; index += 1) {
      useToastStore.getState().addToast({
        variant: "info",
        message: `Message ${index}`,
      });
    }

    expect(
      useToastStore.getState().toasts.map((toast) => toast.message),
    ).toEqual(["Message 2", "Message 3", "Message 4"]);
  });
});
