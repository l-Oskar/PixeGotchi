import { useQuery, useMutation } from "@tanstack/react-query";
import { chestApi } from "../api/chest.api";
import { useInventoryStore } from "@/store/inventory.store";

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
  return useMutation({
    mutationFn: chestApi.getRandomChest,
    onSuccess: (data) => {
      console.log(data);
      return data;
    },
  });
};
