import { useActorRef, useSelector } from "@xstate/react";
import { useEffect } from "react";
import type { PixegotchiStatus } from "@pixegotchi/shared";
import { pixegotchiUiMachine } from "../machines/pixegotchi.machine";
import { usePixegotchiById } from "@/services/queries/pixegotchi.queries";

interface UsePixegotchiProps {
  pixegotchiId: number;
  userId: number;
}

export function usePixegotchiActionFlow(status?: PixegotchiStatus | null) {
  const service = useActorRef(pixegotchiUiMachine);

  useEffect(() => {
    service.send({ type: "DATA_SYNCED", status: status ?? null });
  }, [service, status]);

  const selectedItemId = useSelector(
    service,
    (state) => state.context.selectedItemId,
  );
  const selectedQuantity = useSelector(
    service,
    (state) => state.context.selectedQuantity,
  );
  const lastStatus = useSelector(service, (state) => state.context.lastStatus);
  const lastError = useSelector(service, (state) => state.context.lastError);
  const isBootstrapping = useSelector(service, (state) =>
    state.matches("bootstrapping"),
  );
  const isIdle = useSelector(service, (state) =>
    state.matches({ ready: "idle" }),
  );
  const isConfirmingAction = useSelector(service, (state) =>
    state.matches({ ready: "confirmingAction" }),
  );
  const isSubmittingAction = useSelector(service, (state) =>
    state.matches({ ready: "submittingAction" }),
  );
  const isActionSuccess = useSelector(service, (state) =>
    state.matches({ ready: "actionSuccess" }),
  );
  const isActionError = useSelector(service, (state) =>
    state.matches({ ready: "actionError" }),
  );
  const isBlocked = useSelector(service, (state) => state.matches("blocked"));

  return {
    selectedItemId,
    selectedQuantity,
    lastStatus,
    lastError,
    isBootstrapping,
    isIdle,
    isConfirmingAction,
    isSubmittingAction,
    isActionSuccess,
    isActionError,
    isBlocked,
    isModalOpen:
      isConfirmingAction || isSubmittingAction || isActionError || isActionSuccess,
    requestAction: (itemId: string, canUseWhileBlocked = false) =>
      service.send({ type: "ACTION_REQUESTED", itemId, canUseWhileBlocked }),
    confirmAction: (itemId: string, quantity: number) =>
      service.send({ type: "ACTION_CONFIRMED", itemId, quantity }),
    mutationSucceeded: () => service.send({ type: "MUTATION_SUCCEEDED" }),
    mutationFailed: (error: unknown) =>
      service.send({ type: "MUTATION_FAILED", error }),
    cancel: () => service.send({ type: "CANCEL" }),
    retry: () => service.send({ type: "RETRY" }),
    service,
  };
}

export function usePixegotchi({ pixegotchiId }: UsePixegotchiProps) {
  const pixegotchiQuery = usePixegotchiById(pixegotchiId);
  const flow = usePixegotchiActionFlow(pixegotchiQuery.data?.status ?? null);
  const pixegotchi = pixegotchiQuery.data ?? null;

  return {
    pixegotchi,
    health: Number(pixegotchi?.health ?? 0),
    hunger: Number(pixegotchi?.hunger ?? 0),
    energy: Number(pixegotchi?.energy ?? 0),
    happiness: Number(pixegotchi?.happiness ?? 0),
    cleanliness: Number(pixegotchi?.cleanliness ?? 0),
    status: pixegotchi?.status ?? null,
    isActive: pixegotchi?.status === "active",
    isCritical: pixegotchi?.status === "critical",
    isDead: pixegotchi?.status === "dead",
    isInitializing: pixegotchiQuery.isLoading || flow.isBootstrapping,
    isError: pixegotchiQuery.isError || flow.isActionError,
    query: pixegotchiQuery,
    ...flow,
    retry: () => {
      flow.retry();
      void pixegotchiQuery.refetch();
    },
  };
}

export default usePixegotchi;
