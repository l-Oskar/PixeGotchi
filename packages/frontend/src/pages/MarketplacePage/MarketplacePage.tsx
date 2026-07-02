import { useCreateEgg } from "@/services/queries/egg.queries";
import { useAddItem } from "@/services/queries/inventory.queries";
import { useGetRandomChest } from "@/services/queries/chest.queries";
import { Package, ShoppingBag, Sparkles } from "lucide-react";
import {
  PageType,
  MarketplaceListing,
  CurrencyType,
  EGG_CONSTANTS,
} from "@pixegotchi/shared";

export interface MarketplacePageProps {
  onNavigate?: (page: PageType) => void;
}

const MarketplacePage: React.FC<MarketplacePageProps> = () => {
  const createEgg = useCreateEgg();
  const addItem = useAddItem();
  const getRandomChest = useGetRandomChest();

  const handleCreateEgg = () => {
    createEgg.mutate(undefined, {
      onSuccess: () => {
        alert("You bought an egg!");
      },
      onError: (error) => {
        alert("Failed to create egg" + error);
      },
    });
  };

  const handleAddItem = (itemId: string, quantity?: number) => {
    addItem.mutate(
      { itemId, quantity },
      {
        onSuccess: () => {
          alert(`Item ${itemId} purchased!`);
        },
        onError: (error) => {
          console.log("Failed to add item: " + error);
        },
      },
    );
  };

  const handleGetRandomChest = () => {
    getRandomChest.mutate(undefined, {
      onSuccess: (data) => {
        alert(`You received ${data.chestType} chest`);
      },
    });
  };

  const handleBuy = (listing: MarketplaceListing) => {
    switch (listing.itemId) {
      case "egg":
        handleCreateEgg();
        break;
      case "chest":
        handleGetRandomChest();
        break;
      default:
        handleAddItem(listing.itemId, 1);
    }
  };

  const listings: MarketplaceListing[] = [
    {
      id: 1,
      item: "Element Egg",
      itemId: "egg",
      price: EGG_CONSTANTS.EGG_PRICE,
      currency: "PGC" as CurrencyType,
      seller: "Pixegotchi",
      icon: "🥚",
    },
    {
      id: 2,
      item: "Apple",
      itemId: "apple",
      price: 0,
      currency: "PGC" as CurrencyType,
      seller: "Pixegotchi",
      icon: "🍎",
    },
    {
      id: 3,
      item: "Thermometer",
      itemId: "thermometer",
      price: 0,
      currency: "PGC" as CurrencyType,
      seller: "Pixegotchi",
      icon: "🌡",
    },
    {
      id: 4,
      item: "Water",
      itemId: "water",
      price: 0,
      currency: "PGC" as CurrencyType,
      seller: "Pixegotchi",
      icon: "💦",
    },
    {
      id: 5,
      item: "Small toy",
      itemId: "small_toy",
      price: 0,
      currency: "PGC" as CurrencyType,
      seller: "Pixegotchi",
      icon: "🪀",
    },
    {
      id: 6,
      item: "Coffee",
      itemId: "coffee",
      price: 0,
      currency: "PGC" as CurrencyType,
      seller: "Pixegotchi",
      icon: "☕️",
    },
    {
      id: 7,
      item: "Rare Candy",
      itemId: "rare_candy",
      price: 0,
      currency: "PGC" as CurrencyType,
      seller: "Pixegotchi",
      icon: "🍬",
    },
    {
      id: 8,
      item: "Random Chest",
      itemId: "chest",
      price: 0,
      currency: "PGC" as CurrencyType,
      seller: "Pixegotchi",
      icon: "🎁",
    },
  ];

  const freeListingsCount = listings.filter(
    (listing) => listing.price === 0,
  ).length;

  const getListingPending = (listing: MarketplaceListing) => {
    if (listing.itemId === "egg") {
      return createEgg.isPending;
    }

    if (listing.itemId === "chest") {
      return getRandomChest.isPending;
    }

    return addItem.isPending;
  };

  return (
    <div className="space-y-3 p-3">
      <div className="pixel-panel p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h1 className="font-pixel text-sm leading-5 text-pixel-ink">
            Marketplace
          </h1>
          <span className="font-pixel text-[8px] leading-3 text-pixel-muted">
            PGC shop
          </span>
        </div>

        <div className="pixel-panel-soft overflow-hidden border-pixel-highlight/60 bg-linear-to-br from-pixel-highlight/20 via-pixel-surface-soft to-pixel-bg-deep p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <ShoppingBag className="text-pixel-highlight" size={16} />
                <span className="font-pixel text-[10px] leading-4 text-pixel-ink">
                  Pixegotchi Shop
                </span>
              </div>
              <div className="font-pixel text-2xl leading-8 text-pixel-ink">
                {listings.length} items
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-sm border border-pixel-ink/15 bg-pixel-bg-deep/55 px-2 py-1 font-pixel text-[7px] leading-3 text-pixel-muted">
                  {freeListingsCount} free
                </span>
                <span className="rounded-sm border border-pixel-ink/15 bg-pixel-bg-deep/55 px-2 py-1 font-pixel text-[7px] leading-3 text-pixel-muted">
                  PGC market
                </span>
              </div>
            </div>

            <div className="pixel-panel-soft grid h-20 w-20 shrink-0 place-items-center border-pixel-highlight/50 bg-pixel-bg-deep/40 shadow-pixel-inset">
              <div className="relative grid h-14 w-14 place-items-center">
                <Sparkles
                  className="absolute right-0 top-0 text-pixel-highlight"
                  size={12}
                />
                <Package className="text-pixel-ink" size={34} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="font-pixel text-[11px] leading-4 text-pixel-ink">
              Featured Items
            </h2>
            <div className="mt-1 font-pixel text-[7px] leading-3 text-pixel-muted">
              Eggs, care items and chests
            </div>
          </div>
          <div className="pixel-panel-soft px-2 py-1 font-pixel text-[8px] leading-3 text-pixel-highlight">
            {listings.length}
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          {listings.map((listing) => {
            const isPending = getListingPending(listing);

            return (
              <div
                key={listing.id}
                className="pixel-panel-soft flex min-h-40 flex-col overflow-hidden bg-linear-to-b from-pixel-surface-soft to-pixel-bg-deep/60 p-2">
                <div className="grid h-20 place-items-center">
                  <div className="pixel-icon-box h-16 w-16 text-3xl">
                    {listing.icon}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-pixel text-[10px] leading-4 text-pixel-ink">
                    {listing.item}
                  </h3>
                  <div className="mt-1 truncate font-pixel text-[8px] leading-3 text-pixel-muted">
                    by {listing.seller}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="rounded-sm border border-pixel-highlight/35 bg-pixel-bg-deep/60 px-1.5 py-1 font-pixel text-[7px] leading-3 text-pixel-highlight">
                    {listing.price == 0
                      ? "Free"
                      : `${listing.price} ${listing.currency}`}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleBuy(listing);
                    }}
                    disabled={isPending}
                    className="pixel-button min-h-0 px-3 py-2 font-pixel text-[8px] leading-3 hover:scale-105 disabled:cursor-wait disabled:opacity-70 disabled:hover:scale-100">
                    {isPending ? "..." : "BUY"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
