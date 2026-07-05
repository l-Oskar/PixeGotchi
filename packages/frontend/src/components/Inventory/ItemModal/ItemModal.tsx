import { usePixegotchiStore } from "@/store/pixegotchi.store";
import { Item, ITEM_COLORS, RARITY_COLORS } from "@pixegotchi/shared";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export interface ItemModalProps {
  item: Item | null;
  quantity: number;
  isOpen: boolean;
  onClose: () => void;
  onUse: (itemId: string, quantity: number) => Promise<void>;
}

const ItemModal: React.FC<ItemModalProps> = ({
  item,
  quantity,
  isOpen,
  onClose,
  onUse,
}) => {
  const [useQuantity, setUseQuantity] = useState(1);
  const [isUsing, setIsUsing] = useState(false);
  const currentPixegotchi = usePixegotchiStore((s) => s.currentPixegotchi);

  useEffect(() => {
    if (isOpen) {
      setUseQuantity(1);
    }
  }, [isOpen, item?.itemId]);

  if (!item) return null;

  // const maxQuantity = item.isStackable ? (item.maxStack ?? quantity) : 1;
  const canUse =
    useQuantity >= 1 &&
    useQuantity <= quantity &&
    !isUsing &&
    currentPixegotchi;

  const handleUse = async () => {
    if (!canUse) return;
    setIsUsing(true);
    try {
      await onUse(item.itemId, useQuantity);
      onClose();
    } catch (error) {
      console.error("Failed to use item:", error);
    } finally {
      setIsUsing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <motion.div
              className="pixel-panel mx-4 w-full max-w-sm p-4 pointer-events-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="pixel-icon-box h-12 w-12 shrink-0 text-2xl">
                    {item.iconUrl}
                  </div>
                  <div>
                    <h2 className="font-pixel text-sm leading-5 text-pixel-ink">
                      {item.name}
                    </h2>
                    <div className="mt-1 font-pixel text-[8px] leading-3 text-pixel-muted">
                      <span className={`${RARITY_COLORS[item.rarity]}`}>
                        {item.rarity}
                      </span>{" "}
                      •{" "}
                      <span className={`${ITEM_COLORS[item.itemType]}`}>
                        {item.itemType}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="pixel-button grid h-8 w-8 place-items-center p-0 text-pixel-muted hover:text-pixel-ink">
                  <X size={16} />
                </button>
              </div>

              {/* Description */}
              {item.description && (
                <p className="mb-4 font-pixel text-[8px] leading-4 text-pixel-muted">
                  {item.description}
                </p>
              )}

              {/* Effects */}
              {item.effects && (
                <div className="pixel-panel-soft mb-4 p-3">
                  <h3 className="mb-2 font-pixel text-[9px] leading-4 text-pixel-ink">
                    Effects:
                  </h3>
                  <div className="grid grid-cols-2 gap-2 font-pixel text-[7px] leading-3">
                    {item.effects.hunger !== 0 && (
                      <div className="flex items-center gap-2">
                        <span>🍖</span>
                        <span className="text-pixel-muted">Hunger:</span>
                        <span
                          className={
                            item.effects.hunger > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }>
                          {item.effects.hunger > 0 ? "+" : ""}
                          {item.effects.hunger}
                        </span>
                      </div>
                    )}
                    {item.effects.happiness !== 0 && (
                      <div className="flex items-center gap-2">
                        <span>😊</span>
                        <span className="text-pixel-muted">Happiness:</span>
                        <span
                          className={
                            item.effects.happiness > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }>
                          {item.effects.happiness > 0 ? "+" : ""}
                          {item.effects.happiness}
                        </span>
                      </div>
                    )}
                    {item.effects.health !== 0 && (
                      <div className="flex items-center gap-2">
                        <span>❤️</span>
                        <span className="text-pixel-muted">Health:</span>
                        <span
                          className={
                            item.effects.health > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }>
                          {item.effects.health > 0 ? "+" : ""}
                          {item.effects.health}
                        </span>
                      </div>
                    )}
                    {item.effects.cleanliness !== 0 && (
                      <div className="flex items-center gap-2">
                        <span>✨</span>
                        <span className="text-pixel-muted">Cleanliness:</span>
                        <span
                          className={
                            item.effects.cleanliness > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }>
                          {item.effects.cleanliness > 0 ? "+" : ""}
                          {item.effects.cleanliness}
                        </span>
                      </div>
                    )}
                    {item.effects.energy !== 0 && (
                      <div className="flex items-center gap-2">
                        <span>⚡</span>
                        <span className="text-pixel-muted">Energy:</span>
                        <span
                          className={
                            item.effects.energy > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }>
                          {item.effects.energy > 0 ? "+" : ""}
                          {item.effects.energy}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="mb-4 flex items-center justify-between gap-2 font-pixel text-[8px] leading-4 text-pixel-muted">
                <span>Quantity: ×{quantity}</span>
                <span>
                  Cooldown: {item.cooldownMinutes ? item.cooldownMinutes : 0}{" "}
                  min.
                </span>
              </div>

              {/* Quantity Selector */}
              {item.isStackable &&
                item.cooldownMinutes == 0 &&
                quantity > 1 && (
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-pixel text-[8px] leading-4 text-pixel-muted">
                      Amount:
                    </span>
                    <button
                      onClick={() =>
                        setUseQuantity(Math.max(1, useQuantity - 1))
                      }
                      className="pixel-button grid h-8 w-8 place-items-center p-0 font-pixel text-[10px]"
                      disabled={isUsing}>
                      −
                    </button>
                    <span className="w-8 text-center font-pixel text-[10px] leading-4 text-pixel-ink">
                      {useQuantity}
                    </span>
                    <button
                      onClick={() =>
                        setUseQuantity(Math.min(quantity, useQuantity + 1))
                      }
                      className="pixel-button grid h-8 w-8 place-items-center p-0 font-pixel text-[10px]"
                      disabled={isUsing}>
                      +
                    </button>
                  </div>
                )}

              {/* Use Button */}
              <button
                onClick={handleUse}
                disabled={!canUse}
                className="pixel-button w-full bg-linear-to-br from-green-500 to-emerald-600 py-3 font-pixel text-[9px] leading-4 text-white hover:scale-105 disabled:bg-none disabled:text-pixel-muted disabled:hover:scale-100">
                {isUsing ? "Using..." : "Use item"}
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ItemModal;
