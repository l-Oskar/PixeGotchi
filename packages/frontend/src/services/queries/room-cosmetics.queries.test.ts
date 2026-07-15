import { describe, expect, it } from "vitest";
import type { RoomLoadout, UserRoomLoadoutResponse } from "@pixegotchi/shared";
import { QueryClient } from "@tanstack/react-query";
import {
  ROOM_COSMETICS_KEYS,
  updateRoomCosmeticsLoadoutCache,
} from "./room-cosmetics.queries";

describe("room cosmetics query cache", () => {
  it("replaces the current room loadout after a successful save", () => {
    const queryClient = new QueryClient();
    const loadout: RoomLoadout = {
      userId: 1,
      environmentId: "warm-plaster",
      floorId: "honey-boards",
      placements: [
        { cosmeticAssetId: "arched-window-day", position: 6 },
        { cosmeticAssetId: "pink-window-curtains", position: 7 },
      ],
      updatedAt: "2026-07-15T00:00:00.000Z",
    };

    updateRoomCosmeticsLoadoutCache(queryClient, loadout);

    expect(
      queryClient.getQueryData<UserRoomLoadoutResponse>(
        ROOM_COSMETICS_KEYS.loadout,
      ),
    ).toEqual({ loadout });
  });
});
