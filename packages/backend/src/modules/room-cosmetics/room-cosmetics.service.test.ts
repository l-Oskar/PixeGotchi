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

  it("saves a non-default cosmetic that the user owns", async () => {
    const user = await createUser();
    await createDefaultSurfaces();
    const asset = await createAsset({ isDefault: false });
    await prisma.userCosmetic.create({
      data: {
        userId: user.id,
        cosmeticAssetId: asset.id,
      },
    });
    const service = new RoomCosmeticsService();

    const result = await service.saveLoadout(user.id, {
      environmentId: "violet-brick",
      floorId: "plum-boards",
      placements: [{ cosmeticAssetId: asset.id, position: 10 }],
    });

    expect(result.loadout.placements).toEqual([
      { cosmeticAssetId: asset.id, position: 10 },
    ]);
  });

  it("rejects an unknown cosmetic without creating a loadout", async () => {
    const user = await createUser();
    await createDefaultSurfaces();
    const service = new RoomCosmeticsService();

    await expect(
      service.saveLoadout(user.id, {
        environmentId: "violet-brick",
        floorId: "plum-boards",
        placements: [
          { cosmeticAssetId: "missing-room-cosmetic", position: 10 },
        ],
      }),
    ).rejects.toMatchObject({ statusCode: 404 });

    await expect(service.getCurrentLoadout(user.id)).resolves.toEqual({
      loadout: null,
    });
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

  it("lists active purchasable cosmetics with ownership state", async () => {
    const user = await createUser();
    const offer = await createAsset({
      isDefault: false,
      isPurchasable: true,
      pgcPrice: 400,
    });
    await createAsset({
      isDefault: false,
      isPurchasable: false,
      pgcPrice: null,
    });
    await createAsset({
      isDefault: false,
      isLimited: true,
      isPurchasable: true,
      pgcPrice: 400,
    });
    const service = new RoomCosmeticsService();

    await expect(service.getShop(user.id)).resolves.toMatchObject({
      offers: [
        {
          asset: { id: offer.id },
          pgcPrice: "400",
          owned: false,
        },
      ],
    });
  });

  it("purchases a cosmetic atomically and exposes it in editor inventory", async () => {
    const user = await createUser({ pgcBalance: 500 });
    const offer = await createAsset({
      isDefault: false,
      isPurchasable: true,
      pgcPrice: 400,
    });
    const service = new RoomCosmeticsService();

    const purchase = await service.purchase(user.id, {
      cosmeticAssetId: offer.id,
    });

    expect(purchase.pgcBalance).toBe("100");
    expect(purchase.cosmetic).toMatchObject({
      cosmeticAssetId: offer.id,
      quantity: 1,
    });
    await expect(service.getEditorInventory(user.id)).resolves.toMatchObject({
      assets: [expect.objectContaining({ id: offer.id })],
    });
  });

  it("does not charge for an already owned cosmetic", async () => {
    const user = await createUser({ pgcBalance: 500 });
    const offer = await createAsset({
      isDefault: false,
      isPurchasable: true,
      pgcPrice: 400,
    });
    await prisma.userCosmetic.create({
      data: { userId: user.id, cosmeticAssetId: offer.id },
    });
    const service = new RoomCosmeticsService();

    await expect(
      service.purchase(user.id, { cosmeticAssetId: offer.id }),
    ).rejects.toMatchObject({ statusCode: 409 });
    const unchangedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    expect(unchangedUser.pgcBalance.toString()).toBe("500");
  });

  it("does not create ownership when the balance is insufficient", async () => {
    const user = await createUser({ pgcBalance: 399 });
    const offer = await createAsset({
      isDefault: false,
      isPurchasable: true,
      pgcPrice: 400,
    });
    const service = new RoomCosmeticsService();

    await expect(
      service.purchase(user.id, { cosmeticAssetId: offer.id }),
    ).rejects.toMatchObject({ statusCode: 402 });
    await expect(
      prisma.userCosmetic.findUnique({
        where: {
          userId_cosmeticAssetId: {
            userId: user.id,
            cosmeticAssetId: offer.id,
          },
        },
      }),
    ).resolves.toBeNull();
  });

  it("does not sell limited cosmetics through the unlimited company shop", async () => {
    const user = await createUser({ pgcBalance: 1_000 });
    const limitedAsset = await createAsset({
      isDefault: false,
      isLimited: true,
      isPurchasable: true,
      pgcPrice: 400,
    });
    const service = new RoomCosmeticsService();

    await expect(
      service.purchase(user.id, { cosmeticAssetId: limitedAsset.id }),
    ).rejects.toMatchObject({ statusCode: 404 });
    await expect(
      prisma.userCosmetic.findUnique({
        where: {
          userId_cosmeticAssetId: {
            userId: user.id,
            cosmeticAssetId: limitedAsset.id,
          },
        },
      }),
    ).resolves.toBeNull();
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

  it.each([
    { slot: "window", allowedPosition: 6, rejectedPosition: 7 },
    { slot: "curtain", allowedPosition: 7, rejectedPosition: 6 },
    { slot: "furniture", allowedPosition: 2, rejectedPosition: 1 },
    { slot: "sofa", allowedPosition: 8, rejectedPosition: 9 },
    { slot: "rug", allowedPosition: 9, rejectedPosition: 8 },
    { slot: "wallArt", allowedPosition: 1, rejectedPosition: 2 },
    { slot: "decor", allowedPosition: 10, rejectedPosition: 9 },
  ] as const)(
    "validates the allowed positions for $slot cosmetics",
    async ({ slot, allowedPosition, rejectedPosition }) => {
      const user = await createUser();
      await createDefaultSurfaces();
      const asset = await createAsset({
        slot,
        allowedPositions: [allowedPosition],
      });
      const service = new RoomCosmeticsService();

      await expect(
        service.saveLoadout(user.id, {
          environmentId: "violet-brick",
          floorId: "plum-boards",
          placements: [
            { cosmeticAssetId: asset.id, position: rejectedPosition },
          ],
        }),
      ).rejects.toMatchObject({ statusCode: 400 });

      const result = await service.saveLoadout(user.id, {
        environmentId: "violet-brick",
        floorId: "plum-boards",
        placements: [
          { cosmeticAssetId: asset.id, position: allowedPosition },
        ],
      });

      expect(result.loadout.placements).toEqual([
        { cosmeticAssetId: asset.id, position: allowedPosition },
      ]);
    },
  );

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

  it.each([1, 3] as const)(
    "allows a double-height cosmetic to start at position %i",
    async (position) => {
      const user = await createUser();
      await createDefaultSurfaces();
      const cabinet = await createAsset({
        slot: "furniture",
        allowedPositions: [1, 3],
        span: 2,
      });
      const service = new RoomCosmeticsService();

      const result = await service.saveLoadout(user.id, {
        environmentId: "violet-brick",
        floorId: "plum-boards",
        placements: [{ cosmeticAssetId: cabinet.id, position }],
      });

      expect(result.loadout.placements).toEqual([
        { cosmeticAssetId: cabinet.id, position },
      ]);
    },
  );

  it("rejects a double-height cosmetic outside the supported pairs", async () => {
    const user = await createUser();
    await createDefaultSurfaces();
    const cabinet = await createAsset({
      slot: "furniture",
      allowedPositions: [2],
      span: 2,
    });
    const service = new RoomCosmeticsService();

    await expect(
      service.saveLoadout(user.id, {
        environmentId: "violet-brick",
        floorId: "plum-boards",
        placements: [{ cosmeticAssetId: cabinet.id, position: 2 }],
      }),
    ).rejects.toMatchObject({ statusCode: 400 });

    await expect(service.getCurrentLoadout(user.id)).resolves.toEqual({
      loadout: null,
    });
  });
});
