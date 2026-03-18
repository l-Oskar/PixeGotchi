import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eggApi } from "../api/egg.api";
import { useEggStore } from "@/store/egg.store";
import { usePixegotchiStore } from "@/store/pixegotchi.store";
import { useUserStore } from "@/store/user.store";

export const EGG_KEYS = {
  all: ["eggs"] as const,
  hatching: ["hatchingEgg"] as const,
  tap: ["tap"] as const,
  details: (eggId: number | null) => ["egg", eggId] as const,
  status: (eggId: number | null) => ["egg", eggId, "status"] as const,
  create: ["createEgg"] as const,
};

export const useGetAllEggs = () => {
  const setAllEggs = useEggStore((s) => s.setAllEggs);
  return useQuery({
    queryKey: EGG_KEYS.all,
    queryFn: async () => {
      const allEggs = await eggApi.getAllEggs();
      setAllEggs(allEggs);
      return allEggs;
    },
  });
};

export const useGetById = (eggId: number | null) => {
  return useQuery({
    queryKey: EGG_KEYS.details(eggId),
    queryFn: () => eggApi.getEggById(eggId!),
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
      return data;
    },
  });
};

export const useStartHatching = () => {
  const setHatching = useEggStore((s) => s.setHatchingEgg);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eggId: number) => eggApi.startHatching(eggId!),
    onSuccess: (data) => {
      setHatching(data);
      queryClient.invalidateQueries({ queryKey: EGG_KEYS.all });
    },
  });
};

export const useBatchTap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eggId, tapCount }: { eggId: number; tapCount: number }) =>
      eggApi.batchTap(eggId, tapCount),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: EGG_KEYS.all });
      queryClient.invalidateQueries({ queryKey: EGG_KEYS.hatching });
      return data;
    },
  });
};

export const useGetHatchingStatus = (eggId: number | null) => {
  return useQuery({
    queryKey: EGG_KEYS.status(eggId),
    queryFn: () => eggApi.getHatchingStatus(eggId!),
    enabled: !!eggId,
    refetchInterval: 1000,
  });
};

export const useHatchEgg = () => {
  const setActivePixegotchi = usePixegotchiStore((s) => s.setActive);
  const hatchEgg = useEggStore((s) => s.hatchEgg);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eggId: number) => {
      return eggApi.hatchEgg(eggId!);
    },
    onSuccess: (data) => {
      hatchEgg();
      setActivePixegotchi(data);
      queryClient.invalidateQueries({ queryKey: EGG_KEYS.all });
      queryClient.invalidateQueries({ queryKey: EGG_KEYS.hatching });
    },
  });
};
