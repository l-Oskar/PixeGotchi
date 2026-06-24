import { createMachine } from "xstate";

export interface GameContext {
  finalScore: number;
}

export const gameMachine = createMachine({
  id: "miniGame",
  initial: "idle",
  context: { finalScore: 0 },
  states: {
    idle: { on: { START: "playing" } },
    playing: { on: { GAME_OVER: "gameOver" } },
    gameOver: { type: "final" },
  },
});
