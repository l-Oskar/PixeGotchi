import { useCreateEgg } from "@/services/queries/egg.queries";
import { useAddItem } from "@/services/queries/inventory.queries";
import { useGetRandomChest } from "@/services/queries/chest.queries";
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

        <div className="space-y-2">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="pixel-panel-soft flex items-center gap-3 p-2">
              <div className="pixel-icon-box h-11 w-11 shrink-0 text-xl">
                {listing.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-pixel text-[10px] leading-4 text-pixel-ink">
                  {listing.item}
                </h3>
                <div className="mt-1 truncate font-pixel text-[8px] leading-3 text-pixel-muted">
                  by {listing.seller}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <div className="font-pixel text-[8px] leading-3 text-pixel-highlight">
                  {listing.price == 0
                    ? "Free"
                    : `${listing.price} ${listing.currency}`}
                </div>
                <button
                  onClick={() => {
                    handleBuy(listing);
                  }}
                  className="pixel-button min-h-0 px-3 py-2 font-pixel text-[8px] leading-3 hover:scale-105">
                  BUY
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
