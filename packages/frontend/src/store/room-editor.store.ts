import { create } from "zustand";
import type {
  RoomLoadout,
  SaveRoomLoadoutInput,
} from "@pixegotchi/shared";

const toDraft = (loadout: RoomLoadout): SaveRoomLoadoutInput => ({
  environmentId: loadout.environmentId,
  floorId: loadout.floorId,
  placements: loadout.placements.map((placement) => ({ ...placement })),
});

interface RoomEditorState {
  isEditing: boolean;
  initialDraft: SaveRoomLoadoutInput | null;
  draft: SaveRoomLoadoutInput | null;
  isDirty: boolean;
  isPetVisible: boolean;
  startEditing: (loadout: RoomLoadout) => void;
  setDraft: (draft: SaveRoomLoadoutInput) => void;
  togglePetVisibility: () => void;
  finishEditing: () => void;
  cancelEditing: () => void;
}

export const useRoomEditorStore = create<RoomEditorState>((set) => ({
  isEditing: false,
  initialDraft: null,
  draft: null,
  isDirty: false,
  isPetVisible: true,
  startEditing: (loadout) => {
    const draft = toDraft(loadout);
    set({
      isEditing: true,
      initialDraft: draft,
      draft,
      isDirty: false,
      isPetVisible: true,
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
  finishEditing: () =>
    set({
      isEditing: false,
      initialDraft: null,
      draft: null,
      isDirty: false,
      isPetVisible: true,
    }),
  cancelEditing: () =>
    set({
      isEditing: false,
      initialDraft: null,
      draft: null,
      isDirty: false,
      isPetVisible: true,
    }),
}));
