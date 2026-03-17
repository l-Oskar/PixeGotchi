import {
  useDetailedInventory,
  useUseItem,
} from "@/services/queries/inventory.queries";
import { useInventoryStore } from "@/store/inventory.store";
import { PageType } from "@shared";
import { useEffect, useState } from "react";
import ItemModal from "@/components/Inventory/ItemModal/ItemModal";

export interface InventoryPageProps {
  onNavigate?: (page: PageType) => void;
}

// InventoryPage
const InventoryPage: React.FC<InventoryPageProps> = () => {
  const getInventory = useDetailedInventory();
  const useItem = useUseItem();
  const inventory = useInventoryStore((s) => s.detailedInventory);

  const [selectedItem, setSelectedItem] = useState<{
    itemId: string;
    quantity: number;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {}, [getInventory.data]);

  const handleItemClick = (itemId: string, quantity: number) => {
    setSelectedItem({ itemId, quantity });
    setIsModalOpen(true);
  };

  const handleUseItem = async (itemId: string, quantity: number) => {
    useItem.mutate({ itemId, quantity });
    setIsModalOpen(false);
  };

  const currentItem = selectedItem
    ? inventory.find((i) => i.itemId === selectedItem.itemId)?.details
    : null;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Inventory</h1>

      {true ? "" : ""}
      <div className="grid grid-cols-3 gap-3">
        {inventory.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.itemId, item.quantity)}
            className="bg-white/5 hover:bg-white/10 rounded-2xl p-4 border border-white/10 transition flex flex-col items-center gap-2 group">
            <div className="text-4xl group-hover:scale-110 transition">
              {item.details?.iconUrl}
            </div>
            <div className="text-xs font-medium text-center">
              {item.details!.name}
            </div>
            <div className="text-xs text-white/60">×{item.quantity}</div>
          </button>
        ))}
      </div>

      <ItemModal
        item={currentItem!}
        quantity={selectedItem?.quantity ?? 0}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUse={handleUseItem}
      />
    </div>
  );
};

export default InventoryPage;
