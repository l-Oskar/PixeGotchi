import ItemModal from "@/components/Inventory/ItemModal/ItemModal";
import {
  useDetailedInventory,
  useUseItem,
} from "@/services/queries/inventory.queries";
import { useInventoryStore } from "@/store/inventory.store";
import { RARITY_BORDER_COLORS, RarityType } from "@shared";
import { useEffect, useState } from "react";

const ItemComponent: React.FC = () => {
  const getInventory = useDetailedInventory();
  const useItem = useUseItem();
  const inventory = useInventoryStore((s) => s.detailedInventory);

  const [selectedItem, setSelectedItem] = useState<{
    itemId: string;
    quantity: number;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentItem = selectedItem
    ? inventory.find((i) => i.itemId === selectedItem.itemId)?.details
    : null;
  useEffect(() => {}, [getInventory.data]);

  const handleItemClick = (itemId: string, quantity: number) => {
    setSelectedItem({ itemId, quantity });
    setIsModalOpen(true);
  };

  const handleUseItem = async (itemId: string, quantity: number) => {
    useItem.mutate({ itemId, quantity });
    setIsModalOpen(false);
  };

  return (
    <>
      <div>
        <div className="grid grid-cols-3 gap-3">
          {inventory.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.itemId, item.quantity)}
              className={`border ${RARITY_BORDER_COLORS[item.rarity]} bg-white/5 hover:bg-white/10 rounded-2xl p-4 transition flex flex-col items-center gap-2 group`}>
              <div className="text-4xl group-hover:scale-110 transition">
                {item.details?.iconUrl}
              </div>
              <div className="text-xs font-medium text-center">
                {item.details!.name}
              </div>
              <div className="text-xs text-white/60">{item.quantity}</div>
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
    </>
  );
};

export default ItemComponent;
