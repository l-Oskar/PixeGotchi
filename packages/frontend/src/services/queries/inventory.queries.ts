import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "../api/inventory.api";
import { ChestType, Pixegotchi } from "@pixegotchi/shared";
import { EGG_KEYS } from "./egg.queries";
import { usePixegotchiStore } from "@/store/pixegotchi.store";
import { CHEST_KEYS } from "./chest.queries";
import { PIXEGOTCHI_KEYS } from "./pixegotchi.queries";

export const INVENTORY_KEYS = {
  all: ["inventory"] as const,
  detailed: ["detailed"] as const,
};

export const useGetInventory = () => {
  return useQuery({
    queryKey: INVENTORY_KEYS.all,
    queryFn: inventoryApi.getAll,
  });
};

export const useDetailedInventory = () => {
  return useQuery({
    queryKey: INVENTORY_KEYS.detailed,
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
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.detailed });
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
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
      queryClient.setQueryData(PIXEGOTCHI_KEYS.active, data);
      queryClient.setQueryData(PIXEGOTCHI_KEYS.details(data.id), data);
      queryClient.setQueryData<Pixegotchi[] | undefined>(
        PIXEGOTCHI_KEYS.all,
        (current) =>
          current?.map((pixegotchi) =>
            pixegotchi.id === data.id ? data : pixegotchi,
          ),
      );
      queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.detailed,
      });
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
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
      return inventoryApi.openChest(chestType, quantity);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.detailed });
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CHEST_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CHEST_KEYS.sorted });
      if (data.egg) {
        queryClient.invalidateQueries({ queryKey: EGG_KEYS.all });
      }
    },
  });
};
