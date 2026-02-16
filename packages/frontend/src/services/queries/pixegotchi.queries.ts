import { useQuery } from "@tanstack/react-query";
import { pixegotchiApi } from "@/services/api/pixegotchi.api";
import { useAuthStore } from "@/store/auth.store";

export const useAllPixegitchi = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["allPixegotchi"],
    queryFn: pixegotchiApi.getAll,
    enabled: isAuthenticated,
  });
};

export const usePixegitchiById = (id: number | null) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["pixegitchi", id],
    queryFn: () => pixegotchiApi.getById(id!),
    enabled: !!id && isAuthenticated,
  });
};

export const useActivePixegotchi = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["activePixegotchi"],
    queryFn: pixegotchiApi.getActive,
    enabled: isAuthenticated,
  });
};
