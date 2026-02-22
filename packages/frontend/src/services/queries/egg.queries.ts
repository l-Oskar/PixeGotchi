import { useQuery, useMutation } from "@tanstack/react-query";
import { eggApi } from "../api/egg.api";
import { useAuthStore } from "@/store/auth.store";

export const getAllEggs = async () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["allEggs"],
    queryFn: eggApi.getAllEggs,
    enabled: isAuthenticated,
  });
};

export const getById = async (id: number | null) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["egg", id],
    queryFn: () => eggApi.getEggById(id!),
    enabled: isAuthenticated && !!id,
  });
};

export const createEgg = async () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["createEgg"],
    queryFn: () => eggApi.createEgg(),
    enabled: isAuthenticated,
  });
};

export const startHatching = async (eggId: number | null) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useMutation({
    mutationKey: ["startHatching", eggId],
    mutationFn: () => eggApi.startHatching(eggId!),
  });
};

export const getHatchingStatus = async (eggId: number | null) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["eggHatchingStatus"],
    queryFn: () => eggApi.getHatchingStatus(eggId!),
    enabled: isAuthenticated,
  });
};
