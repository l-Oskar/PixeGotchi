import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "../api/inventory.api";
import { useInventoryStore } from "@/store/inventory.store";

export const useGetInventory = () => {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: inventoryApi.getAll,
  });
};

export const useDetailedInventory = () => {
  const updateDetailed = useInventoryStore((s) => s.updateInventory);
  return useQuery({
    queryKey: ["detailed"],
    queryFn: async () => {
      const inventory = await inventoryApi.getDetailed();
      updateDetailed(inventory);
      return inventory;
    },
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
    },
  });
};

export const useUseItem = () => {
  const queryClient = useQueryClient();
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["detailed"],
      }),
        queryClient.invalidateQueries({
          queryKey: ["activePixegotchi"],
        });
    },
  });
};
