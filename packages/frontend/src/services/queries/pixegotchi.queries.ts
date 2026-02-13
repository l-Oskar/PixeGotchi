import { useQuery } from "@tanstack/react-query";
import { pixegotchiApi } from "@/services/api/pixegotchi.api";

export const useAllPixegitchi = () => {
  return useQuery({
    queryKey: ["allPixegotchi"],
    queryFn: pixegotchiApi.getAll,
  });
};

export const usePixegitchiById = (id: number | null) => {
  return useQuery({
    queryKey: ["pixegitchi", id],
    queryFn: () => pixegotchiApi.getById(id!),
    enabled: !!id,
  });
};

export const useActivePixegotchi = () => {
  return useQuery({
    queryKey: ["activePixegotchi"],
    queryFn: pixegotchiApi.getActive,
  });
};
