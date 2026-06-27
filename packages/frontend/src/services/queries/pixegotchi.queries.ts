import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pixegotchiApi } from "@/services/api/pixegotchi.api";
import { usePixegotchiStore } from "@/store/pixegotchi.store";
import { Pixegotchi } from "@pixegotchi/shared";
import { VAULT_KEYS } from "./vault.queries";

export const PIXEGOTCHI_KEYS = {
  all: ["allPixegotchi"] as const,
  active: ["activePixegotchi"] as const,
  details: (id: number | null) => ["pixegotchi", id] as const,
};

export const useAllPixegotchi = () => {
  return useQuery({
    queryKey: PIXEGOTCHI_KEYS.all,
    queryFn: pixegotchiApi.getAll,
  });
};

export const usePixegotchiById = (id: number | null) => {
  return useQuery({
    queryKey: PIXEGOTCHI_KEYS.details(id),
    queryFn: () => {
      if (!id) throw new Error("pixegotchi id is required");
      return pixegotchiApi.getById(id);
    },
    enabled: !!id,
  });
};

export const useActivePixegotchi = () => {
  return useQuery({
    queryKey: PIXEGOTCHI_KEYS.active,
    queryFn: pixegotchiApi.getActive,
  });
};

export const usePixegotchiToVault = () => {
  const clearPixegotchi = usePixegotchiStore((s) => s.setToVault);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pixegotchiApi.setInActive,
    onSuccess: async (data) => {
      clearPixegotchi();
      queryClient.setQueryData(PIXEGOTCHI_KEYS.active, null);
      if (data) {
        queryClient.setQueryData(PIXEGOTCHI_KEYS.details(data.id), data);
        queryClient.setQueryData<Pixegotchi[] | undefined>(
          PIXEGOTCHI_KEYS.all,
          (current) =>
            current?.map((pixegotchi) =>
              pixegotchi.id === data.id ? data : pixegotchi,
            ),
        );
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: VAULT_KEYS.all }),
        queryClient.invalidateQueries({ queryKey: VAULT_KEYS.stats }),
      ]);
    },
  });
};
