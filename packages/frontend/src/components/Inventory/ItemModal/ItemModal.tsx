import { usePixegotchiStore } from "@/store/pixegotchi.store";
import {
  Item,
  ItemBuffsType,
  ItemType,
  ITEM_COLORS,
  RARITY_COLORS,
  RARITY_STATS,
  getHappinessGainModifier,
} from "@pixegotchi/shared";
import { Heart, Apple, Zap, Smile, Droplets, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export interface ItemModalProps {
  item: Item | null;
  quantity: number;
  cooldownRemainingMinutes?: number;
  isOpen: boolean;
  canUseItem: boolean;
  disabledReason?: string;
  onClose: () => void;
  onUse: (itemId: string, quantity: number) => Promise<void>;
}

const STAT_PREVIEW = [
  {
    key: "hunger",
    label: "Hunger",
    icon: <Apple size={10} className={`${ITEM_COLORS.food}`} />,
  },
  {
    key: "health",
    label: "Health",
    icon: <Heart size={10} className={`${ITEM_COLORS.medicine}`} />,
  },
  {
    key: "cleanliness",
    label: "Cleanliness",
    icon: <Droplets size={10} className={`${ITEM_COLORS.cleaning}`} />,
  },
  {
    key: "happiness",
    label: "Happiness",
    icon: <Smile size={10} className={`${ITEM_COLORS.toy}`} />,
  },
  {
    key: "energy",
    label: "Energy",
    icon: <Zap size={10} className={`${ITEM_COLORS.boost}`} />,
  },
] as const;

const toStatNumber = (value: number | string | null | undefined) =>
  Number(value) || 0;

const clampStat = (value: number, maxStat: number) =>
  Math.min(maxStat, Math.max(0, value));

const formatStatValue = (value: number) =>
  (Math.round(value * 10) / 10).toString();

const ItemModal: React.FC<ItemModalProps> = ({
  item,
  quantity,
  cooldownRemainingMinutes = 0,
  isOpen,
  canUseItem,
  disabledReason,
  onClose,
  onUse,
}) => {
  const [useQuantity, setUseQuantity] = useState(1);
  const [isUsing, setIsUsing] = useState(false);
  const [displayCooldownRemaining, setDisplayCooldownRemaining] = useState(
    cooldownRemainingMinutes,
  );
  const currentPixegotchi = usePixegotchiStore((s) => s.currentPixegotchi);

  useEffect(() => {
    if (isOpen) {
      setUseQuantity(1);
    }
  }, [isOpen, item?.itemId]);

  useEffect(() => {
    setDisplayCooldownRemaining(cooldownRemainingMinutes);

    if (!isOpen || cooldownRemainingMinutes <= 0) return;

    const interval = window.setInterval(() => {
      setDisplayCooldownRemaining((current) => Math.max(0, current - 1));
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [cooldownRemainingMinutes, isOpen, item?.itemId]);

  if (!item) return null;

  // const maxQuantity = item.isStackable ? (item.maxStack ?? quantity) : 1;
  const effectiveUseQuantity = item.cooldownMinutes ? 1 : useQuantity;
  const maxStat = currentPixegotchi
    ? RARITY_STATS[currentPixegotchi.rarity].maxStat
    : 100;
  const isReviveItem = Boolean(
    item.effects?.buffs?.some((buff) => Boolean(buff[ItemBuffsType.REVIVE])),
  );
  const itemCooldownMinutes = item.cooldownMinutes || 0;
  const hasCooldown = itemCooldownMinutes > 0;
  const hasActiveCooldown = displayCooldownRemaining > 0;
  const statPreview = item.effects
    ? STAT_PREVIEW.map((stat) => {
        const currentValue = currentPixegotchi
          ? toStatNumber(currentPixegotchi[stat.key])
          : null;
        const effectValue =
          isReviveItem && stat.key === "health"
            ? 50 - toStatNumber(currentPixegotchi?.health)
            : item.effects?.[stat.key] || 0;
        const totalEffect =
          isReviveItem && stat.key === "health"
            ? effectValue
            : effectValue * effectiveUseQuantity;
        const happinessSource =
          item.itemType === ItemType.food
            ? "feed"
            : item.itemType === ItemType.toy
              ? "play"
              : "general";
        const traitModifier =
          stat.key === "happiness" &&
          effectValue > 0 &&
          currentPixegotchi
            ? getHappinessGainModifier(
                currentPixegotchi.traits,
                happinessSource,
              )
            : 1;
        const modifiedTotalEffect = totalEffect * traitModifier;
        const traitEffect = modifiedTotalEffect - totalEffect;
        const nextValue =
          currentValue === null
            ? null
            : isReviveItem && stat.key === "health"
              ? 50
              : clampStat(currentValue + modifiedTotalEffect, maxStat);

        return {
          ...stat,
          currentValue,
          nextValue,
          totalEffect: modifiedTotalEffect,
          baseEffect: totalEffect,
          traitEffect,
        };
      }).filter((stat) => stat.totalEffect !== 0)
    : [];
  const canUse =
    canUseItem &&
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
            className="theme-modal-backdrop fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
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
              {item.effects && statPreview.length > 0 && (
                <div className="pixel-panel-soft mb-4 p-3">
                  <h3 className="mb-2 font-pixel text-[9px] leading-4 text-pixel-ink">
                    Effects:
                  </h3>
                  <div className="grid gap-2 font-pixel text-[9px] leading-3">
                    {statPreview.map((stat) => (
                      <div
                        key={stat.key}
                        className="grid grid-cols-[auto_1fr_auto] items-center gap-1">
                        <span>{stat.icon}</span>
                        <span>
                          <span className="text-pixel-muted">{stat.label}</span>{" "}
                          <span
                            className={
                              stat.baseEffect > 0
                                ? "text-pixel-green"
                                : "text-pixel-red"
                            }>
                            ({stat.baseEffect > 0 ? "+" : ""}
                            {formatStatValue(stat.baseEffect)})
                          </span>
                          {stat.traitEffect !== 0 && (
                            <span className="text-pixel-blue">
                              {" "}(trait {stat.traitEffect > 0 ? "+" : ""}
                              {formatStatValue(stat.traitEffect)})
                            </span>
                          )}
                          <span className="text-pixel-muted">:</span>
                        </span>
                        <span className="text-right">
                          {stat.currentValue === null ||
                          stat.nextValue === null ? (
                            <span
                              className={
                                stat.traitEffect !== 0
                                  ? "text-pixel-blue"
                                  : stat.totalEffect > 0
                                    ? "text-pixel-green"
                                    : "text-pixel-red"
                              }>
                              {stat.totalEffect > 0 ? "+" : ""}
                              {formatStatValue(stat.totalEffect)}
                            </span>
                          ) : (
                            <>
                              <span className="text-pixel-muted">
                                {formatStatValue(stat.currentValue)}
                              </span>
                              <span className="text-pixel-muted"> → </span>
                              <span
                                className={
                                  stat.traitEffect !== 0
                                    ? "text-pixel-blue"
                                    : stat.nextValue >= stat.currentValue
                                      ? "text-pixel-green"
                                      : "text-pixel-red"
                                }>
                                {formatStatValue(stat.nextValue)}
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="mb-4 flex items-center justify-between gap-2 font-pixel text-[8px] leading-4 text-pixel-muted">
                <span>Quantity: ×{quantity}</span>
                <span>
                  Cooldown: {itemCooldownMinutes} min.
                </span>
              </div>

              {hasCooldown && (
                <div
                  className={`pixel-panel-soft mb-4 px-3 py-2 font-pixel text-[8px] leading-4 ${
                    hasActiveCooldown ? "text-pixel-orange" : "text-pixel-green"
                  }`}>
                  {hasActiveCooldown
                    ? `Available in ${displayCooldownRemaining} min.`
                    : "Available now"}
                </div>
              )}

              {!canUseItem && disabledReason && (
                <div className="pixel-panel-soft mb-4 border-pixel-orange/70 px-3 py-2 font-pixel text-[8px] leading-4 text-pixel-orange">
                  {disabledReason}
                </div>
              )}

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
                      disabled={isUsing || !canUseItem}>
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
                      disabled={isUsing || !canUseItem}>
                      +
                    </button>
                  </div>
                )}

              {/* Use Button */}
              <button
                onClick={handleUse}
                disabled={!canUse}
                className="pixel-button w-full bg-pixel-green py-3 font-pixel text-[9px] leading-4 text-pixel-accent-ink hover:scale-105 disabled:bg-none disabled:text-pixel-muted disabled:hover:scale-100">
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
