import type {
  EquipRoomCosmeticInput,
  RoomCosmeticAsset,
  RoomCosmeticPosition,
  RoomCosmeticsCatalogResponse,
  RoomCosmeticsInventoryResponse,
  SaveRoomLoadoutInput,
  UnequipRoomCosmeticInput,
  UpdateRoomCosmeticResponse,
  UserRoomCosmeticsResponse,
  UserRoomLoadoutResponse,
} from "@pixegotchi/shared";
import type { CosmeticAsset } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/database/prisma";

const DEFAULT_ENVIRONMENT_ID = "violet-brick";
const DEFAULT_FLOOR_ID = "plum-boards";
const DEFAULT_POSITIONED_ASSETS = [
  { cosmeticAssetId: "arched-window-day", position: 6 },
  { cosmeticAssetId: "pink-window-curtains", position: 7 },
  { cosmeticAssetId: "tall-cabinet-wood", position: 3 },
  { cosmeticAssetId: "purple-sofa", position: 8 },
  { cosmeticAssetId: "purple-oval-rug", position: 9 },
  { cosmeticAssetId: "botanical-frame", position: 1 },
  { cosmeticAssetId: "yellow-lantern", position: 10 },
  { cosmeticAssetId: "bonsai-pot", position: 11 },
] as const;

const roomCosmeticsError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

const getOccupiedPositions = (
  asset: Pick<CosmeticAsset, "span">,
  position: number,
): number[] => (asset.span === 2 ? [position, position + 1] : [position]);

const ensureRoomLoadout = async (
  transaction: Prisma.TransactionClient,
  userId: number,
) => {
  const existingLoadout = await transaction.userRoomLoadout.findUnique({
    where: { userId },
  });

  if (existingLoadout) return existingLoadout;

  const loadout = await transaction.userRoomLoadout.create({
    data: {
      userId,
      environmentId: DEFAULT_ENVIRONMENT_ID,
      floorId: DEFAULT_FLOOR_ID,
    },
  });
  const availableDefaults = await transaction.cosmeticAsset.findMany({
    where: {
      id: {
        in: DEFAULT_POSITIONED_ASSETS.map((asset) => asset.cosmeticAssetId),
      },
      isActive: true,
    },
    select: { id: true },
  });
  const availableIds = new Set(availableDefaults.map((asset) => asset.id));

  await transaction.roomCosmeticPlacement.createMany({
    data: DEFAULT_POSITIONED_ASSETS.filter((asset) =>
      availableIds.has(asset.cosmeticAssetId),
    ).map((asset) => ({
      loadoutId: loadout.id,
      cosmeticAssetId: asset.cosmeticAssetId,
      position: asset.position,
    })),
  });

  return loadout;
};

const mapCosmeticAsset = (asset: CosmeticAsset): RoomCosmeticAsset => {
  const baseAsset = {
    id: asset.id,
    name: asset.name,
    rarity: asset.rarity,
    assetUrl: asset.assetUrl,
    environmentId: asset.environmentId,
    isDefault: asset.isDefault,
    isLimited: asset.isLimited,
    isTradable: asset.isTradable,
    isActive: asset.isActive,
  };

  if (asset.slot === "environment" || asset.slot === "floor") {
    return {
      ...baseAsset,
      slot: asset.slot,
    };
  }

  return {
    ...baseAsset,
    slot: asset.slot,
    allowedPositions: asset.allowedPositions as RoomCosmeticPosition[],
    span: asset.span === 2 ? 2 : 1,
    allowOverlap: asset.allowOverlap,
  };
};

export class RoomCosmeticsService {
  async getCatalog(): Promise<RoomCosmeticsCatalogResponse> {
    const assets = await prisma.cosmeticAsset.findMany({
      where: { isActive: true },
      orderBy: [{ slot: "asc" }, { id: "asc" }],
    });

    return { assets: assets.map(mapCosmeticAsset) };
  }

  async getOwnership(userId: number): Promise<UserRoomCosmeticsResponse> {
    const cosmetics = await prisma.userCosmetic.findMany({
      where: { userId },
      include: { asset: true },
      orderBy: [{ acquiredAt: "asc" }, { id: "asc" }],
    });

    return {
      cosmetics: cosmetics.map((cosmetic) => ({
        userId: cosmetic.userId,
        cosmeticAssetId: cosmetic.cosmeticAssetId,
        quantity: cosmetic.quantity,
        acquiredAt: cosmetic.acquiredAt.toISOString(),
        asset: mapCosmeticAsset(cosmetic.asset),
      })),
    };
  }

  async getEditorInventory(
    userId: number,
  ): Promise<RoomCosmeticsInventoryResponse> {
    const assets = await prisma.cosmeticAsset.findMany({
      where: {
        isActive: true,
        OR: [
          { isDefault: true },
          {
            ownerships: {
              some: {
                userId,
                quantity: { gt: 0 },
              },
            },
          },
        ],
      },
      orderBy: [{ slot: "asc" }, { name: "asc" }, { id: "asc" }],
    });

    return { assets: assets.map(mapCosmeticAsset) };
  }

  async getCurrentLoadout(
    userId: number,
  ): Promise<UserRoomLoadoutResponse> {
    const loadout = await prisma.userRoomLoadout.findUnique({
      where: { userId },
      include: {
        placements: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!loadout) {
      return { loadout: null };
    }

    return {
      loadout: {
        userId: loadout.userId,
        environmentId: loadout.environmentId,
        floorId: loadout.floorId,
        placements: loadout.placements.map((placement) => ({
          cosmeticAssetId: placement.cosmeticAssetId,
          position: placement.position as RoomCosmeticPosition,
        })),
        updatedAt: loadout.updatedAt.toISOString(),
      },
    };
  }

  async getOrCreateCurrentLoadout(
    userId: number,
  ): Promise<UserRoomLoadoutResponse> {
    await prisma.$transaction(
      (transaction) => ensureRoomLoadout(transaction, userId),
      { isolationLevel: "Serializable" },
    );
    return this.getCurrentLoadout(userId);
  }

  async saveLoadout(
    userId: number,
    input: SaveRoomLoadoutInput,
  ): Promise<UpdateRoomCosmeticResponse> {
    await prisma.$transaction(
      async (transaction) => {
        const placementAssetIds = input.placements.map(
          ({ cosmeticAssetId }) => cosmeticAssetId,
        );
        if (new Set(placementAssetIds).size !== placementAssetIds.length) {
          throw roomCosmeticsError(
            400,
            "A room cosmetic can only be equipped once",
          );
        }

        const requestedAssetIds = [
          input.environmentId,
          ...(input.floorId ? [input.floorId] : []),
          ...placementAssetIds,
        ];
        const uniqueAssetIds = [...new Set(requestedAssetIds)];
        const assets = await transaction.cosmeticAsset.findMany({
          where: {
            id: { in: uniqueAssetIds },
            isActive: true,
          },
        });

        if (assets.length !== uniqueAssetIds.length) {
          throw roomCosmeticsError(404, "Room cosmetic asset not found");
        }

        const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
        const environment = assetsById.get(input.environmentId);
        if (!environment || environment.slot !== "environment") {
          throw roomCosmeticsError(400, "Invalid room environment");
        }

        if (input.floorId) {
          const floor = assetsById.get(input.floorId);
          if (!floor || floor.slot !== "floor") {
            throw roomCosmeticsError(400, "Invalid room floor");
          }
        }

        const ownershipRequiredIds = assets
          .filter((asset) => !asset.isDefault)
          .map((asset) => asset.id);
        if (ownershipRequiredIds.length > 0) {
          const ownerships = await transaction.userCosmetic.findMany({
            where: {
              userId,
              cosmeticAssetId: { in: ownershipRequiredIds },
              quantity: { gt: 0 },
            },
            select: { cosmeticAssetId: true },
          });
          const ownedIds = new Set(
            ownerships.map(({ cosmeticAssetId }) => cosmeticAssetId),
          );
          if (ownershipRequiredIds.some((id) => !ownedIds.has(id))) {
            throw roomCosmeticsError(403, "Room cosmetic is not owned");
          }
        }

        const occupiedPositions = new Map<number, boolean[]>();
        for (const placement of input.placements) {
          const asset = assetsById.get(placement.cosmeticAssetId);
          if (!asset || asset.slot === "environment" || asset.slot === "floor") {
            throw roomCosmeticsError(
              400,
              "Surface cosmetics cannot be used as room placements",
            );
          }
          if (!asset.allowedPositions.includes(placement.position)) {
            throw roomCosmeticsError(
              400,
              "Room cosmetic cannot be equipped in this position",
            );
          }
          if (
            asset.span === 2 &&
            placement.position !== 1 &&
            placement.position !== 3
          ) {
            throw roomCosmeticsError(
              400,
              "Double-height cosmetics must start at position 1 or 3",
            );
          }

          const requestedPositions = getOccupiedPositions(
            asset,
            placement.position,
          );
          const hasCollision = requestedPositions.some((position) => {
            const occupied = occupiedPositions.get(position) ?? [];
            return occupied.some(
              (allowsOverlap) => !asset.allowOverlap && !allowsOverlap,
            );
          });
          if (hasCollision) {
            throw roomCosmeticsError(409, "Room position is already occupied");
          }
          requestedPositions.forEach((position) => {
            const occupied = occupiedPositions.get(position) ?? [];
            occupiedPositions.set(position, [
              ...occupied,
              asset.allowOverlap,
            ]);
          });
        }

        const loadout = await transaction.userRoomLoadout.upsert({
          where: { userId },
          create: {
            userId,
            environmentId: input.environmentId,
            floorId: input.floorId,
          },
          update: {
            environmentId: input.environmentId,
            floorId: input.floorId,
          },
        });

        await transaction.roomCosmeticPlacement.deleteMany({
          where: { loadoutId: loadout.id },
        });
        if (input.placements.length > 0) {
          await transaction.roomCosmeticPlacement.createMany({
            data: input.placements.map((placement) => ({
              loadoutId: loadout.id,
              cosmeticAssetId: placement.cosmeticAssetId,
              position: placement.position,
            })),
          });
        }
      },
      { isolationLevel: "Serializable" },
    );

    return this.getRequiredCurrentLoadout(userId);
  }

  async equip(
    userId: number,
    input: EquipRoomCosmeticInput,
  ): Promise<UpdateRoomCosmeticResponse> {
    await prisma.$transaction(
      async (transaction) => {
        const asset = await transaction.cosmeticAsset.findFirst({
          where: {
            id: input.cosmeticAssetId,
            isActive: true,
          },
        });

        if (!asset) {
          throw roomCosmeticsError(404, "Room cosmetic asset not found");
        }

        if (!asset.isDefault) {
          const ownership = await transaction.userCosmetic.findUnique({
            where: {
              userId_cosmeticAssetId: {
                userId,
                cosmeticAssetId: asset.id,
              },
            },
          });

          if (!ownership || ownership.quantity < 1) {
            throw roomCosmeticsError(403, "Room cosmetic is not owned");
          }
        }

        const loadout = await ensureRoomLoadout(transaction, userId);

        if (asset.slot === "environment" || asset.slot === "floor") {
          if (input.position !== undefined) {
            throw roomCosmeticsError(
              400,
              "Surface cosmetics do not accept a room position",
            );
          }

          await transaction.userRoomLoadout.update({
            where: { id: loadout.id },
            data:
              asset.slot === "environment"
                ? { environmentId: asset.id }
                : { floorId: asset.id },
          });
          return;
        }

        if (input.position === undefined) {
          throw roomCosmeticsError(
            400,
            "A room position is required for this cosmetic",
          );
        }

        if (!asset.allowedPositions.includes(input.position)) {
          throw roomCosmeticsError(
            400,
            "Room cosmetic cannot be equipped in this position",
          );
        }

        if (asset.span === 2 && input.position !== 1 && input.position !== 3) {
          throw roomCosmeticsError(
            400,
            "Double-height cosmetics must start at position 1 or 3",
          );
        }

        const existingPlacements =
          await transaction.roomCosmeticPlacement.findMany({
            where: { loadoutId: loadout.id },
            include: { asset: true },
          });

        if (
          existingPlacements.some(
            (placement) => placement.cosmeticAssetId === asset.id,
          )
        ) {
          throw roomCosmeticsError(409, "Room cosmetic is already equipped");
        }

        const requestedPositions = getOccupiedPositions(asset, input.position);
        const hasCollision = existingPlacements.some((placement) => {
          if (asset.allowOverlap || placement.asset.allowOverlap) {
            return false;
          }

          const occupiedPositions = getOccupiedPositions(
            placement.asset,
            placement.position,
          );
          return requestedPositions.some((position) =>
            occupiedPositions.includes(position),
          );
        });

        if (hasCollision) {
          throw roomCosmeticsError(409, "Room position is already occupied");
        }

        await transaction.roomCosmeticPlacement.create({
          data: {
            loadoutId: loadout.id,
            cosmeticAssetId: asset.id,
            position: input.position,
          },
        });

        await transaction.userRoomLoadout.update({
          where: { id: loadout.id },
          data: { updatedAt: new Date() },
        });
      },
      { isolationLevel: "Serializable" },
    );

    return this.getRequiredCurrentLoadout(userId);
  }

  async unequip(
    userId: number,
    input: UnequipRoomCosmeticInput,
  ): Promise<UpdateRoomCosmeticResponse> {
    await prisma.$transaction(
      async (transaction) => {
        const asset = await transaction.cosmeticAsset.findUnique({
          where: { id: input.cosmeticAssetId },
        });

        if (!asset) {
          throw roomCosmeticsError(404, "Room cosmetic asset not found");
        }

        const loadout = await ensureRoomLoadout(transaction, userId);

        if (asset.slot === "environment" || asset.slot === "floor") {
          if (input.position !== undefined) {
            throw roomCosmeticsError(
              400,
              "Surface cosmetics do not accept a room position",
            );
          }

          if (asset.slot === "environment") {
            throw roomCosmeticsError(
              400,
              "Room environment cannot be unequipped; equip a replacement",
            );
          }

          if (loadout.floorId !== asset.id) {
            throw roomCosmeticsError(404, "Room cosmetic is not equipped");
          }

          await transaction.userRoomLoadout.update({
            where: { id: loadout.id },
            data: { floorId: null },
          });
          return;
        }

        if (input.position === undefined) {
          throw roomCosmeticsError(
            400,
            "A room position is required for this cosmetic",
          );
        }

        const removed = await transaction.roomCosmeticPlacement.deleteMany({
          where: {
            loadoutId: loadout.id,
            cosmeticAssetId: asset.id,
            position: input.position,
          },
        });

        if (removed.count === 0) {
          throw roomCosmeticsError(404, "Room cosmetic is not equipped");
        }

        await transaction.userRoomLoadout.update({
          where: { id: loadout.id },
          data: { updatedAt: new Date() },
        });
      },
      { isolationLevel: "Serializable" },
    );

    return this.getRequiredCurrentLoadout(userId);
  }

  private async getRequiredCurrentLoadout(
    userId: number,
  ): Promise<UpdateRoomCosmeticResponse> {
    const response = await this.getCurrentLoadout(userId);

    if (!response.loadout) {
      throw roomCosmeticsError(500, "Room loadout was not persisted");
    }

    return { loadout: response.loadout };
  }
}
