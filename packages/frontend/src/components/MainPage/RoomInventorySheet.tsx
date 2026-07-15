import { useMemo } from "react";
import type { RoomCosmeticAsset } from "@pixegotchi/shared";
import { RARITY_COLORS } from "@pixegotchi/shared";
import { ChevronDown, Grid2X2, X } from "lucide-react";
import { useRoomCosmeticsInventory } from "@/services/queries/room-cosmetics.queries";
import {
  useRoomEditorStore,
  type RoomEditorCategory,
} from "@/store/room-editor.store";
import {
  getRoomAssetPlacementPositionForSlot,
  isRoomPositionedAsset,
  normalizeRoomEditorAsset,
  placeRoomAsset,
} from "./roomEditorDraft";

const CATEGORIES: Array<{
  id: RoomEditorCategory;
  label: string;
}> = [
  { id: "all", label: "ALL" },
  { id: "environment", label: "WALLS" },
  { id: "floor", label: "FLOORS" },
  { id: "window", label: "WINDOWS" },
  { id: "curtain", label: "CURTAINS" },
  { id: "furniture", label: "FURNITURE" },
  { id: "sofa", label: "SOFAS" },
  { id: "rug", label: "RUGS" },
  { id: "wallArt", label: "WALL ART" },
  { id: "decor", label: "DECOR" },
];

const isAssetEquipped = (
  asset: RoomCosmeticAsset,
  environmentId: string,
  floorId: string | null,
  placementIds: Set<string>,
) => {
  if (asset.slot === "environment") return asset.id === environmentId;
  if (asset.slot === "floor") return asset.id === floorId;
  return placementIds.has(asset.id);
};

export const RoomInventorySheet = () => {
  const inventoryQuery = useRoomCosmeticsInventory();
  const {
    draft,
    selectedCategory,
    selectedAssetId,
    selectedSlot,
    setDraft,
    setSelectedCategory,
    setSelectedAssetId,
    setSelectedSlot,
  } = useRoomEditorStore();

  const inventoryAssets = useMemo(
    () =>
      (inventoryQuery.data?.assets ?? []).map(normalizeRoomEditorAsset),
    [inventoryQuery.data?.assets],
  );

  const assets = useMemo(() => {
    const categoryAssets =
      selectedCategory === "all"
        ? inventoryAssets
        : inventoryAssets.filter(({ slot }) => slot === selectedCategory);
    if (selectedSlot === null) return categoryAssets;
    return categoryAssets.filter(
      (asset) =>
        getRoomAssetPlacementPositionForSlot(asset, selectedSlot) !== null,
    );
  }, [inventoryAssets, selectedCategory, selectedSlot]);

  if (!draft) return null;

  const placementIds = new Set(
    draft.placements.map(({ cosmeticAssetId }) => cosmeticAssetId),
  );

  const handleAssetClick = (asset: RoomCosmeticAsset) => {
    if (asset.slot === "environment") {
      setDraft({ ...draft, environmentId: asset.id });
      setSelectedAssetId(asset.id);
      return;
    }
    if (asset.slot === "floor") {
      setDraft({ ...draft, floorId: asset.id });
      setSelectedAssetId(asset.id);
      return;
    }
    if (selectedSlot !== null && isRoomPositionedAsset(asset)) {
      const position = getRoomAssetPlacementPositionForSlot(
        asset,
        selectedSlot,
      );
      if (position === null) return;
      const currentPlacement = draft.placements.find(
        ({ cosmeticAssetId }) => cosmeticAssetId === asset.id,
      );
      if (currentPlacement?.position === position) {
        setSelectedSlot(null);
        setSelectedAssetId(asset.id);
        return;
      }
      setDraft(placeRoomAsset(draft, asset, position, inventoryAssets));
      setSelectedAssetId(null);
      return;
    }
    setSelectedAssetId(asset.id);
  };

  return (
    <section className="pixel-panel-soft mx-2.5 mb-2.5 flex h-[clamp(15rem,40dvh,20rem)] shrink-0 flex-col overflow-hidden bg-pixel-bg-deep/96">
      <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b-2 border-pixel-border/50 px-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-pixel text-[8px] text-pixel-ink">
            ROOM INVENTORY
          </span>
          {selectedSlot !== null && (
            <button
              type="button"
              onClick={() => setSelectedSlot(null)}
              className="pixel-button flex h-7 shrink-0 items-center gap-1 px-2 font-pixel text-[6px] text-pixel-highlight">
              SLOT {selectedSlot}
              <X size={11} />
            </button>
          )}
        </div>
        <label className="relative min-w-28">
          <span className="sr-only">Room asset category</span>
          <select
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(event.target.value as RoomEditorCategory)
            }
            className="pixel-button h-8 w-full appearance-none bg-pixel-bg-deep px-3 pr-8 font-pixel text-[7px] text-pixel-highlight">
            {CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-pixel-highlight"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
        {inventoryQuery.isLoading ? (
          <div className="grid h-full place-items-center font-pixel text-[8px] text-pixel-muted">
            LOADING...
          </div>
        ) : inventoryQuery.isError ? (
          <div className="grid h-full place-items-center font-pixel text-[8px] text-pixel-red">
            INVENTORY FAILED
          </div>
        ) : assets.length === 0 ? (
          <div className="grid h-full place-items-center font-pixel text-[8px] text-pixel-muted">
            NO ASSETS
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5 min-[430px]:grid-cols-4">
            {assets.map((asset) => {
              const equipped = isAssetEquipped(
                asset,
                draft.environmentId,
                draft.floorId,
                placementIds,
              );
              const selected = selectedAssetId === asset.id;

              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => handleAssetClick(asset)}
                  className={`relative min-h-[7rem] overflow-hidden border-2 bg-pixel-surface-soft/80 p-1.5 text-left shadow-[0_2px_0_var(--color-pixel-shadow)] ${
                    selected
                      ? "border-pixel-highlight"
                      : equipped
                        ? "border-pixel-green"
                        : "border-pixel-border/60"
                  }`}>
                  <div className="grid h-16 place-items-center overflow-hidden bg-pixel-bg-deep/45">
                    {asset.assetUrl ? (
                      <img
                        src={`${import.meta.env.BASE_URL}${asset.assetUrl}`}
                        alt={asset.name}
                        className="h-full w-full object-contain pixelated"
                      />
                    ) : (
                      <Grid2X2
                        size={24}
                        className={RARITY_COLORS[asset.rarity]}
                      />
                    )}
                  </div>
                  <div className="mt-1.5 truncate font-pixel text-[7px] leading-3 text-pixel-ink">
                    {asset.name}
                  </div>
                  <div
                    className={`truncate font-pixel text-[6px] uppercase ${
                      equipped
                        ? "text-pixel-green"
                        : RARITY_COLORS[asset.rarity]
                    }`}>
                    {equipped ? "EQUIPPED" : asset.rarity}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
