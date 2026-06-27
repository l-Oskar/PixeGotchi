import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "../api/inventory.api";
import { ChestType, Pixegotchi } from "@pixegotchi/shared";
import { EGG_KEYS } from "./egg.queries";
import { usePixegotchiStore } from "@/store/pixegotchi.store";

export const useGetInventory = () => {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: inventoryApi.getAll,
  });
};

export const useDetailedInventory = () => {
  return useQuery({
    queryKey: ["detailed"],
    queryFn: inventoryApi.getDetailed,
  });
};

export const useAddItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity?: number;
    }) => {
      return inventoryApi.addItem(itemId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["detailed"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

export const useUseItem = () => {
  const queryClient = useQueryClient();
  const setActive = usePixegotchiStore((s) => s.setActive);
  return useMutation({
    mutationFn: ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => {
      return inventoryApi.useItem(itemId, quantity);
    },
    onSuccess: (data) => {
      setActive(data);
      queryClient.setQueryData(["activePixegotchi"], data);
      queryClient.setQueryData(["pixegotchi", data.id], data);
      queryClient.setQueryData<Pixegotchi[] | undefined>(
        ["allPixegotchi"],
        (current) =>
          current?.map((pixegotchi) =>
            pixegotchi.id === data.id ? data : pixegotchi,
          ),
      );
      queryClient.invalidateQueries({
        queryKey: ["detailed"],
      });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

export const useOpenChest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      chestType,
      quantity,
    }: {
      chestType: ChestType;
      quantity?: number;
    }) => {
      return await inventoryApi.openChest(chestType, quantity);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["detailed"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
        queryClient.invalidateQueries({ queryKey: ["chests"] }),
        queryClient.invalidateQueries({ queryKey: ["sorted_chests"] });
      if (data.egg) {
        queryClient.invalidateQueries({ queryKey: EGG_KEYS.all });
      }
    },
  });
};
