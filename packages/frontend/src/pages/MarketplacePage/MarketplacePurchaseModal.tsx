import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import ModalShell from "@/components/Modals/ModalShell";
import { multiplyMarketplaceMoney } from "./marketplace-money";

export interface MarketplacePurchaseOffer {
  id: string;
  title: string;
  subtitle: string;
  source: "official" | "player" | "test";
  seller: string;
  unitPrice: string;
  remainingQuantity: number;
  isStack: boolean;
  rarity?: string;
  imageUrl?: string | null;
  fallbackIcon: string;
}

interface MarketplacePurchaseModalProps {
  offer: MarketplacePurchaseOffer | null;
  isPending: boolean;
  action: "buy" | "cancel" | "owned";
  onClose: () => void;
  onAction: (quantity: number) => void;
}

const MarketplacePurchaseModal = ({
  offer,
  isPending,
  action,
  onClose,
  onAction,
}: MarketplacePurchaseModalProps) => {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [offer?.id]);

  if (!offer) return null;

  const canChooseQuantity = offer.isStack && action === "buy";
  const subtotal =
    multiplyMarketplaceMoney(offer.unitPrice, quantity) ?? "0";

  return (
    <ModalShell
      icon={<ShoppingCart size={18} />}
      isOpen
      onClose={onClose}
      title={offer.title}>
      <div className="space-y-3">
        <div className="pixel-panel-soft grid min-h-32 place-items-center overflow-hidden bg-pixel-bg-deep/45 p-3">
          {offer.imageUrl ? (
            <img
              alt={offer.title}
              className="pixelated h-28 w-28 object-contain"
              src={offer.imageUrl}
            />
          ) : (
            <span className="text-5xl">{offer.fallbackIcon}</span>
          )}
        </div>

        <div className="pixel-panel-soft space-y-2 p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-sm border px-2 py-1 font-pixel text-[7px] uppercase ${
                offer.source === "official"
                  ? "border-pixel-green/60 text-pixel-green"
                  : offer.source === "test"
                    ? "border-pixel-orange/60 text-pixel-orange"
                    : "border-pixel-highlight/60 text-pixel-highlight"
              }`}>
              {offer.source}
            </span>
            {offer.rarity && (
              <span className="pixel-pill px-2 py-1 font-pixel text-[7px] capitalize text-pixel-muted">
                {offer.rarity}
              </span>
            )}
          </div>
          <p className="font-pixel text-[8px] leading-4 text-pixel-muted">
            {offer.subtitle}
          </p>
          <div className="flex items-center justify-between gap-2 font-pixel text-[8px] leading-4">
            <span className="text-pixel-muted">Seller</span>
            <span className="truncate text-pixel-ink">{offer.seller}</span>
          </div>
          <div className="flex items-center justify-between gap-2 font-pixel text-[8px] leading-4">
            <span className="text-pixel-muted">Unit price</span>
            <span className="text-pixel-highlight">
              {offer.unitPrice === "0" ? "FREE" : `${offer.unitPrice} PGC`}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 font-pixel text-[8px] leading-4">
            <span className="text-pixel-muted">Available</span>
            <span className="text-pixel-ink">{offer.remainingQuantity}</span>
          </div>
        </div>

        {canChooseQuantity && (
          <div>
            <label
              className="font-pixel text-[7px] leading-4 text-pixel-muted"
              htmlFor="marketplace-buy-quantity">
              QUANTITY
            </label>
            <div className="mt-1 grid grid-cols-[2.5rem_1fr_2.5rem] gap-2">
              <button
                className="pixel-button min-h-9 font-pixel text-[11px]"
                disabled={quantity <= 1 || isPending}
                onClick={() => setQuantity((current) => current - 1)}
                type="button">
                −
              </button>
              <input
                className="pixel-panel-soft min-w-0 text-center font-pixel text-[9px] text-pixel-ink"
                id="marketplace-buy-quantity"
                inputMode="numeric"
                max={offer.remainingQuantity}
                min={1}
                onChange={(event) =>
                  setQuantity(
                    Math.min(
                      offer.remainingQuantity,
                      Math.max(1, Number(event.target.value) || 1),
                    ),
                  )
                }
                type="number"
                value={quantity}
              />
              <button
                className="pixel-button min-h-9 font-pixel text-[11px]"
                disabled={
                  quantity >= offer.remainingQuantity || isPending
                }
                onClick={() => setQuantity((current) => current + 1)}
                type="button">
                +
              </button>
            </div>
          </div>
        )}

        {action === "buy" && (
          <div className="pixel-panel-soft flex items-center justify-between gap-2 border-pixel-highlight/60 p-3 font-pixel">
            <span className="text-[8px] text-pixel-muted">Subtotal</span>
            <span className="text-[10px] text-pixel-highlight">
              {subtotal === "0" ? "FREE" : `${subtotal} PGC`}
            </span>
          </div>
        )}

        {action === "owned" ? (
          <div className="pixel-panel-soft p-3 text-center font-pixel text-[8px] text-pixel-muted">
            YOU ALREADY OWN THIS ASSET
          </div>
        ) : (
          <div
            className={`grid gap-2 ${
              canChooseQuantity ? "grid-cols-2" : ""
            }`}>
            <button
              className={`pixel-button min-h-10 px-2 font-pixel text-[8px] disabled:opacity-60 ${
                action === "cancel" ? "text-pixel-red" : ""
              }`}
              disabled={isPending}
              onClick={() => onAction(quantity)}
              type="button">
              {isPending
                ? action === "cancel"
                  ? "CANCELLING..."
                  : "BUYING..."
                : action === "cancel"
                  ? "CANCEL LISTING"
                  : canChooseQuantity
                    ? "BUY SOME"
                    : "BUY"}
            </button>
            {canChooseQuantity && (
              <button
                className="pixel-button min-h-10 px-2 font-pixel text-[8px] text-pixel-highlight disabled:opacity-60"
                disabled={isPending}
                onClick={() => onAction(offer.remainingQuantity)}
                type="button">
                BUY ALL
              </button>
            )}
          </div>
        )}
      </div>
    </ModalShell>
  );
};

export default MarketplacePurchaseModal;
