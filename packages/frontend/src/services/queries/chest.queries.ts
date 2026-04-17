import { useQuery, useMutation } from "@tanstack/react-query";
import { chestApi } from "../api/chest.api";

export const getAllChests = () => {
  return useQuery({
    queryKey: ["chests"],
    queryFn: chestApi.getAllChests,
  });
};

export const getSortedChests = () => {
  return useQuery({
    queryKey: ["sorted_chests"],
    queryFn: chestApi.getSortedChests,
  });
};

export const getRandomChest = () => {
  return useMutation({
    mutationFn: chestApi.getRandomChest,
    onSuccess: (data) => {
      console.log(data);
    },
  });
};
