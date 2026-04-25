import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chestApi } from "../api/chest.api";
import { useInventoryStore } from "@/store/inventory.store";

export const useGetAllChests = () => {
  const updateChests = useInventoryStore((s) => s.updateChests);
  return useQuery({
    queryKey: ["chests"],
    queryFn: async () => {
      const chests = await chestApi.getAllChests();
      updateChests(chests);
      return chests;
    },
  });
};

export const useGetSortedChests = () => {
  const updateSortedChests = useInventoryStore((s) => s.updateSortedChests);
  return useQuery({
    queryKey: ["sorted_chests"],
    queryFn: async () => {
      const sortedChests = await chestApi.getSortedChests();
      updateSortedChests(sortedChests);
      return sortedChests;
    },
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
