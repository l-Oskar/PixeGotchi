import {
  EGG_CONSTANTS,
  ListingType,
  RARITY_BORDER_COLORS,
  type PageType,
  type PlayerMarketplaceListing,
  type RoomCosmeticsShopOffer,
} from "@pixegotchi/shared";
import { Plus, Store } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFeedbackModal } from "@/hooks/useFeedbackModal";
import {
  useBuyMarketplaceListing,
  useCancelMarketplaceListing,
  useMarketplaceConfig,
  useMarketplaceListings,
} from "@/services/queries/marketplace.queries";
import { useCreateEgg } from "@/services/queries/egg.queries";
import {
  usePurchaseRoomCosmetic,
  useRoomCosmeticsShop,
} from "@/services/queries/room-cosmetics.queries";
import { useUserStore } from "@/store/user.store";
import MarketplacePurchaseModal, {
  type MarketplacePurchaseOffer,
} from "./MarketplacePurchaseModal";
import MarketplaceSellModal from "./MarketplaceSellModal";
import MarketplaceTestOffers from "./MarketplaceTestOffers";

export interface MarketplacePageProps {
  onNavigate?: (page: PageType) => void;
}

type MarketplaceMode = "buy" | "sell";
type MarketplaceCategory = ListingType | "test";

interface CategoryOption {
  id: MarketplaceCategory;
  label: string;
}

type MarketplaceBuyCard =
  | {
      id: string;
      source: "official";
      officialKind: "egg";
      display: MarketplacePurchaseOffer;
    }
  | {
      id: string;
      source: "official";
      officialKind: "room";
      offer: RoomCosmeticsShopOffer;
      display: MarketplacePurchaseOffer;
    }
  | {
      id: string;
      source: "player";
      listing: PlayerMarketplaceListing;
      display: MarketplacePurchaseOffer;
    };

const CATEGORIES: CategoryOption[] = [
  { id: "test", label: "Test" },
  { id: ListingType.egg, label: "Eggs" },
  { id: ListingType.item, label: "Items" },
  { id: ListingType.chest, label: "Chests" },
  { id: ListingType.cosmetic, label: "Room" },
  { id: ListingType.pixegotchi, label: "Pixegotchis" },
];

const toAssetUrl = (path: string | null) => {
  if (!path) return null;
  if (/^(?:https?:|data:)/.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
};

const capitalize = (value: string) =>
  value.length > 0 ? `${value[0]?.toUpperCase()}${value.slice(1)}` : value;

const getListingTitle = (listing: PlayerMarketplaceListing) => {
  switch (listing.listingType) {
    case "egg":
      return `Element Egg #${listing.asset.id}`;
    case "item":
      return listing.asset.name;
    case "chest":
      return `${capitalize(listing.asset.chestType)} Chest`;
    case "cosmetic":
    case "pixegotchi":
      return listing.asset.name;
  }
};

const getListingSubtitle = (listing: PlayerMarketplaceListing) => {
  switch (listing.listingType) {
    case "egg":
      return "Unhatched egg";
    case "item":
      return `${listing.asset.itemType} · ${listing.asset.rarity}`;
    case "chest":
      return `${listing.asset.rarity} chest`;
    case "cosmetic":
      return `${listing.asset.slot} · ${listing.asset.rarity}`;
    case "pixegotchi":
      return `Lv. ${listing.asset.level} · ${listing.asset.rarity}`;
  }
};

const getListingRarity = (listing: PlayerMarketplaceListing) =>
  listing.listingType === "egg" ? "common" : listing.asset.rarity;

const getListingImage = (listing: PlayerMarketplaceListing) => {
  if (listing.listingType === "item") {
    return toAssetUrl(listing.asset.iconUrl);
  }
  if (listing.listingType === "cosmetic") {
    return toAssetUrl(listing.asset.assetUrl);
  }
  return null;
};

const getListingFallback = (listing: PlayerMarketplaceListing) => {
  switch (listing.listingType) {
    case "egg":
      return "🥚";
    case "chest":
      return "🎁";
    case "pixegotchi":
      return "✨";
    default:
      return "📦";
  }
};

const toPlayerDisplayOffer = (
  listing: PlayerMarketplaceListing,
): MarketplacePurchaseOffer => ({
  id: `player-${listing.id}`,
  title: getListingTitle(listing),
  subtitle: getListingSubtitle(listing),
  source: "player",
  seller: listing.seller.username ?? `User ${listing.seller.id}`,
  unitPrice: listing.unitPrice,
  remainingQuantity: listing.remainingQuantity,
  isStack: listing.listingType === "item" || listing.listingType === "chest",
  rarity: getListingRarity(listing),
  imageUrl: getListingImage(listing),
  fallbackIcon: getListingFallback(listing),
});

const OfferVisual = ({ offer }: { offer: MarketplacePurchaseOffer }) => (
  <div className="pixel-icon-box grid h-14 w-14 shrink-0 place-items-center overflow-hidden">
    {offer.imageUrl ? (
      <img
        alt={offer.title}
        className="pixelated h-12 w-12 object-contain"
        src={offer.imageUrl}
      />
    ) : (
      <span className="text-2xl">{offer.fallbackIcon}</span>
    )}
  </div>
);

const MarketplacePage: React.FC<MarketplacePageProps> = () => {
  const [mode, setMode] = useState<MarketplaceMode>("buy");
  const [category, setCategory] = useState<MarketplaceCategory>(
    ListingType.egg,
  );
  const [selectedBuyCard, setSelectedBuyCard] =
    useState<MarketplaceBuyCard | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  const user = useUserStore((state) => state.user);
  const listingType = category === "test" ? undefined : category;
  const configQuery = useMarketplaceConfig();
  const playerListings = useMarketplaceListings(
    listingType,
    false,
    mode === "buy" && listingType !== undefined,
  );
  const myListings = useMarketplaceListings(undefined, true, mode === "sell");
  const roomShop = useRoomCosmeticsShop();
  const createEgg = useCreateEgg();
  const purchaseRoomCosmetic = usePurchaseRoomCosmetic();
  const buyListing = useBuyMarketplaceListing();
  const cancelListing = useCancelMarketplaceListing();
  const { showSuccess, showError, showApiError } = useFeedbackModal();
  const maxActiveListings = configQuery.data?.maxActiveListings ?? 10;
  const activeListingCount = myListings.data?.listings.length ?? 0;

  useEffect(() => {
    setSelectedBuyCard(null);
  }, [category, mode]);

  const buyCards = useMemo<MarketplaceBuyCard[]>(() => {
    const cards: MarketplaceBuyCard[] = [];

    if (category === ListingType.egg) {
      cards.push({
        id: "official-egg",
        source: "official",
        officialKind: "egg",
        display: {
          id: "official-egg",
          title: "Element Egg",
          subtitle: "A new random element egg from the PixeGotchi Shop.",
          source: "official",
          seller: "PixeGotchi Shop",
          unitPrice: String(EGG_CONSTANTS.EGG_PRICE),
          remainingQuantity: 1,
          isStack: false,
          rarity: "common",
          fallbackIcon: "🥚",
        },
      });
    }

    if (category === ListingType.cosmetic) {
      for (const offer of roomShop.data?.offers ?? []) {
        cards.push({
          id: `official-room-${offer.asset.id}`,
          source: "official",
          officialKind: "room",
          offer,
          display: {
            id: `official-room-${offer.asset.id}`,
            title: offer.asset.name,
            subtitle: `${offer.asset.slot} · ${offer.asset.rarity}`,
            source: "official",
            seller: "PixeGotchi Shop",
            unitPrice: offer.pgcPrice,
            remainingQuantity: 1,
            isStack: false,
            rarity: offer.asset.rarity,
            imageUrl: toAssetUrl(offer.asset.assetUrl),
            fallbackIcon: "✨",
          },
        });
      }
    }

    for (const listing of playerListings.data?.listings ?? []) {
      cards.push({
        id: `player-${listing.id}`,
        source: "player",
        listing,
        display: toPlayerDisplayOffer(listing),
      });
    }

    return cards;
  }, [category, playerListings.data?.listings, roomShop.data?.offers]);

  const selectedAction = (() => {
    if (!selectedBuyCard) return "buy";
    if (
      selectedBuyCard.source === "official" &&
      selectedBuyCard.officialKind === "room" &&
      selectedBuyCard.offer.owned
    ) {
      return "owned";
    }
    if (
      selectedBuyCard.source === "player" &&
      selectedBuyCard.listing.seller.id === user?.id
    ) {
      return "cancel";
    }
    return "buy";
  })();

  const isSelectedPending = (() => {
    if (!selectedBuyCard) return false;
    if (selectedBuyCard.source === "player") {
      if (selectedAction === "cancel") {
        return (
          cancelListing.isPending &&
          cancelListing.variables?.listingId === selectedBuyCard.listing.id
        );
      }
      return (
        buyListing.isPending &&
        buyListing.variables?.listingId === selectedBuyCard.listing.id
      );
    }
    return selectedBuyCard.officialKind === "egg"
      ? createEgg.isPending
      : purchaseRoomCosmetic.isPending &&
          purchaseRoomCosmetic.variables?.cosmeticAssetId ===
            selectedBuyCard.offer.asset.id;
  })();

  const handlePlayerBuy = (
    listing: PlayerMarketplaceListing,
    quantity: number,
  ) => {
    buyListing.mutate(
      {
        listingId: listing.id,
        listingType: listing.listingType,
        quantity,
      },
      {
        onSuccess: () => {
          setSelectedBuyCard(null);
          showSuccess({
            message: `Purchase complete: ${quantity} item(s).`,
          });
        },
        onError: (error) => showApiError(error, { title: "Purchase failed" }),
      },
    );
  };

  const handleCancel = (listing: PlayerMarketplaceListing) => {
    cancelListing.mutate(
      {
        listingId: listing.id,
        listingType: listing.listingType,
      },
      {
        onSuccess: () => {
          setSelectedBuyCard(null);
          showSuccess({ message: "Listing cancelled and escrow returned." });
        },
        onError: (error) => showApiError(error, { title: "Cancel failed" }),
      },
    );
  };

  const handleOfficialBuy = (
    card: Extract<MarketplaceBuyCard, { source: "official" }>,
  ) => {
    if (card.officialKind === "egg") {
      createEgg.mutate(undefined, {
        onSuccess: () => {
          setSelectedBuyCard(null);
          showSuccess({ message: "You bought an egg!" });
        },
        onError: (error) =>
          showApiError(error, { title: "Egg purchase failed" }),
      });
      return;
    }

    purchaseRoomCosmetic.mutate(
      { cosmeticAssetId: card.offer.asset.id },
      {
        onSuccess: () => {
          setSelectedBuyCard(null);
          showSuccess({ message: `${card.offer.asset.name} purchased.` });
        },
        onError: (error) =>
          showApiError(error, { title: "Room purchase failed" }),
      },
    );
  };

  const handleSelectedAction = (quantity: number) => {
    if (!selectedBuyCard || selectedAction === "owned") return;
    if (selectedBuyCard.source === "official") {
      handleOfficialBuy(selectedBuyCard);
      return;
    }
    if (selectedAction === "cancel") {
      handleCancel(selectedBuyCard.listing);
      return;
    }
    handlePlayerBuy(selectedBuyCard.listing, quantity);
  };

  const openMyListing = (listing: PlayerMarketplaceListing) => {
    setSelectedBuyCard({
      id: `player-${listing.id}`,
      source: "player",
      listing,
      display: toPlayerDisplayOffer(listing),
    });
  };

  const handleOpenSellModal = () => {
    if (activeListingCount >= maxActiveListings) {
      showError({
        title: "Listing limit reached",
        message: `You already have the maximum of ${maxActiveListings} active listings. Cancel one before adding another.`,
      });
      return;
    }

    setIsSellModalOpen(true);
  };

  return (
    <div className="space-y-2.5 p-2.5">
      <section className="pixel-panel p-2.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="font-pixel text-sm leading-5 text-pixel-ink">
              Marketplace
            </h1>
            <p className="mt-1 font-pixel text-[7px] leading-3 text-pixel-muted">
              PixeGotchi Shop + player listings
            </p>
          </div>
          <div className="pixel-icon-box grid h-11 w-11 place-items-center text-pixel-highlight">
            <Store size={23} />
          </div>
        </div>

        <div className="pixel-panel-soft mt-3 grid grid-cols-2 gap-1 p-1">
          {(["buy", "sell"] as const).map((nextMode) => (
            <button
              className={`min-h-9 rounded-sm border px-3 font-pixel text-[9px] uppercase transition ${
                mode === nextMode
                  ? "border-pixel-highlight bg-pixel-highlight/20 text-pixel-highlight"
                  : "border-transparent text-pixel-muted"
              }`}
              key={nextMode}
              onClick={() => setMode(nextMode)}
              type="button">
              {nextMode}
            </button>
          ))}
        </div>

        {mode === "buy" && (
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((option) => (
              <button
                className={`pixel-button min-h-8 shrink-0 px-2.5 font-pixel text-[7px] ${
                  category === option.id
                    ? "border-pixel-highlight text-pixel-highlight"
                    : "text-pixel-muted"
                }`}
                key={option.id}
                onClick={() => setCategory(option.id)}
                type="button">
                {option.label}
              </button>
            ))}
          </div>
        )}
      </section>

      {mode === "buy" ? (
        category === "test" ? (
          <section className="pixel-panel p-2.5">
            <MarketplaceTestOffers />
          </section>
        ) : (
          <section className="pixel-panel p-2.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <h2 className="font-pixel text-[10px] leading-4 text-pixel-ink">
                  Buy {CATEGORIES.find((item) => item.id === category)?.label}
                </h2>
                <p className="mt-1 font-pixel text-[7px] leading-3 text-pixel-muted">
                  Tap an offer to view details
                </p>
              </div>
              <span className="pixel-panel-soft px-2 py-1 font-pixel text-[8px] text-pixel-highlight">
                {buyCards.length}
              </span>
            </div>

            {(playerListings.isLoading ||
              (category === ListingType.cosmetic && roomShop.isLoading)) &&
            buyCards.length === 0 ? (
              <div className="pixel-panel-soft p-5 text-center font-pixel text-[8px] text-pixel-muted">
                LOADING...
              </div>
            ) : playerListings.isError ? (
              <div className="pixel-panel-soft border-pixel-red/60 p-5 text-center font-pixel text-[8px] text-pixel-red">
                MARKETPLACE UNAVAILABLE
              </div>
            ) : buyCards.length === 0 ? (
              <div className="pixel-panel-soft p-5 text-center font-pixel text-[8px] text-pixel-muted">
                NO OFFERS IN THIS CATEGORY
              </div>
            ) : (
              <div className="space-y-2">
                {buyCards.map((card) => (
                  <button
                    className={`pixel-panel-soft flex w-full items-center gap-3 p-2 text-left transition hover:border-pixel-highlight ${
                      card.display.rarity
                        ? (RARITY_BORDER_COLORS[
                            card.display
                              .rarity as keyof typeof RARITY_BORDER_COLORS
                          ] ?? "")
                        : ""
                    }`}
                    key={card.id}
                    onClick={() => setSelectedBuyCard(card)}
                    type="button">
                    <OfferVisual offer={card.display} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate font-pixel text-[9px] leading-4 text-pixel-ink">
                          {card.display.title}
                        </h3>
                        <span
                          className={`shrink-0 rounded-sm border px-1.5 py-0.5 font-pixel text-[6px] uppercase ${
                            card.source === "official"
                              ? "border-pixel-green/60 text-pixel-green"
                              : "border-pixel-highlight/60 text-pixel-highlight"
                          }`}>
                          {card.source}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-pixel text-[7px] leading-3 text-pixel-muted">
                        {card.display.seller}
                      </p>
                      <p className="mt-1 truncate font-pixel text-[6px] capitalize leading-3 text-pixel-muted">
                        {card.display.subtitle}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-pixel text-[8px] text-pixel-highlight">
                        {card.display.unitPrice} PGC
                      </div>
                      <div className="mt-1 font-pixel text-[6px] text-pixel-muted">
                        ×{card.display.remainingQuantity}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )
      ) : (
        <section className="space-y-2.5">
          <div className="pixel-panel p-2.5">
            <button
              className="pixel-button flex min-h-12 w-full items-center justify-center gap-2 font-pixel text-[9px] text-pixel-highlight"
              onClick={handleOpenSellModal}
              type="button">
              <Plus size={17} />
              ADD LISTING
            </button>
          </div>

          <div className="pixel-panel p-2.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <h2 className="font-pixel text-[10px] text-pixel-ink">
                  My active listings
                </h2>
                <p className="mt-1 font-pixel text-[7px] text-pixel-muted">
                  Tap a listing to view or cancel
                </p>
              </div>
              <span className="pixel-panel-soft px-2 py-1 font-pixel text-[8px] text-pixel-highlight">
                {myListings.data?.listings.length ?? 0}
              </span>
            </div>

            {myListings.isLoading ? (
              <div className="pixel-panel-soft p-4 text-center font-pixel text-[8px] text-pixel-muted">
                LOADING...
              </div>
            ) : myListings.isError ? (
              <div className="pixel-panel-soft border-pixel-red/60 p-4 text-center font-pixel text-[8px] text-pixel-red">
                LISTINGS UNAVAILABLE
              </div>
            ) : myListings.data?.listings.length === 0 ? (
              <div className="pixel-panel-soft p-4 text-center font-pixel text-[8px] text-pixel-muted">
                NO ACTIVE LISTINGS
              </div>
            ) : (
              <div className="space-y-2">
                {myListings.data?.listings.map((listing) => {
                  const display = toPlayerDisplayOffer(listing);
                  return (
                    <button
                      className="pixel-panel-soft flex w-full items-center gap-3 p-2 text-left transition hover:border-pixel-highlight"
                      key={listing.id}
                      onClick={() => openMyListing(listing)}
                      type="button">
                      <OfferVisual offer={display} />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-pixel text-[8px] leading-4 text-pixel-ink">
                          {display.title}
                        </h3>
                        <p className="mt-1 font-pixel text-[6px] leading-3 text-pixel-muted">
                          {listing.remainingQuantity}/{listing.initialQuantity}{" "}
                          · expires{" "}
                          {new Date(listing.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="shrink-0 text-right font-pixel text-[8px] text-pixel-highlight">
                        {listing.unitPrice} PGC
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      <MarketplacePurchaseModal
        action={selectedAction}
        isPending={isSelectedPending}
        offer={selectedBuyCard?.display ?? null}
        onAction={handleSelectedAction}
        onClose={() => {
          if (!isSelectedPending) setSelectedBuyCard(null);
        }}
      />

      <MarketplaceSellModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
      />
    </div>
  );
};

export default MarketplacePage;
