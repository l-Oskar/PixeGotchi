import { beforeEach, describe, expect, it } from "vitest";
import type { RoomLoadout, SaveRoomLoadoutInput } from "@pixegotchi/shared";
import { useRoomEditorStore } from "./room-editor.store";

const loadout: RoomLoadout = {
  userId: 1,
  environmentId: "violet-brick",
  floorId: "plum-boards",
  placements: [
    { cosmeticAssetId: "arched-window-day", position: 7 },
    { cosmeticAssetId: "pink-window-curtains", position: 7 },
  ],
  updatedAt: "2026-07-15T00:00:00.000Z",
};

const resetEditorStore = () => {
  useRoomEditorStore.setState({
    isEditing: false,
    initialDraft: null,
    draft: null,
    isDirty: false,
    isPetVisible: true,
    selectedCategory: "all",
    selectedAssetId: null,
  });
};

describe("room editor store", () => {
  beforeEach(resetEditorStore);

  it("creates a local draft without changing the server loadout object", () => {
    useRoomEditorStore.getState().startEditing(loadout);

    expect(useRoomEditorStore.getState().draft).toEqual({
      environmentId: "violet-brick",
      floorId: "plum-boards",
      placements: [
        { cosmeticAssetId: "arched-window-day", position: 6 },
        { cosmeticAssetId: "pink-window-curtains", position: 7 },
      ],
    });
    expect(loadout.placements[0].position).toBe(7);
    expect(useRoomEditorStore.getState().isDirty).toBe(false);
  });

  it("marks changed drafts as dirty and restores clean state on cancel", () => {
    useRoomEditorStore.getState().startEditing(loadout);
    const changedDraft: SaveRoomLoadoutInput = {
      ...useRoomEditorStore.getState().draft!,
      floorId: "honey-boards",
    };

    useRoomEditorStore.getState().setDraft(changedDraft);

    expect(useRoomEditorStore.getState()).toMatchObject({
      isEditing: true,
      isDirty: true,
      draft: changedDraft,
    });

    useRoomEditorStore.getState().cancelEditing();

    expect(useRoomEditorStore.getState()).toMatchObject({
      isEditing: false,
      initialDraft: null,
      draft: null,
      isDirty: false,
      selectedAssetId: null,
    });
  });

  it("keeps pet visibility local and outside the save draft", () => {
    useRoomEditorStore.getState().startEditing(loadout);
    const draftBeforeToggle = useRoomEditorStore.getState().draft;

    useRoomEditorStore.getState().togglePetVisibility();

    expect(useRoomEditorStore.getState().isPetVisible).toBe(false);
    expect(useRoomEditorStore.getState().draft).toBe(draftBeforeToggle);
    expect(useRoomEditorStore.getState().isDirty).toBe(false);
    expect(useRoomEditorStore.getState().draft).not.toHaveProperty(
      "isPetVisible",
    );
  });

  it("keeps the editor and dirty draft open when save fails", async () => {
    useRoomEditorStore.getState().startEditing(loadout);
    useRoomEditorStore.getState().setDraft({
      ...useRoomEditorStore.getState().draft!,
      floorId: "honey-boards",
    });
    const draftBeforeSave = useRoomEditorStore.getState().draft;

    await expect(
      useRoomEditorStore
        .getState()
        .saveEditing(() => Promise.reject(new Error("Server error"))),
    ).rejects.toThrow("Server error");

    expect(useRoomEditorStore.getState()).toMatchObject({
      isEditing: true,
      isDirty: true,
      draft: draftBeforeSave,
    });
  });

  it("closes the editor only after a successful save", async () => {
    useRoomEditorStore.getState().startEditing(loadout);
    const savedDrafts: SaveRoomLoadoutInput[] = [];

    await useRoomEditorStore.getState().saveEditing(async (currentDraft) => {
      savedDrafts.push(currentDraft);
    });

    expect(savedDrafts).toEqual([
      {
        environmentId: "violet-brick",
        floorId: "plum-boards",
        placements: [
          { cosmeticAssetId: "arched-window-day", position: 6 },
          { cosmeticAssetId: "pink-window-curtains", position: 7 },
        ],
      },
    ]);
    expect(useRoomEditorStore.getState()).toMatchObject({
      isEditing: false,
      draft: null,
      isDirty: false,
    });
  });
});
