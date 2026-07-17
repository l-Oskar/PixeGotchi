import type { PlayerMarketplaceListing } from "@pixegotchi/shared";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import ModalShell from "@/components/Modals/ModalShell";
import { multiplyMarketplaceMoney } from "./marketplace-money";

interface MarketplacePurchaseModalProps {
  listing: PlayerMarketplaceListing | null;
  isPending: boolean;
  onClose: () => void;
  onBuy: (quantity: number) => void;
}

const isStackListing = (listing: PlayerMarketplaceListing) =>
  listing.listingType === "item" || listing.listingType === "chest";

const MarketplacePurchaseModal = ({
  listing,
  isPending,
  onClose,
  onBuy,
}: MarketplacePurchaseModalProps) => {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [listing?.id]);

  if (!listing) return null;

  const stackListing = isStackListing(listing);
  const subtotal =
    multiplyMarketplaceMoney(listing.unitPrice, quantity) ?? "0";

  return (
    <ModalShell
      icon={<ShoppingCart size={18} />}
      isOpen
      onClose={onClose}
      title={stackListing ? "Choose quantity" : "Confirm purchase"}>
      <div className="space-y-3">
        <div className="pixel-panel-soft p-3">
          <div className="flex items-center justify-between gap-2 font-pixel text-[8px] leading-4">
            <span className="text-pixel-muted">Unit price</span>
            <span className="text-pixel-highlight">
              {listing.unitPrice} PGC
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2 font-pixel text-[8px] leading-4">
            <span className="text-pixel-muted">Available</span>
            <span className="text-pixel-ink">
              {listing.remainingQuantity}
            </span>
          </div>
        </div>

        {stackListing && (
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
                max={listing.remainingQuantity}
                min={1}
                onChange={(event) =>
                  setQuantity(
                    Math.min(
                      listing.remainingQuantity,
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
                  quantity >= listing.remainingQuantity || isPending
                }
                onClick={() => setQuantity((current) => current + 1)}
                type="button">
                +
              </button>
            </div>
          </div>
        )}

        <div className="pixel-panel-soft flex items-center justify-between gap-2 border-pixel-highlight/60 p-3 font-pixel">
          <span className="text-[8px] text-pixel-muted">Subtotal</span>
          <span className="text-[10px] text-pixel-highlight">
            {subtotal} PGC
          </span>
        </div>

        <div className={`grid gap-2 ${stackListing ? "grid-cols-2" : ""}`}>
          <button
            className="pixel-button min-h-10 px-2 font-pixel text-[8px] disabled:opacity-60"
            disabled={isPending}
            onClick={() => onBuy(quantity)}
            type="button">
            {isPending ? "BUYING..." : stackListing ? "BUY SOME" : "BUY"}
          </button>
          {stackListing && (
            <button
              className="pixel-button min-h-10 px-2 font-pixel text-[8px] text-pixel-highlight disabled:opacity-60"
              disabled={isPending}
              onClick={() => onBuy(listing.remainingQuantity)}
              type="button">
              BUY ALL
            </button>
          )}
        </div>
      </div>
    </ModalShell>
  );
};

export default MarketplacePurchaseModal;
