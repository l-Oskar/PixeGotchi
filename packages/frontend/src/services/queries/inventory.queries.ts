import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "../api/inventory.api";

export const useGetInventory = () => {
    return useQuery({
        queryKey: ['inventory'],
        queryFn: inventoryApi.getAll,
    })
}

export const useDetailedInventory = () => {
    return useQuery({
        queryKey: ['detailed'],
        queryFn: async () => {
            const inventory = inventoryApi.getDetailed();
            return inventory
        }
    })
}