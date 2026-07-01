import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { pixegotchiUiMachine } from "./pixegotchi.machine";

const startMachine = () => createActor(pixegotchiUiMachine).start();

describe("pixegotchiUiMachine", () => {
  it("starts in bootstrapping and enters idle when active data is synced", () => {
    const actor = startMachine();

    expect(actor.getSnapshot().matches("bootstrapping")).toBe(true);

    actor.send({ type: "DATA_SYNCED", status: "active" });

    expect(actor.getSnapshot().matches({ ready: "idle" })).toBe(true);

    actor.stop();
  });

  it("opens the action confirmation flow for active item usage", () => {
    const actor = startMachine();

    actor.send({ type: "DATA_SYNCED", status: "active" });
    actor.send({ type: "ACTION_REQUESTED", itemId: "apple" });

    expect(actor.getSnapshot().matches({ ready: "confirmingAction" })).toBe(
      true,
    );
    expect(actor.getSnapshot().context.selectedItemId).toBe("apple");

    actor.stop();
  });

  it("keeps normal item usage blocked when the pixegotchi is dead", () => {
    const actor = startMachine();

    actor.send({ type: "DATA_SYNCED", status: "dead" });
    actor.send({ type: "ACTION_REQUESTED", itemId: "apple" });

    expect(actor.getSnapshot().matches({ blocked: "dead" })).toBe(true);
    expect(actor.getSnapshot().context.selectedItemId).toBeNull();

    actor.stop();
  });

  it("allows explicitly permitted blocked item usage", () => {
    const actor = startMachine();

    actor.send({ type: "DATA_SYNCED", status: "dead" });
    actor.send({
      type: "ACTION_REQUESTED",
      itemId: "revive_stone",
      canUseWhileBlocked: true,
    });

    expect(actor.getSnapshot().matches({ ready: "confirmingAction" })).toBe(
      true,
    );
    expect(actor.getSnapshot().context.selectedItemId).toBe("revive_stone");

    actor.stop();
  });

  it.each([
    ["critical", { blocked: "critical" }],
    ["dead", { blocked: "dead" }],
    ["vault", { blocked: "vault" }],
  ] as const)("syncs %s status into the matching blocked state", (status, state) => {
    const actor = startMachine();

    actor.send({ type: "DATA_SYNCED", status });

    expect(actor.getSnapshot().matches(state)).toBe(true);

    actor.stop();
  });
});
