import { useEffect, useState } from "react";
import type { Pixegotchi } from "@pixegotchi/shared";
import { Eye, EyeOff } from "lucide-react";
import { viewport } from "@tma.js/sdk";
import { useSignal } from "@tma.js/sdk-react";
import { Visual } from "./Visual";
import { buildRoomAssetPlacementsFromLoadout } from "./roomAssets";
import { ROOM_FLOORS, ROOM_WALLS } from "./roomSurfaces";
import type { RoomFloorId, RoomWallId } from "./roomSurfaces";
import { useRoomEditorStore } from "@/store/room-editor.store";
import {
  useRoomCosmeticsInventory,
  useSaveRoomCosmeticsLoadout,
} from "@/services/queries/room-cosmetics.queries";
import { RoomInventorySheet } from "./RoomInventorySheet";
import {
  normalizeRoomEditorAsset,
  placeRoomAsset,
  removeRoomAsset,
} from "./roomEditorDraft";
import type { RoomSlotId } from "./roomSlots";

interface RoomEditorProps {
  pixegotchi: Pixegotchi;
}

export const RoomEditor = ({ pixegotchi }: RoomEditorProps) => {
  const [saveError, setSaveError] = useState<string | null>(null);
  const safeAreaInsetTop = useSignal(viewport.safeAreaInsetTop);
  const contentSafeAreaInsetTop = useSignal(viewport.contentSafeAreaInsetTop);
  const safeAreaInsetBottom = useSignal(viewport.safeAreaInsetBottom);
  const contentSafeAreaInsetBottom = useSignal(
    viewport.contentSafeAreaInsetBottom,
  );
  const topInset = Math.max(
    0,
    (safeAreaInsetTop ?? 0) + (contentSafeAreaInsetTop ?? 0),
  );
  const bottomInset = Math.max(
    0,
    (safeAreaInsetBottom ?? 0) + (contentSafeAreaInsetBottom ?? 0),
  );
  const {
    draft,
    isDirty,
    isPetVisible,
    selectedAssetId,
    setDraft,
    setSelectedAssetId,
    togglePetVisibility,
    saveEditing,
    cancelEditing,
  } = useRoomEditorStore();
  const saveLoadout = useSaveRoomCosmeticsLoadout();
  const inventoryQuery = useRoomCosmeticsInventory();

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  if (!draft) return null;

  const wallId = ROOM_WALLS.some(({ id }) => id === draft.environmentId)
    ? (draft.environmentId as RoomWallId)
    : ROOM_WALLS[0].id;
  const floorId =
    draft.floorId && ROOM_FLOORS.some(({ id }) => id === draft.floorId)
      ? (draft.floorId as RoomFloorId)
      : ROOM_FLOORS[0].id;
  const inventoryAssets = (inventoryQuery.data?.assets ?? []).map(
    normalizeRoomEditorAsset,
  );
  const selectedAsset = inventoryAssets.find(
    ({ id }) => id === selectedAssetId,
  );
  const selectedPositionedAsset =
    selectedAsset &&
    selectedAsset.slot !== "environment" &&
    selectedAsset.slot !== "floor"
      ? selectedAsset
      : null;
  const selectedPlacement = selectedPositionedAsset
    ? draft.placements.find(
        ({ cosmeticAssetId }) =>
          cosmeticAssetId === selectedPositionedAsset.id,
      )
    : null;
  const slotTargets = selectedPositionedAsset
    ? selectedPositionedAsset.allowedPositions.map((slot) => ({
        slot: slot as RoomSlotId,
        span: selectedPositionedAsset.span,
      }))
    : [];

  const handleCancel = () => {
    if (isDirty && !window.confirm("Discard room changes?")) return;
    cancelEditing();
  };

  const handleSave = async () => {
    setSaveError(null);
    try {
      await saveEditing((currentDraft) =>
        saveLoadout.mutateAsync(currentDraft),
      );
    } catch {
      setSaveError("SAVE FAILED. TRY AGAIN.");
    }
  };

  const handleSlotSelect = (slot: RoomSlotId) => {
    if (!selectedPositionedAsset) return;
    setDraft(
      placeRoomAsset(
        draft,
        selectedPositionedAsset,
        slot,
        inventoryAssets,
      ),
    );
    setSelectedAssetId(null);
  };

  const handleRemoveAsset = () => {
    if (!selectedPositionedAsset) return;
    setDraft(removeRoomAsset(draft, selectedPositionedAsset.id));
    setSelectedAssetId(null);
  };

  return (
    <section
      className="fixed inset-0 z-50 flex h-[100dvh] flex-col overflow-hidden bg-pixel-bg-deep text-pixel-ink"
      style={{
        paddingTop: `max(${topInset}px, env(safe-area-inset-top))`,
        paddingBottom: `max(${bottomInset}px, env(safe-area-inset-bottom))`,
      }}>
      <header className="flex shrink-0 items-center justify-between gap-2 p-2.5">
        <button
          type="button"
          onClick={handleCancel}
          className="pixel-button min-h-9 px-3 font-pixel text-[8px] text-pixel-muted">
          CANCEL
        </button>
        <h1 className="font-pixel text-[10px] text-pixel-ink">EDIT ROOM</h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || saveLoadout.isPending}
          className="pixel-button min-h-9 px-3 font-pixel text-[8px] text-pixel-highlight disabled:opacity-40">
          {saveLoadout.isPending ? "SAVING" : "SAVE"}
        </button>
      </header>

      <div className="relative min-h-0 flex-1 p-2.5 pt-0">
        {saveError && (
          <div className="pixel-panel-soft absolute left-4 right-14 top-2 z-50 flex h-8 items-center justify-center bg-pixel-bg-deep/95 px-2 text-center font-pixel text-[7px] text-pixel-red">
            {saveError}
          </div>
        )}
        {selectedPositionedAsset && (
          <div className="pixel-panel-soft absolute left-4 right-14 top-2 z-40 flex h-8 items-center justify-between gap-2 bg-pixel-bg-deep/90 px-2 font-pixel text-[7px]">
            <span className="min-w-0 truncate text-pixel-highlight">
              {selectedPlacement ? "MOVE" : "PLACE"}: {selectedPositionedAsset.name}
            </span>
            {selectedPlacement && (
              <button
                type="button"
                onClick={handleRemoveAsset}
                className="pixel-button min-h-6 shrink-0 px-2 text-[6px] text-pixel-red">
                REMOVE
              </button>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={togglePetVisibility}
          className="pixel-icon-button absolute right-4 top-2 z-40 h-8 min-h-8 w-8 min-w-8 text-pixel-highlight"
          aria-label={isPetVisible ? "Hide pet" : "Show pet"}>
          {isPetVisible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <div className="h-full w-full [&_.pixel-room-bg]:h-full">
          <Visual
            pet={pixegotchi}
            status={null}
            centerPet
            hidePet={!isPetVisible}
            wallId={wallId}
            floorId={floorId}
            assets={buildRoomAssetPlacementsFromLoadout(draft.placements)}
            slotTargets={slotTargets}
            onSlotSelect={handleSlotSelect}
            onAssetSelect={setSelectedAssetId}
          />
        </div>
      </div>

      <RoomInventorySheet />
    </section>
  );
};
