import { useQuery } from "@tanstack/react-query";
import { pixegotchiApi } from "@/services/api/pixegotchi.api";

export const useAllPixegotchi = () => {
  return useQuery({
    queryKey: ["allPixegotchi"],
    queryFn: pixegotchiApi.getAll,
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
  return useQuery({
    queryKey: ["activePixegotchi"],
    queryFn: pixegotchiApi.getActive,
  });
};
