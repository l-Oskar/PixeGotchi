import { useState } from "react";
import type { Pixegotchi } from "@pixegotchi/shared";
import { Eye, EyeOff } from "lucide-react";
import { viewport } from "@tma.js/sdk";
import { useSignal } from "@tma.js/sdk-react";
import { Visual } from "./Visual";
import { ROOM_ASSETS, buildRoomAssetPlacements } from "./roomAssets";
import { ROOM_FLOORS, ROOM_WALLS } from "./roomSurfaces";
import type { RoomFloorId, RoomWallId } from "./roomSurfaces";
import { useRoomEditorStore } from "@/store/room-editor.store";
import { useSaveRoomCosmeticsLoadout } from "@/services/queries/room-cosmetics.queries";

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
    togglePetVisibility,
    finishEditing,
    cancelEditing,
  } = useRoomEditorStore();
  const saveLoadout = useSaveRoomCosmeticsLoadout();

  if (!draft) return null;

  const wallId = ROOM_WALLS.some(({ id }) => id === draft.environmentId)
    ? (draft.environmentId as RoomWallId)
    : ROOM_WALLS[0].id;
  const floorId =
    draft.floorId && ROOM_FLOORS.some(({ id }) => id === draft.floorId)
      ? (draft.floorId as RoomFloorId)
      : ROOM_FLOORS[0].id;
  const equippedIds = new Set(
    draft.placements.map(({ cosmeticAssetId }) => cosmeticAssetId),
  );
  const hiddenAssetIds = ROOM_ASSETS.filter(
    ({ id }) => !equippedIds.has(id),
  ).map(({ id }) => id);
  const cabinetPlacement = draft.placements.find(
    ({ cosmeticAssetId }) => cosmeticAssetId === "tall-cabinet-wood",
  );
  const cabinetSlot = cabinetPlacement?.position === 1 ? 1 : 3;

  const handleCancel = () => {
    if (isDirty && !window.confirm("Discard room changes?")) return;
    cancelEditing();
  };

  const handleSave = async () => {
    setSaveError(null);
    try {
      await saveLoadout.mutateAsync(draft);
      finishEditing();
    } catch {
      setSaveError("SAVE FAILED. TRY AGAIN.");
    }
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

      {saveError && (
        <div className="px-3 pb-2 text-center font-pixel text-[8px] text-pixel-red">
          {saveError}
        </div>
      )}

      <div className="relative min-h-0 flex-1 p-2.5 pt-0">
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
            assets={buildRoomAssetPlacements(hiddenAssetIds, cabinetSlot)}
          />
        </div>
      </div>

      <div className="pixel-panel-soft mx-2.5 mb-2.5 shrink-0 p-3 text-center font-pixel text-[8px] text-pixel-muted">
        ROOM INVENTORY — NEXT STEP
      </div>
    </section>
  );
};
