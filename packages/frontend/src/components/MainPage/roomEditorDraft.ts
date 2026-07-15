import type {
  RoomCosmeticAsset,
  RoomCosmeticPosition,
  RoomPositionedCosmeticAsset,
  SaveRoomLoadoutInput,
} from "@pixegotchi/shared";

const occupiedPositions = (
  asset: RoomPositionedCosmeticAsset,
  position: RoomCosmeticPosition,
): number[] => (asset.span === 2 ? [position, position + 1] : [position]);

export const placeRoomAsset = (
  draft: SaveRoomLoadoutInput,
  asset: RoomPositionedCosmeticAsset,
  position: RoomCosmeticPosition,
  inventory: RoomCosmeticAsset[],
): SaveRoomLoadoutInput => {
  if (!asset.allowedPositions.includes(position)) return draft;
  if (asset.span === 2 && position !== 1 && position !== 3) return draft;

  const currentPlacement = draft.placements.find(
    ({ cosmeticAssetId }) => cosmeticAssetId === asset.id,
  );
  if (currentPlacement?.position === position) return draft;

  const requestedPositions = occupiedPositions(asset, position);
  const placements = draft.placements.filter((placement) => {
    if (placement.cosmeticAssetId === asset.id) return false;

    const placedAsset = inventory.find(
      ({ id }) => id === placement.cosmeticAssetId,
    );
    if (
      !placedAsset ||
      placedAsset.slot === "environment" ||
      placedAsset.slot === "floor"
    ) {
      return true;
    }
    if (asset.allowOverlap || placedAsset.allowOverlap) return true;

    const placedPositions = occupiedPositions(
      placedAsset,
      placement.position,
    );
    return !requestedPositions.some((requestedPosition) =>
      placedPositions.includes(requestedPosition),
    );
  });

  return {
    ...draft,
    placements: [
      ...placements,
      { cosmeticAssetId: asset.id, position },
    ],
  };
};

export const removeRoomAsset = (
  draft: SaveRoomLoadoutInput,
  assetId: string,
): SaveRoomLoadoutInput => ({
  ...draft,
  placements: draft.placements.filter(
    ({ cosmeticAssetId }) => cosmeticAssetId !== assetId,
  ),
});

export const normalizeRoomEditorAsset = (
  asset: RoomCosmeticAsset,
): RoomCosmeticAsset => {
  if (asset.slot === "environment" || asset.slot === "floor") return asset;

  if (asset.id === "arched-window-day") {
    return {
      ...asset,
      slot: "window",
      allowedPositions: [6],
      allowOverlap: false,
    };
  }

  if (asset.id === "pink-window-curtains") {
    return {
      ...asset,
      slot: "curtain",
      allowedPositions: [7],
      allowOverlap: false,
    };
  }

  if (asset.id === "botanical-frame") {
    return {
      ...asset,
      slot: "wallArt",
      allowedPositions: [1, 3],
    };
  }

  if (asset.id === "purple-sofa" || asset.id === "blue-sofa") {
    return {
      ...asset,
      slot: "sofa",
      allowedPositions: [8],
    };
  }

  if (asset.id === "yellow-lantern" || asset.id === "bonsai-pot") {
    return {
      ...asset,
      slot: "decor",
      allowedPositions: [10, 11],
    };
  }

  return asset;
};
