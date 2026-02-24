import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eggApi } from "../api/egg.api";
import { useEggStore } from "@/store/egg.store";
import { usePixegotchiStore } from "@/store/pixegotchi.store";

export const EGG_KEYS = {
  all: ["eggs"] as const,
  hatching: ["hatchingEgg"] as const,
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
  return useMutation({
    mutationFn: eggApi.createEgg,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: EGG_KEYS.all });
    },
  });
};

export const useStartHatching = () => {
  const setHatching = useEggStore((s) => s.setHatchingEgg);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eggId: number) => eggApi.startHatching(eggId!),
    onSuccess: (data) => {
      setHatching(data),
        queryClient.invalidateQueries({ queryKey: EGG_KEYS.all });
    },
  });
};

export const useGetHatchingStatus = (eggId: number | null) => {
  return useQuery({
    queryKey: EGG_KEYS.status(eggId),
    queryFn: () => eggApi.getHatchingStatus(eggId!),
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
      hatchEgg(),
        setActivePixegotchi(data),
        queryClient.invalidateQueries({ queryKey: EGG_KEYS.all });
    },
  });
};
