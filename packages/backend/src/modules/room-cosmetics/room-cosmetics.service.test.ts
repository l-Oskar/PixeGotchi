import { beforeEach, describe, expect, it } from "vitest";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/database/prisma";
import { createUser } from "@/test/helpers/factories";
import { RoomCosmeticsService } from "./room-cosmetics.service";

let assetSequence = 0;

const createAsset = (
  overrides: Partial<Prisma.CosmeticAssetUncheckedCreateInput> = {},
) => {
  assetSequence += 1;

  return prisma.cosmeticAsset.create({
    data: {
      id: `room-test-asset-${assetSequence}`,
      name: `Room test asset ${assetSequence}`,
      slot: "decor",
      rarity: "common",
      assetUrl: `assets/room/test-${assetSequence}.png`,
      environmentId: null,
      allowedPositions: [10],
      span: 1,
      allowOverlap: false,
      isDefault: true,
      isLimited: false,
      isTradable: false,
      isActive: true,
      ...overrides,
    },
  });
};

const createDefaultSurfaces = async () => {
  await createAsset({
    id: "violet-brick",
    name: "Violet brick",
    slot: "environment",
    assetUrl: null,
    allowedPositions: [],
  });
  await createAsset({
    id: "plum-boards",
    name: "Plum boards",
    slot: "floor",
    assetUrl: null,
    allowedPositions: [],
  });
};

describe("RoomCosmeticsService", () => {
  beforeEach(() => {
    assetSequence = 0;
  });

  it("rejects a non-default cosmetic that the user does not own", async () => {
    const user = await createUser();
    await createDefaultSurfaces();
    const asset = await createAsset({ isDefault: false });
    const service = new RoomCosmeticsService();

    await expect(
      service.equip(user.id, {
        cosmeticAssetId: asset.id,
        position: 10,
      }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("returns only active default and user-owned assets for editor inventory", async () => {
    const user = await createUser();
    const defaultAsset = await createAsset({ isDefault: true });
    const ownedAsset = await createAsset({ isDefault: false });
    const lockedAsset = await createAsset({ isDefault: false });
    const inactiveDefaultAsset = await createAsset({
      isDefault: true,
      isActive: false,
    });
    await prisma.userCosmetic.create({
      data: {
        userId: user.id,
        cosmeticAssetId: ownedAsset.id,
      },
    });
    const service = new RoomCosmeticsService();

    const result = await service.getEditorInventory(user.id);
    const assetIds = result.assets.map(({ id }) => id);

    expect(assetIds).toContain(defaultAsset.id);
    expect(assetIds).toContain(ownedAsset.id);
    expect(assetIds).not.toContain(lockedAsset.id);
    expect(assetIds).not.toContain(inactiveDefaultAsset.id);
  });

  it("creates the default server loadout when a user opens room data", async () => {
    const user = await createUser();
    await createDefaultSurfaces();
    const service = new RoomCosmeticsService();

    const result = await service.getOrCreateCurrentLoadout(user.id);

    expect(result.loadout).toMatchObject({
      userId: user.id,
      environmentId: "violet-brick",
      floorId: "plum-boards",
      placements: [],
    });
    await expect(
      prisma.userRoomLoadout.count({ where: { userId: user.id } }),
    ).resolves.toBe(1);
  });

  it("rejects a position outside the cosmetic allowlist", async () => {
    const user = await createUser();
    await createDefaultSurfaces();
    const asset = await createAsset({ allowedPositions: [10] });
    const service = new RoomCosmeticsService();

    await expect(
      service.equip(user.id, {
        cosmeticAssetId: asset.id,
        position: 11,
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("rejects two non-overlapping cosmetics in the same position", async () => {
    const user = await createUser();
    await createDefaultSurfaces();
    const firstAsset = await createAsset({ allowedPositions: [10] });
    const secondAsset = await createAsset({ allowedPositions: [10] });
    const service = new RoomCosmeticsService();

    await service.equip(user.id, {
      cosmeticAssetId: firstAsset.id,
      position: 10,
    });

    await expect(
      service.equip(user.id, {
        cosmeticAssetId: secondAsset.id,
        position: 10,
      }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("equips window and curtains in their independent positions", async () => {
    const user = await createUser();
    await createDefaultSurfaces();
    const windowAsset = await createAsset({
      slot: "window",
      allowedPositions: [6],
    });
    const curtainsAsset = await createAsset({
      slot: "curtain",
      allowedPositions: [7],
    });
    const service = new RoomCosmeticsService();

    await service.equip(user.id, {
      cosmeticAssetId: windowAsset.id,
      position: 6,
    });
    const result = await service.equip(user.id, {
      cosmeticAssetId: curtainsAsset.id,
      position: 7,
    });

    expect(result.loadout.placements).toEqual([
      { cosmeticAssetId: windowAsset.id, position: 6 },
      { cosmeticAssetId: curtainsAsset.id, position: 7 },
    ]);
  });

  it("serializes concurrent equips so only one asset occupies a position", async () => {
    const user = await createUser();
    await createDefaultSurfaces();
    const firstAsset = await createAsset({ allowedPositions: [10] });
    const secondAsset = await createAsset({ allowedPositions: [10] });
    const service = new RoomCosmeticsService();

    const results = await Promise.allSettled([
      service.equip(user.id, {
        cosmeticAssetId: firstAsset.id,
        position: 10,
      }),
      service.equip(user.id, {
        cosmeticAssetId: secondAsset.id,
        position: 10,
      }),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(
      1,
    );
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(
      1,
    );
    await expect(prisma.roomCosmeticPlacement.count()).resolves.toBe(1);
  });

  it("unequips only the requested positioned cosmetic", async () => {
    const user = await createUser();
    await createDefaultSurfaces();
    const asset = await createAsset({ allowedPositions: [10] });
    const service = new RoomCosmeticsService();

    await service.equip(user.id, {
      cosmeticAssetId: asset.id,
      position: 10,
    });
    const result = await service.unequip(user.id, {
      cosmeticAssetId: asset.id,
      position: 10,
    });

    expect(result.loadout.placements).toEqual([]);
  });

  it("atomically saves a complete room loadout", async () => {
    const user = await createUser();
    await createDefaultSurfaces();
    const windowAsset = await createAsset({
      slot: "window",
      allowedPositions: [6],
    });
    const curtainsAsset = await createAsset({
      slot: "curtain",
      allowedPositions: [7],
    });
    const service = new RoomCosmeticsService();

    const result = await service.saveLoadout(user.id, {
      environmentId: "violet-brick",
      floorId: "plum-boards",
      placements: [
        { cosmeticAssetId: windowAsset.id, position: 6 },
        { cosmeticAssetId: curtainsAsset.id, position: 7 },
      ],
    });

    expect(result.loadout.environmentId).toBe("violet-brick");
    expect(result.loadout.floorId).toBe("plum-boards");
    expect(result.loadout.placements).toEqual([
      { cosmeticAssetId: windowAsset.id, position: 6 },
      { cosmeticAssetId: curtainsAsset.id, position: 7 },
    ]);
  });

  it("keeps the previous loadout when complete save validation fails", async () => {
    const user = await createUser();
    await createDefaultSurfaces();
    const equippedAsset = await createAsset({ allowedPositions: [10] });
    const unownedAsset = await createAsset({
      allowedPositions: [11],
      isDefault: false,
    });
    const service = new RoomCosmeticsService();

    await service.saveLoadout(user.id, {
      environmentId: "violet-brick",
      floorId: "plum-boards",
      placements: [
        { cosmeticAssetId: equippedAsset.id, position: 10 },
      ],
    });

    await expect(
      service.saveLoadout(user.id, {
        environmentId: "violet-brick",
        floorId: "plum-boards",
        placements: [
          { cosmeticAssetId: unownedAsset.id, position: 11 },
        ],
      }),
    ).rejects.toMatchObject({ statusCode: 403 });

    await expect(service.getCurrentLoadout(user.id)).resolves.toMatchObject({
      loadout: {
        placements: [
          { cosmeticAssetId: equippedAsset.id, position: 10 },
        ],
      },
    });
  });

  it("rejects conflicting placements in a complete loadout", async () => {
    const user = await createUser();
    await createDefaultSurfaces();
    const firstAsset = await createAsset({ allowedPositions: [10] });
    const secondAsset = await createAsset({ allowedPositions: [10] });
    const service = new RoomCosmeticsService();

    await expect(
      service.saveLoadout(user.id, {
        environmentId: "violet-brick",
        floorId: "plum-boards",
        placements: [
          { cosmeticAssetId: firstAsset.id, position: 10 },
          { cosmeticAssetId: secondAsset.id, position: 10 },
        ],
      }),
    ).rejects.toMatchObject({ statusCode: 409 });

    await expect(service.getCurrentLoadout(user.id)).resolves.toEqual({
      loadout: null,
    });
  });
});
