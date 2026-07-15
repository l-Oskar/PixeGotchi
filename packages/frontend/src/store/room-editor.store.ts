import { create } from "zustand";
import type {
  RoomLoadout,
  SaveRoomLoadoutInput,
} from "@pixegotchi/shared";
import type { RoomSlotId } from "@/components/MainPage/roomSlots";

const toDraft = (loadout: RoomLoadout): SaveRoomLoadoutInput => ({
  environmentId: loadout.environmentId,
  floorId: loadout.floorId,
  placements: loadout.placements.map((placement) => ({
    ...placement,
    position:
      placement.cosmeticAssetId === "arched-window-day"
        ? 6
        : placement.cosmeticAssetId === "pink-window-curtains"
          ? 7
          : placement.position,
  })),
});

export type RoomEditorCategory =
  | "all"
  | "environment"
  | "floor"
  | "window"
  | "curtain"
  | "furniture"
  | "sofa"
  | "rug"
  | "wallArt"
  | "decor";

interface RoomEditorState {
  isEditing: boolean;
  initialDraft: SaveRoomLoadoutInput | null;
  draft: SaveRoomLoadoutInput | null;
  isDirty: boolean;
  isPetVisible: boolean;
  selectedCategory: RoomEditorCategory;
  selectedAssetId: string | null;
  selectedSlot: RoomSlotId | null;
  startEditing: (loadout: RoomLoadout) => void;
  setDraft: (draft: SaveRoomLoadoutInput) => void;
  togglePetVisibility: () => void;
  setSelectedCategory: (category: RoomEditorCategory) => void;
  setSelectedAssetId: (assetId: string | null) => void;
  setSelectedSlot: (slot: RoomSlotId | null) => void;
  saveEditing: (
    saveDraft: (draft: SaveRoomLoadoutInput) => Promise<unknown>,
  ) => Promise<void>;
  cancelEditing: () => void;
}

const closedEditorState = {
  isEditing: false,
  initialDraft: null,
  draft: null,
  isDirty: false,
  isPetVisible: true,
  selectedCategory: "all" as const,
  selectedAssetId: null,
  selectedSlot: null,
};

export const useRoomEditorStore = create<RoomEditorState>((set, get) => ({
  isEditing: false,
  initialDraft: null,
  draft: null,
  isDirty: false,
  isPetVisible: true,
  selectedCategory: "all",
  selectedAssetId: null,
  selectedSlot: null,
  startEditing: (loadout) => {
    const draft = toDraft(loadout);
    set({
      isEditing: true,
      initialDraft: draft,
      draft,
      isDirty: false,
      isPetVisible: true,
      selectedCategory: "all",
      selectedAssetId: null,
      selectedSlot: null,
    });
  },
  setDraft: (draft) =>
    set((state) => ({
      draft,
      isDirty:
        state.initialDraft !== null &&
        JSON.stringify(draft) !== JSON.stringify(state.initialDraft),
    })),
  togglePetVisibility: () =>
    set((state) => ({ isPetVisible: !state.isPetVisible })),
  setSelectedCategory: (selectedCategory) =>
    set({ selectedCategory, selectedAssetId: null, selectedSlot: null }),
  setSelectedAssetId: (selectedAssetId) => set({ selectedAssetId }),
  setSelectedSlot: (selectedSlot) =>
    set({ selectedSlot, selectedAssetId: null, selectedCategory: "all" }),
  saveEditing: async (saveDraft) => {
    const draft = get().draft;
    if (!draft) return;

    await saveDraft(draft);
    set(closedEditorState);
  },
  cancelEditing: () => set(closedEditorState),
}));
