import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pixegotchiApi } from "@/services/api/pixegotchi.api";
import { usePixegotchiStore } from "@/store/pixegotchi.store";
import { Pixegotchi } from "@pixegotchi/shared";

export const useAllPixegotchi = () => {
  return useQuery({
    queryKey: ["allPixegotchi"],
    queryFn: pixegotchiApi.getAll,
  });
};

export const usePixegotchiById = (id: number | null) => {
  return useQuery({
    queryKey: ["pixegotchi", id],
    queryFn: () => {
      if (!id) throw new Error("pixegotchi id is required");
      return pixegotchiApi.getById(id);
    },
    enabled: !!id,
  });
};

export const useActivePixegotchi = () => {
  return useQuery({
    queryKey: ["activePixegotchi"],
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
      queryClient.setQueryData(["activePixegotchi"], null);
      if (data) {
        queryClient.setQueryData(["pixegotchi", data.id], data);
        queryClient.setQueryData<Pixegotchi[] | undefined>(
          ["allPixegotchi"],
          (current) =>
            current?.map((pixegotchi) =>
              pixegotchi.id === data.id ? data : pixegotchi,
            ),
        );
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["vault"] }),
        queryClient.invalidateQueries({ queryKey: ["stats"] }),
      ]);
    },
  });
};
