import {
  ChestType,
  ChestInventory,
  ChestDescription,
  RARITY_COLORS,
  ITEMS_IMG,
} from "@shared";
import { motion, AnimatePresence } from "framer-motion";
import { ChestGenerator } from "../../../../../backend/src/utils/chest-generator";
import ChestItems from "./ChestItems";
import { X, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export interface ChestModalProps {
  chest: ChestInventory | null;
  quantity: number;
  isOpen: boolean;
  onClose: () => void;
  onUse: (chestType: ChestType, quantity: number) => Promise<void>;
}

const ChestModal: React.FC<ChestModalProps> = ({
  chest,
  quantity,
  isOpen,
  onClose,
  onUse,
}) => {
  const [useQuantity] = useState(1);
  const [isUsing, setIsUsing] = useState(false);
  const [chestDescription, setChestDescription] =
    useState<ChestDescription | null>(null);
  const [isItemPoolOpen, setIsItemPoolOpen] = useState(false);

  useEffect(() => {
    if (chest)
      setChestDescription(ChestGenerator.getChestDescription(chest.chestType));
  }, [chest]);

  if (!chest || !chestDescription) return null;
  // const maxQuantity = item.isStackable ? (item.maxStack ?? quantity) : 1;
  const canUse = useQuantity >= 1 && useQuantity <= quantity && !isUsing;

  const handleUse = async () => {
    if (!canUse) return;
    setIsUsing(true);
    try {
      await onUse(chest.chestType, useQuantity);
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
              className="bg-[#1a1a2e] rounded-3xl p-6 max-w-sm w-full mx-4 pointer-events-auto border border-white/10 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-5xl">
                    {ITEMS_IMG.chest[chest.chestType]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {`${chest.chestType.toUpperCase()} Chest`}
                    </h2>
                    <div className={`text-sm `}>
                      Rarity •{" "}
                      <span
                        className={`text-sm ${RARITY_COLORS[chestDescription.rarity]}`}>
                        {chestDescription?.rarity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition p-1">
                  <X size={24} />
                </button>
              </div>

              {/* Description */}
              {chestDescription && (
                <div className="grid gap-2 mb-4">
                  <p className="text-white/80 text-sm">
                    Egg chance: {chestDescription.eggChance}%
                  </p>
                  <p className="text-white/80 text-sm">
                    Boost item chance: {chestDescription.boostChance}%
                  </p>
                  <p className="text-white/80 text-sm">
                    Guaranteed items: {chestDescription.guaranteed_items}
                  </p>

                  {/* Згортаний ItemPool */}
                  <div className="mt-2">
                    <button
                      onClick={() => setIsItemPoolOpen(!isItemPoolOpen)}
                      className="flex items-center justify-between w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 transition group">
                      <span className="text-white/80 text-sm font-medium">
                        Item Pool (
                        {
                          ChestGenerator.getItemsWithProbabilities(
                            chest.chestType,
                          ).length
                        }{" "}
                        items)
                      </span>
                      <motion.div
                        animate={{ rotate: isItemPoolOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}>
                        <ChevronDown
                          size={18}
                          className="text-white/60 group-hover:text-white/80"
                        />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isItemPoolOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden mt-2">
                          <ChestItems
                            chest={chest}
                            chestItems={ChestGenerator.getItemsWithProbabilities(
                              chest.chestType,
                            )}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Effects */}
              {/* {chest.effects && (
                <div className="bg-white/5 rounded-2xl p-4 mb-4">
                  <h3 className="text-sm font-semibold text-white/80 mb-2">
                    Effects:
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {item.effects.hunger !== 0 && (
                      <div className="flex items-center gap-2">
                        <span>🍖</span>
                        <span className="text-white/60">Hunger:</span>
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
                        <span className="text-white/60">Happiness:</span>
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
                        <span className="text-white/60">Health:</span>
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
                        <span className="text-white/60">Cleanliness:</span>
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
                        <span className="text-white/60">Energy:</span>
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
              )} */}

              {/* Info */}
              {/* <div className="flex items-center justify-between text-sm text-white/60 mb-4">
                <span>Quantity: ×{quantity}</span>
                {item.cooldownMinutes && (
                  <span>Cooldown: {item.cooldownMinutes} min.</span>
                )}
              </div> */}

              {/* Quantity Selector */}
              {/* {item.isStackable && quantity > 1 && (
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-white/80 text-sm">Amount:</span>
                  <button
                    onClick={() => setUseQuantity(Math.max(1, useQuantity - 1))}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition"
                    disabled={isUsing}>
                    −
                  </button>
                  <span className="text-white font-bold w-8 text-center">
                    {useQuantity}
                  </span>
                  <button
                    onClick={() =>
                      setUseQuantity(Math.min(quantity, useQuantity + 1))
                    }
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition"
                    disabled={isUsing}>
                    +
                  </button>
                </div>
              )} */}

              {/* Use Button */}
              <button
                onClick={handleUse}
                disabled={!canUse}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-white/10 disabled:to-white/10 disabled:text-white/40 text-white font-bold transition-all active:scale-95">
                {isUsing ? "Using..." : "Use item"}
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChestModal;
