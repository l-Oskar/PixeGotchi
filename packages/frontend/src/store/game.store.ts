import { create } from "zustand";

export interface GameObject {
  id: number;
  x: number;
  y: number;
  type: "fruit" | "bomb";
  emoji: string;
  isExploding?: boolean;
  explodeStartTime?: number;
}

interface GameState {
  score: number;
  timeLeft: number;
  objects: GameObject[];
  basketX: number;
  canvasWidth: number;
  canvasHeight: number;
  isPlaying: boolean;

  // Actions
  addScore: (points: number) => void;
  setTimeLeft: (time: number) => void;
  setBasketX: (x: number) => void;
  addObject: (obj: GameObject) => void;
  removeObject: (id: number) => void;
  clearObjects: () => void;
  resetGame: () => void;
  setCanvasDimensions: (width: number, height: number) => void;
  setIsPlaying: (playing: boolean) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  score: 0,
  timeLeft: 30,
  objects: [],
  basketX: 0,
  canvasWidth: 400,
  canvasHeight: 600,
  isPlaying: false,

  addScore: (points) =>
    set((state) => ({ score: Math.max(0, state.score + points) })),

  setTimeLeft: (time) => set({ timeLeft: time }),

  setBasketX: (x) => set({ basketX: x }),

  addObject: (obj) => set((state) => ({ objects: [...state.objects, obj] })),

  removeObject: (id) =>
    set((state) => ({ objects: state.objects.filter((obj) => obj.id !== id) })),

  clearObjects: () => set({ objects: [] }),

  resetGame: () =>
    set({
      score: 0,
      timeLeft: 30,
      objects: [],
      basketX: get().canvasWidth / 2 - 30,
      isPlaying: false,
    }),

  setCanvasDimensions: (width, height) =>
    set({ canvasWidth: width, canvasHeight: height }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),
}));
