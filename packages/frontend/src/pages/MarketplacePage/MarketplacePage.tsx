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
      price: 100,
      currency: "PGC" as CurrencyType,
      seller: "Pixegotchi",
      icon: "🍎",
    },
    {
      id: 3,
      item: "Thermometer",
      itemId: "thermometer",
      price: 100,
      currency: "PGC" as CurrencyType,
      seller: "Pixegotchi",
      icon: "🌡",
    },
    {
      id: 4,
      item: "Water",
      itemId: "water",
      price: 100,
      currency: "PGC" as CurrencyType,
      seller: "Pixegotchi",
      icon: "💦",
    },
    {
      id: 5,
      item: "Small toy",
      itemId: "small_toy",
      price: 100,
      currency: "PGC" as CurrencyType,
      seller: "Pixegotchi",
      icon: "🪀",
    },
    {
      id: 6,
      item: "Coffee",
      itemId: "coffee",
      price: 100,
      currency: "PGC" as CurrencyType,
      seller: "Pixegotchi",
      icon: "☕️",
    },
    {
      id: 7,
      item: "Rare Candy",
      itemId: "rare_candy",
      price: 200,
      currency: "PGC" as CurrencyType,
      seller: "Pixegotchi",
      icon: "🍬",
    },
    {
      id: 8,
      item: "Revive Stone",
      itemId: "revive_stone",
      price: 500,
      currency: "PGC" as CurrencyType,
      seller: "Pixegotchi",
      icon: "💎",
    },
    {
      id: 9,
      item: "Random Chest",
      itemId: "chest",
      price: 500,
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
    <div className="space-y-2.5 p-2.5">
      <div className="pixel-panel p-2.5">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <h1 className="font-pixel text-sm leading-5 text-pixel-ink">
            Marketplace
          </h1>
          <span className="theme-readable-muted font-pixel text-[8px] leading-3">
            PGC shop
          </span>
        </div>

        <div className="pixel-panel-soft overflow-hidden border-pixel-highlight/60 bg-linear-to-br from-pixel-highlight/20 via-pixel-surface-soft to-pixel-bg-deep p-3">
          <div className="flex items-center justify-between gap-2.5">
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center gap-2">
                <ShoppingBag className="text-pixel-highlight" size={15} />
                <span className="font-pixel text-[9px] leading-3 text-pixel-ink">
                  Pixegotchi Shop
                </span>
              </div>
              <div className="font-pixel text-xl leading-7 text-pixel-ink">
                {listings.length} items
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <span className="rounded-sm border border-pixel-border/40 bg-pixel-surface-soft/85 px-2 py-1 font-pixel text-[7px] leading-3 text-pixel-ink">
                  {freeListingsCount} free
                </span>
                <span className="rounded-sm border border-pixel-border/40 bg-pixel-surface-soft/85 px-2 py-1 font-pixel text-[7px] leading-3 text-pixel-ink">
                  PGC market
                </span>
              </div>
            </div>

            <div className="pixel-panel-soft grid h-16 w-16 shrink-0 place-items-center border-pixel-highlight/50 bg-pixel-bg-deep/40 shadow-pixel-inset">
              <div className="relative grid h-12 w-12 place-items-center">
                <Sparkles
                  className="absolute right-0 top-0 text-pixel-highlight"
                  size={10}
                />
                <Package className="text-pixel-ink" size={28} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="font-pixel text-[10px] leading-4 text-pixel-ink">
              Featured Items
            </h2>
            <div className="theme-readable-muted mt-1 font-pixel text-[7px] leading-3">
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
                className="pixel-panel-soft flex min-h-36 flex-col overflow-hidden bg-linear-to-b from-pixel-surface-soft to-pixel-bg-deep/60 p-2 max-[380px]:min-h-32 max-[380px]:p-1.5">
                <div className="grid h-16 place-items-center max-[380px]:h-13">
                  <div className="pixel-icon-box h-13 w-13 text-2xl max-[380px]:h-11 max-[380px]:w-11">
                    {listing.icon}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-pixel text-[9px] leading-3 text-pixel-ink max-[380px]:text-[8px]">
                    {listing.item}
                  </h3>
                  <div className="mt-1 truncate font-pixel text-[7px] leading-3 text-pixel-ink/80">
                    by {listing.seller}
                  </div>
                </div>

                <div className="mt-1.5 flex items-center justify-between gap-1.5 max-[380px]:mt-1 max-[380px]:gap-1">
                  <div className="rounded-sm border border-pixel-highlight/50 bg-pixel-surface-soft/90 px-1.5 py-1 font-pixel text-[7px] leading-3 text-pixel-highlight max-[380px]:px-1 max-[380px]:py-0.5">
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
                    className="pixel-button min-h-0 px-2.5 py-1.5 font-pixel text-[10px] leading-3 hover:scale-105 disabled:cursor-wait disabled:opacity-70 disabled:hover:scale-100 max-[380px]:px-2 max-[380px]:py-1">
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
