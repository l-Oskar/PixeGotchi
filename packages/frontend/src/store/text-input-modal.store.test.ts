import { beforeEach, describe, expect, it } from "vitest";
import { useTextInputModalStore } from "./text-input-modal.store";

const resetStore = () => {
  useTextInputModalStore.getState().resolveInput(null);
  useTextInputModalStore.setState({ inputRequest: null });
};

describe("text input modal store", () => {
  beforeEach(resetStore);

  it("resolves submitted text", async () => {
    const result = useTextInputModalStore.getState().requestInput({
      title: "Name your Pixegotchi",
    });

    useTextInputModalStore.getState().resolveInput("Pixel");

    await expect(result).resolves.toBe("Pixel");
  });

  it("allows an empty submitted value", async () => {
    const result = useTextInputModalStore.getState().requestInput({
      title: "Name your Pixegotchi",
    });

    useTextInputModalStore.getState().resolveInput("");

    await expect(result).resolves.toBe("");
  });

  it("resolves null when cancelled", async () => {
    const result = useTextInputModalStore.getState().requestInput({
      title: "Name your Pixegotchi",
    });

    useTextInputModalStore.getState().resolveInput(null);

    await expect(result).resolves.toBeNull();
  });

  it("cancels the previous request when replaced", async () => {
    const firstResult = useTextInputModalStore.getState().requestInput({
      title: "First request",
    });
    const secondResult = useTextInputModalStore.getState().requestInput({
      title: "Second request",
    });

    await expect(firstResult).resolves.toBeNull();
    expect(useTextInputModalStore.getState().inputRequest).toMatchObject({
      title: "Second request",
    });

    useTextInputModalStore.getState().resolveInput("Done");
    await expect(secondResult).resolves.toBe("Done");
  });
});
