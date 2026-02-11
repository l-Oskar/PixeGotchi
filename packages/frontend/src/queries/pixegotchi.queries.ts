import { useQuery } from "@tanstack/react-query";
import { getPixegitchiById, getActivePixegotchi } from "@/api/pixegotchi.api";

export const usePixegitchiById = (id: string | null) => {
  return useQuery({
    queryKey: ["pixegitchi", id],
    queryFn: () => getPixegitchiById(id!),
    enabled: !!id,
  });
};

export const useActivePixegotchi = () => {
  return useQuery({
    queryKey: ["activePixegotchi"],
    queryFn: getActivePixegotchi,
  });
};
