import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chestApi } from "../api/chest.api";

export const CHEST_KEYS = {
  all: ["chests"] as const,
  sorted: ["sorted_chests"] as const,
};

export const useGetAllChests = () => {
  return useQuery({
    queryKey: CHEST_KEYS.all,
    queryFn: chestApi.getAllChests,
  });
};

export const useGetSortedChests = () => {
  return useQuery({
    queryKey: CHEST_KEYS.sorted,
    queryFn: chestApi.getSortedChests,
  });
};

export const useGetRandomChest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chestApi.getRandomChest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CHEST_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CHEST_KEYS.sorted });
      return data;
    },
  });
};
