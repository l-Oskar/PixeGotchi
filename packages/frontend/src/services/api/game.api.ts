import {
  GameSession,
  StartGameSessionInput,
  CompleteGameSessionInput,
} from "@pixegotchi/shared";
import { apiClient } from "./client";

export const GAME_URL = "/games";

export const GAME_URL_KEYS = {
  start: `${GAME_URL}/start` as const,
  complete: (sessionId: number) => `${GAME_URL}/${sessionId}/complete` as const,
  history: `${GAME_URL}/history` as const,
};

export const gameApi = {
  startSession: async (input: StartGameSessionInput): Promise<GameSession> => {
    const { data } = await apiClient.post(GAME_URL_KEYS.start, input);
    return data;
  },

  completeSession: async ({
    sessionId,
    score,
  }: CompleteGameSessionInput): Promise<GameSession> => {
    const { data } = await apiClient.post(GAME_URL_KEYS.complete(sessionId), {
      score,
    });
    return data;
  },

  getHistory: async (gameId?: string): Promise<GameSession[]> => {
    const { data } = await apiClient.get(GAME_URL_KEYS.history, {
      params: gameId ? { gameId } : undefined,
    });
    return data;
  },
};
