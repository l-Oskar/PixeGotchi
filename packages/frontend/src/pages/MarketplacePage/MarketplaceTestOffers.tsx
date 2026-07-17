import {
  CurrencyType,
  EGG_CONSTANTS,
  type TestMarketplaceListing,
} from "@pixegotchi/shared";
import { Package } from "lucide-react";
import { useState } from "react";
import { useFeedbackModal } from "@/hooks/useFeedbackModal";
import { useGetRandomChest } from "@/services/queries/chest.queries";
import { useCreateEgg } from "@/services/queries/egg.queries";
import { useAddItem } from "@/services/queries/inventory.queries";
import MarketplacePurchaseModal, {
  type MarketplacePurchaseOffer,
} from "./MarketplacePurchaseModal";

const TEST_LISTINGS: TestMarketplaceListing[] = [
  {
    id: 1,
    item: "Element Egg",
    itemId: "egg",
    price: EGG_CONSTANTS.EGG_PRICE,
    currency: CurrencyType.pgc,
    seller: "Pixegotchi",
    icon: "🥚",
  },
  {
    id: 2,
    item: "Apple",
    itemId: "apple",
    price: 0,
    currency: CurrencyType.pgc,
    seller: "Pixegotchi",
    icon: "🍎",
  },
  {
    id: 3,
    item: "Thermometer",
    itemId: "thermometer",
    price: 0,
    currency: CurrencyType.pgc,
    seller: "Pixegotchi",
    icon: "🌡",
  },
  {
    id: 4,
    item: "Water",
    itemId: "water",
    price: 0,
    currency: CurrencyType.pgc,
    seller: "Pixegotchi",
    icon: "💦",
  },
  {
    id: 5,
    item: "Small toy",
    itemId: "small_toy",
    price: 0,
    currency: CurrencyType.pgc,
    seller: "Pixegotchi",
    icon: "🪀",
  },
  {
    id: 6,
    item: "Coffee",
    itemId: "coffee",
    price: 0,
    currency: CurrencyType.pgc,
    seller: "Pixegotchi",
    icon: "☕️",
  },
  {
    id: 7,
    item: "Rare Candy",
    itemId: "rare_candy",
    price: 0,
    currency: CurrencyType.pgc,
    seller: "Pixegotchi",
    icon: "🍬",
  },
  {
    id: 8,
    item: "Revive Stone",
    itemId: "revive_stone",
    price: 0,
    currency: CurrencyType.pgc,
    seller: "Pixegotchi",
    icon: "💎",
  },
  {
    id: 9,
    item: "Random Chest",
    itemId: "chest",
    price: 0,
    currency: CurrencyType.pgc,
    seller: "Pixegotchi",
    icon: "🎁",
  },
];

const toDisplayOffer = (
  listing: TestMarketplaceListing,
): MarketplacePurchaseOffer => ({
  id: `test-${listing.id}`,
  title: listing.item,
  subtitle: "Temporary debug offer for development and testing.",
  source: "test",
  seller: listing.seller,
  unitPrice: String(listing.price),
  remainingQuantity: 1,
  isStack: false,
  fallbackIcon: listing.icon,
});

const MarketplaceTestOffers = () => {
  const [selectedListing, setSelectedListing] =
    useState<TestMarketplaceListing | null>(null);
  const createEgg = useCreateEgg();
  const addItem = useAddItem();
  const getRandomChest = useGetRandomChest();
  const { showSuccess, showApiError } = useFeedbackModal();

  const handleBuy = (listing: TestMarketplaceListing) => {
    if (listing.itemId === "egg") {
      createEgg.mutate(undefined, {
        onSuccess: () => {
          setSelectedListing(null);
          showSuccess({ message: "You bought an egg!" });
        },
        onError: (error) => showApiError(error, { title: "Egg fail" }),
      });
      return;
    }

    if (listing.itemId === "chest") {
      getRandomChest.mutate(undefined, {
        onSuccess: (data) => {
          setSelectedListing(null);
          showSuccess({
            message: `You received ${data.chestType} chest`,
          });
        },
        onError: (error) => showApiError(error, { title: "Chest fail" }),
      });
      return;
    }

    addItem.mutate(
      { itemId: listing.itemId, quantity: 1 },
      {
        onSuccess: () => {
          setSelectedListing(null);
          showSuccess({ message: `Item ${listing.itemId} purchased!` });
        },
        onError: (error) => showApiError(error, { title: "Item fail" }),
      },
    );
  };

  const isPending = (listing: TestMarketplaceListing | null) => {
    if (!listing) return false;
    if (listing.itemId === "egg") return createEgg.isPending;
    if (listing.itemId === "chest") return getRandomChest.isPending;
    return addItem.isPending;
  };

  return (
    <section>
      <div className="pixel-panel-soft mb-2 flex items-center gap-2 border-pixel-orange/60 p-2">
        <Package className="shrink-0 text-pixel-orange" size={16} />
        <p className="font-pixel text-[7px] leading-4 text-pixel-orange">
          TEST ONLY — REMOVE BEFORE PRODUCTION
        </p>
      </div>

      <div className="space-y-2">
        {TEST_LISTINGS.map((listing) => (
          <button
            className="pixel-panel-soft flex w-full items-center gap-3 p-2 text-left transition hover:border-pixel-orange"
            key={listing.id}
            onClick={() => setSelectedListing(listing)}
            type="button">
            <div className="pixel-icon-box grid h-14 w-14 shrink-0 place-items-center text-2xl">
              {listing.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-pixel text-[9px] leading-4 text-pixel-ink">
                {listing.item}
              </h3>
              <p className="mt-1 font-pixel text-[7px] leading-3 text-pixel-muted">
                debug offer
              </p>
            </div>
            <div className="shrink-0 text-right font-pixel text-[8px] text-pixel-highlight">
              {listing.price === 0
                ? "FREE"
                : `${listing.price} ${listing.currency.toUpperCase()}`}
            </div>
          </button>
        ))}
      </div>

      <MarketplacePurchaseModal
        action="buy"
        isPending={isPending(selectedListing)}
        offer={selectedListing ? toDisplayOffer(selectedListing) : null}
        onAction={() => {
          if (selectedListing) handleBuy(selectedListing);
        }}
        onClose={() => {
          if (!isPending(selectedListing)) setSelectedListing(null);
        }}
      />
    </section>
  );
};

export default MarketplaceTestOffers;
