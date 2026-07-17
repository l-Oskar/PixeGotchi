import {
  CurrencyType,
  EGG_CONSTANTS,
  type TestMarketplaceListing,
} from "@pixegotchi/shared";
import { Package } from "lucide-react";
import { useFeedbackModal } from "@/hooks/useFeedbackModal";
import { useGetRandomChest } from "@/services/queries/chest.queries";
import { useCreateEgg } from "@/services/queries/egg.queries";
import { useAddItem } from "@/services/queries/inventory.queries";

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

const MarketplaceTestOffers = () => {
  const createEgg = useCreateEgg();
  const addItem = useAddItem();
  const getRandomChest = useGetRandomChest();
  const { showSuccess, showApiError } = useFeedbackModal();

  const handleBuy = (listing: TestMarketplaceListing) => {
    if (listing.itemId === "egg") {
      createEgg.mutate(undefined, {
        onSuccess: () => showSuccess({ message: "You bought an egg!" }),
        onError: (error) => showApiError(error, { title: "Egg fail" }),
      });
      return;
    }

    if (listing.itemId === "chest") {
      getRandomChest.mutate(undefined, {
        onSuccess: (data) =>
          showSuccess({
            message: `You received ${data.chestType} chest`,
          }),
        onError: (error) => showApiError(error, { title: "Chest fail" }),
      });
      return;
    }

    addItem.mutate(
      { itemId: listing.itemId, quantity: 1 },
      {
        onSuccess: () =>
          showSuccess({ message: `Item ${listing.itemId} purchased!` }),
        onError: (error) => showApiError(error, { title: "Item fail" }),
      },
    );
  };

  const isPending = (listing: TestMarketplaceListing) => {
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

      <div className="grid grid-cols-2 gap-2">
        {TEST_LISTINGS.map((listing) => (
          <article
            className="pixel-panel-soft flex min-h-36 flex-col p-2"
            key={listing.id}>
            <div className="grid h-16 place-items-center">
              <div className="pixel-icon-box h-13 w-13 text-2xl">
                {listing.icon}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-pixel text-[9px] leading-3 text-pixel-ink">
                {listing.item}
              </h3>
              <p className="mt-1 truncate font-pixel text-[7px] leading-3 text-pixel-muted">
                debug offer
              </p>
            </div>
            <div className="mt-2 flex items-center justify-between gap-1">
              <span className="font-pixel text-[7px] text-pixel-highlight">
                {listing.price === 0
                  ? "FREE"
                  : `${listing.price} ${listing.currency.toUpperCase()}`}
              </span>
              <button
                className="pixel-button min-h-0 px-2 py-1.5 font-pixel text-[8px] disabled:opacity-60"
                disabled={isPending(listing)}
                onClick={() => handleBuy(listing)}
                type="button">
                {isPending(listing) ? "..." : "BUY"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default MarketplaceTestOffers;
