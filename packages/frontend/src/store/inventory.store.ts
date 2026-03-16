import { InventoryItem, InventoryWithDetails } from '@shared'
import {create} from 'zustand'

interface InventoryStore{
    inventory: InventoryItem[] | null,
    detailedInventory: InventoryWithDetails[] | null,
}

export const useInventoryStore = create<InventoryStore>((set) => ({
    inventory: null,
    detailedInventory: null,
}))