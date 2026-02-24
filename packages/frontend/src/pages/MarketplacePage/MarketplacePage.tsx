import { useCreateEgg } from "@/services/queries/egg.queries";
import {
  PageType,
  MarketplaceListing,
  CurrencyType,
  EGG_CONSTANTS,
} from "@shared";

export interface MarketplacePageProps {
  onNavigate?: (page: PageType) => void;
}

// MarketplacePage
const MarketplacePage: React.FC<MarketplacePageProps> = () => {
  const createEgg = useCreateEgg();

  const handleCreateEgg = () => {
    createEgg.mutate(undefined, {
      onSuccess: () => {
        // Можна показати toast або оновити UI
        alert("Egg created successfully!");
      },
      onError: (error) => {
        alert("Failed to create egg");
      },
    });
  };

  const listings: MarketplaceListing[] = [
    {
      id: 1,
      item: "Fire Egg",
      price: EGG_CONSTANTS.EGG_PRICE,
      currency: "PGC" as CurrencyType,
      seller: "Pixegotchi",
      icon: "🥚",
    },
    {
      id: 2,
      item: "Legendary Chest",
      price: 2,
      currency: "TON" as CurrencyType,
      seller: "User#456",
      icon: "📦",
    },
    {
      id: 3,
      item: "Health Pack x10",
      price: 150,
      currency: "PGC" as CurrencyType,
      seller: "User#789",
      icon: "💊",
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Marketplace</h1>

      <div className="space-y-3">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{listing.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold">{listing.item}</h3>
                <div className="text-xs text-white/60">by {listing.seller}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-yellow-400">
                  {listing.price} {listing.currency}
                </div>
                <button
                  onClick={handleCreateEgg}
                  className="mt-2 px-4 py-1.5 bg-linear-to-r from-purple-500 to-pink-500 rounded-full text-sm font-medium hover:scale-105 transition">
                  Buy
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketplacePage;
