import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eggApi } from "../api/egg.api";
import { useEggStore } from "@/store/egg.store";
import { usePixegotchiStore } from "@/store/pixegotchi.store";
import { useUserStore } from "@/store/user.store";
import { Pixegotchi, UserProfile } from "@pixegotchi/shared";
import { USER_KEYS } from "./users.queries";
import { PIXEGOTCHI_KEYS } from "./pixegotchi.queries";

export const EGG_KEYS = {
  all: ["eggs"] as const,
  hatching: ["hatchingEgg"] as const,
  tap: ["tap"] as const,
  details: (eggId: number | null) => ["egg", eggId] as const,
  status: (eggId: number | null) => ["egg", eggId, "status"] as const,
  create: ["createEgg"] as const,
};

export const useGetAllEggs = () => {
  return useQuery({
    queryKey: EGG_KEYS.all,
    queryFn: eggApi.getAllEggs,
  });
};

export const useGetById = (eggId: number | null) => {
  return useQuery({
    queryKey: EGG_KEYS.details(eggId),
    queryFn: () => {
      if (!eggId) throw new Error("eggId is required");
      return eggApi.getEggById(eggId);
    },
    enabled: !!eggId,
  });
};

export const useGetHatchingEgg = () => {
  return useQuery({
    queryKey: EGG_KEYS.hatching,
    queryFn: eggApi.getHatchingEgg,
  });
};

export const useCreateEgg = () => {
  const queryClient = useQueryClient();
  const updateBallance = useUserStore((s) => s.updateBallance);
  return useMutation({
    mutationFn: eggApi.createEgg,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: EGG_KEYS.all });
      updateBallance(data.pgcBalance.toString());
      queryClient.setQueryData<UserProfile | undefined>(
        USER_KEYS.profile,
        (current) =>
          current
            ? { ...current, pgcBalance: data.pgcBalance.toString() }
            : current,
      );
      return data;
    },
  });
};

export const useStartHatching = () => {
  const setHatching = useEggStore((s) => s.setHatchingEgg);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eggId: number) => eggApi.startHatching(eggId),
    onSuccess: (data) => {
      setHatching(data);
      queryClient.setQueryData(EGG_KEYS.hatching, data);
      queryClient.invalidateQueries({ queryKey: EGG_KEYS.all });
    },
  });
};

export const useBatchTap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eggId, tapCount }: { eggId: number; tapCount: number }) =>
      eggApi.batchTap(eggId, tapCount),
    onSuccess: (data, { eggId }) => {
      queryClient.setQueryData(EGG_KEYS.status(eggId), data);
      return data;
    },
  });
};

export const useGetHatchingStatus = (eggId: number | null) => {
  return useQuery({
    queryKey: EGG_KEYS.status(eggId),
    queryFn: () => {
      if (!eggId) throw new Error("eggId is required");
      return eggApi.getHatchingStatus(eggId);
    },
    enabled: !!eggId,
    refetchInterval: 1000,
  });
};

export const useHatchEgg = () => {
  const setCurrentPixegotchi = usePixegotchiStore((s) => s.setCurrent);
  const clearEgg = useEggStore((s) => s.clearEgg);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eggId: number) => {
      return eggApi.hatchEgg(eggId);
    },
    onSuccess: (data) => {
      clearEgg();
      setCurrentPixegotchi(data);
      queryClient.setQueryData(EGG_KEYS.hatching, null);
      queryClient.setQueryData(PIXEGOTCHI_KEYS.current, data);
      queryClient.setQueryData(PIXEGOTCHI_KEYS.details(data.id), data);
      queryClient.setQueryData<Pixegotchi[] | undefined>(
        PIXEGOTCHI_KEYS.all,
        (current) => {
          if (!current) return current;
          return current.some((pixegotchi) => pixegotchi.id === data.id)
            ? current.map((pixegotchi) =>
                pixegotchi.id === data.id ? data : pixegotchi,
              )
            : [data, ...current];
        },
      );
      queryClient.invalidateQueries({ queryKey: EGG_KEYS.all });
      queryClient.invalidateQueries({ queryKey: EGG_KEYS.hatching });
    },
  });
};

export const useCancelHatchingEgg = () => {
  const clearEgg = useEggStore((s) => s.clearEgg);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eggId: number) => {
      return eggApi.cancelHatching(eggId);
    },
    onSuccess: () => {
      clearEgg();
      queryClient.setQueryData(EGG_KEYS.hatching, null);
      queryClient.invalidateQueries({ queryKey: EGG_KEYS.all });
      queryClient.invalidateQueries({ queryKey: EGG_KEYS.hatching });
    },
  });
};
