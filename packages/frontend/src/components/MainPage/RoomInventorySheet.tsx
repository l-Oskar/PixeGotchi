import { useMemo, useState } from "react";
import type { RoomCosmeticAsset } from "@pixegotchi/shared";
import { RARITY_COLORS } from "@pixegotchi/shared";
import { ChevronDown, ChevronUp, Grid2X2 } from "lucide-react";
import { useRoomCosmeticsInventory } from "@/services/queries/room-cosmetics.queries";
import {
  useRoomEditorStore,
  type RoomEditorCategory,
} from "@/store/room-editor.store";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const inventoryQuery = useRoomCosmeticsInventory();
  const {
    draft,
    selectedCategory,
    selectedAssetId,
    setDraft,
    setSelectedCategory,
    setSelectedAssetId,
  } = useRoomEditorStore();

  const assets = useMemo(() => {
    const inventoryAssets = inventoryQuery.data?.assets ?? [];
    if (selectedCategory === "all") return inventoryAssets;
    return inventoryAssets.filter(({ slot }) => slot === selectedCategory);
  }, [inventoryQuery.data?.assets, selectedCategory]);

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
    setSelectedAssetId(asset.id);
  };

  return (
    <section
      className={`pixel-panel-soft mx-2.5 mb-2.5 flex shrink-0 flex-col overflow-hidden bg-pixel-bg-deep/96 transition-[height] duration-200 ${
        isExpanded ? "h-[min(45dvh,23rem)]" : "h-[10.5rem]"
      }`}>
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        className="flex h-7 shrink-0 items-center justify-center text-pixel-muted"
        aria-label={
          isExpanded ? "Collapse room inventory" : "Expand room inventory"
        }>
        <span className="mr-1 font-pixel text-[7px]">ROOM INVENTORY</span>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      <div className="flex shrink-0 gap-1 overflow-x-auto px-2 pb-2">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setSelectedCategory(category.id)}
            className={`pixel-button min-h-7 shrink-0 px-2 font-pixel text-[7px] ${
              selectedCategory === category.id
                ? "text-pixel-highlight"
                : "text-pixel-muted"
            }`}>
            {category.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
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
          <div className="grid grid-cols-3 gap-2 min-[430px]:grid-cols-4">
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
                  className={`relative min-h-[5.25rem] overflow-hidden border-2 bg-pixel-surface-soft/80 p-1 text-left shadow-[0_2px_0_var(--color-pixel-shadow)] ${
                    selected
                      ? "border-pixel-highlight"
                      : "border-pixel-border/60"
                  }`}>
                  <div className="grid h-12 place-items-center overflow-hidden bg-pixel-bg-deep/45">
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
                  <div className="mt-1 truncate font-pixel text-[6px] leading-3 text-pixel-ink">
                    {asset.name}
                  </div>
                  <div
                    className={`truncate font-pixel text-[6px] uppercase ${RARITY_COLORS[asset.rarity]}`}>
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
