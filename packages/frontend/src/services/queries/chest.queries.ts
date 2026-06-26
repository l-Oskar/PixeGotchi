import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chestApi } from "../api/chest.api";

export const useGetAllChests = () => {
  return useQuery({
    queryKey: ["chests"],
    queryFn: chestApi.getAllChests,
  });
};

export const useGetSortedChests = () => {
  return useQuery({
    queryKey: ["sorted_chests"],
    queryFn: chestApi.getSortedChests,
  });
};

export const useGetRandomChest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chestApi.getRandomChest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chests"] });
      queryClient.invalidateQueries({ queryKey: ["sorted_chests"] });
      return data;
    },
  });
};
