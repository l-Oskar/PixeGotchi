import { create } from "zustand";
import type {
  RoomLoadout,
  SaveRoomLoadoutInput,
} from "@pixegotchi/shared";

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
  startEditing: (loadout: RoomLoadout) => void;
  setDraft: (draft: SaveRoomLoadoutInput) => void;
  togglePetVisibility: () => void;
  setSelectedCategory: (category: RoomEditorCategory) => void;
  setSelectedAssetId: (assetId: string | null) => void;
  finishEditing: () => void;
  cancelEditing: () => void;
}

export const useRoomEditorStore = create<RoomEditorState>((set) => ({
  isEditing: false,
  initialDraft: null,
  draft: null,
  isDirty: false,
  isPetVisible: true,
  selectedCategory: "all",
  selectedAssetId: null,
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
    set({ selectedCategory, selectedAssetId: null }),
  setSelectedAssetId: (selectedAssetId) => set({ selectedAssetId }),
  finishEditing: () =>
    set({
      isEditing: false,
      initialDraft: null,
      draft: null,
      isDirty: false,
      isPetVisible: true,
      selectedCategory: "all",
      selectedAssetId: null,
    }),
  cancelEditing: () =>
    set({
      isEditing: false,
      initialDraft: null,
      draft: null,
      isDirty: false,
      isPetVisible: true,
      selectedCategory: "all",
      selectedAssetId: null,
    }),
}));
