import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gameApi } from "@/services/api/game.api";
import {
  CompleteGameSessionInput,
  GameSession,
  StartGameSessionInput,
} from "@pixegotchi/shared";
import { PIXEGOTCHI_KEYS } from "./pixegotchi.queries";
import { USER_KEYS } from "./users.queries";

export const GAME_KEYS = {
  all: ["games"] as const,
  historyRoot: ["games", "history"] as const,
  history: (gameId?: string) => ["games", "history", gameId ?? null] as const,
};

export const useGameHistory = (gameId?: string) => {
  return useQuery({
    queryKey: GAME_KEYS.history(gameId),
    queryFn: () => gameApi.getHistory(gameId),
  });
};

export const useStartGameSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StartGameSessionInput) => gameApi.startSession(input),
    onSuccess: async (session) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: GAME_KEYS.historyRoot }),
        queryClient.invalidateQueries({ queryKey: PIXEGOTCHI_KEYS.current }),
        queryClient.invalidateQueries({ queryKey: PIXEGOTCHI_KEYS.all }),
        queryClient.invalidateQueries({
          queryKey: PIXEGOTCHI_KEYS.details(session.pixegotchiId),
        }),
      ]);
    },
  });
};

export const useCompleteGameSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CompleteGameSessionInput) =>
      gameApi.completeSession(input),
    onSuccess: async (session) => {
      queryClient.setQueryData<GameSession[] | undefined>(
        GAME_KEYS.history(session.gameId),
        (current) =>
          current?.map((item) => (item.id === session.id ? session : item)),
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: GAME_KEYS.historyRoot }),
        queryClient.invalidateQueries({ queryKey: USER_KEYS.profile }),
        queryClient.invalidateQueries({ queryKey: PIXEGOTCHI_KEYS.current }),
        queryClient.invalidateQueries({ queryKey: PIXEGOTCHI_KEYS.all }),
        queryClient.invalidateQueries({
          queryKey: PIXEGOTCHI_KEYS.details(session.pixegotchiId),
        }),
      ]);
    },
  });
};
