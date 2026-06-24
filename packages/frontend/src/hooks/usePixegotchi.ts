import { useActorRef, useSelector } from "@xstate/react";
import { useEffect } from "react";
import { pixegotchiMachine } from "../machines/pixegotchi.machine";
import { usePixegotchiById } from "@/services/queries/pixegotchi.queries";

interface UsePixegotchiProps {
  pixegotchiId: number;
  userId: number;
}

export function usePixegotchi({ pixegotchiId, userId }: UsePixegotchiProps) {
  const pixegotchiQuery = usePixegotchiById(pixegotchiId);
  const service = useActorRef(pixegotchiMachine, {
    input: {
      pixegotchiId,
      userId,
    },
  });

  useEffect(() => {
    if (pixegotchiQuery.data) {
      service.send({ type: "LOAD_SUCCESS", data: pixegotchiQuery.data });
      return;
    }

    if (pixegotchiQuery.isError) {
      service.send({ type: "LOAD_ERROR", data: pixegotchiQuery.error });
    }
  }, [
    pixegotchiQuery.data,
    pixegotchiQuery.error,
    pixegotchiQuery.isError,
    service,
  ]);

  // === Context values (stats) ===
  const health = useSelector(service, (state) => state.context.health);
  const hunger = useSelector(service, (state) => state.context.hunger);
  const energy = useSelector(service, (state) => state.context.energy);
  const happiness = useSelector(service, (state) => state.context.happiness);
  const cleanliness = useSelector(
    service,
    (state) => state.context.cleanliness,
  );
  const status = useSelector(service, (state) => state.context.status);
  const tickCount = useSelector(service, (state) => state.context.tickCount);
  const lastError = useSelector(service, (state) => state.context.lastError);
  const syncErrors = useSelector(service, (state) => state.context.syncErrors);

  // === State matching ===
  const isActive = useSelector(service, (state) => state.matches("active"));
  const isCritical = useSelector(service, (state) => state.matches("critical"));
  const isDead = useSelector(service, (state) => state.matches("dead"));
  const isInitializing = useSelector(service, (state) =>
    state.matches("initializing"),
  );
  const isError = useSelector(service, (state) => state.matches("error"));

  // === Action dispatchers ===
  const feed = () => service.send({ type: "FEED" });
  const sleep = () => service.send({ type: "SLEEP" });
  const play = () => service.send({ type: "PLAY" });
  const clean = () => service.send({ type: "CLEAN" });
  const heal = () => service.send({ type: "HEAL" });
  const retry = () => {
    service.send({ type: "RETRY" });
    pixegotchiQuery.refetch();
  };
  const pauseStats = () => service.send({ type: "PAUSE_DEGRADATION" });
  const resumeStats = () => service.send({ type: "RESUME_DEGRADATION" });

  return {
    // Stats
    health,
    hunger,
    energy,
    happiness,
    cleanliness,
    status,
    tickCount,
    lastError,
    syncErrors,

    // State checks
    isActive,
    isCritical,
    isDead,
    isInitializing,
    isError,
    query: pixegotchiQuery,

    // Actions
    feed,
    sleep,
    play,
    clean,
    heal,
    retry,
    pauseStats,
    resumeStats,

    // Service for advanced use
    service,
  };
}

export default usePixegotchi;
