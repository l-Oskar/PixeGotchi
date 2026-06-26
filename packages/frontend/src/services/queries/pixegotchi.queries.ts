import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pixegotchiApi } from "@/services/api/pixegotchi.api";
import { usePixegotchiStore } from "@/store/pixegotchi.store";

export const useAllPixegotchi = () => {
  const setAllPixegotchi = usePixegotchiStore((s) => s.setAllPixegotchi);
  return useQuery({
    queryKey: ["allPixegotchi"],
    queryFn: async () => {
      const allPixe = await pixegotchiApi.getAll();
      setAllPixegotchi(allPixe);
      return allPixe;
    },
  });
};

export const usePixegotchiById = (id: number | null) => {
  return useQuery({
    queryKey: ["pixegotchi", id],
    queryFn: () => pixegotchiApi.getById(id!),
    enabled: !!id,
  });
};

export const useActivePixegotchi = () => {
  const setActive = usePixegotchiStore((s) => s.setActive);
  return useQuery({
    queryKey: ["activePixegotchi"],
    queryFn: async () => {
      const activePixegotchi = await pixegotchiApi.getActive();
      if (activePixegotchi) setActive(activePixegotchi);
      return activePixegotchi;
    },
  });
};

export const usePixegotchiToVault = () => {
  const clearPixegotchi = usePixegotchiStore((s) => s.setToVault);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pixegotchiApi.setInActive,
    onSuccess: async () => {
      clearPixegotchi();
      queryClient.setQueryData(["activePixegotchi"], null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["activePixegotchi"] }),
        queryClient.invalidateQueries({ queryKey: ["vault"] }),
        queryClient.invalidateQueries({ queryKey: ["stats"] }),
      ]);
    },
  });
};
