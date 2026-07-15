import { describe, expect, it } from "vitest";
import { prisma } from "@/database/prisma";
import { createUser } from "@/test/helpers/factories";
import {
  DEFAULT_ROOM_COSMETICS,
  seedRoomCosmetics,
} from "./seed_room_cosmetics";

describe("seedRoomCosmetics", () => {
  it("is idempotent and preserves user room data", async () => {
    await seedRoomCosmetics();
    const user = await createUser();
    await prisma.userCosmetic.create({
      data: {
        userId: user.id,
        cosmeticAssetId: "blue-sofa",
      },
    });
    await prisma.userRoomLoadout.create({
      data: {
        userId: user.id,
        environmentId: "violet-brick",
        floorId: "plum-boards",
        placements: {
          create: {
            cosmeticAssetId: "blue-sofa",
            position: 8,
          },
        },
      },
    });

    await seedRoomCosmetics();

    await expect(prisma.cosmeticAsset.count()).resolves.toBe(
      DEFAULT_ROOM_COSMETICS.length,
    );
    await expect(prisma.userCosmetic.count()).resolves.toBe(1);
    await expect(prisma.userRoomLoadout.count()).resolves.toBe(1);
    await expect(prisma.roomCosmeticPlacement.count()).resolves.toBe(1);
  });
});
