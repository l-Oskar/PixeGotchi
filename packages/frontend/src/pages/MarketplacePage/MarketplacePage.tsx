import {
  EGG_CONSTANTS,
  ListingType,
  RARITY_BORDER_COLORS,
  RARITY_COLORS,
  type CreateMarketplaceListingInput,
  type PageType,
  type PlayerMarketplaceListing,
  type RoomCosmeticsShopOffer,
  type SellableMarketplaceAsset,
} from "@pixegotchi/shared";
import {
  BadgeDollarSign,
  Box,
  Egg,
  Package,
  PawPrint,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useConfirmationModal } from "@/hooks/useConfirmationModal";
import { useFeedbackModal } from "@/hooks/useFeedbackModal";
import {
  useBuyMarketplaceListing,
  useCancelMarketplaceListing,
  useCreateMarketplaceListing,
  useMarketplaceConfig,
  useMarketplaceListings,
  useMarketplaceSellable,
} from "@/services/queries/marketplace.queries";
import { useCreateEgg } from "@/services/queries/egg.queries";
import {
  usePurchaseRoomCosmetic,
  useRoomCosmeticsShop,
} from "@/services/queries/room-cosmetics.queries";
import { useUserStore } from "@/store/user.store";
import MarketplacePurchaseModal from "./MarketplacePurchaseModal";
import MarketplaceTestOffers from "./MarketplaceTestOffers";
import { calculateMarketplaceSalePreview } from "./marketplace-money";

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
      listingType: "egg";
      title: string;
      subtitle: string;
      unitPrice: string;
      remainingQuantity: 1;
      officialKind: "egg";
    }
  | {
      id: string;
      source: "official";
      listingType: "cosmetic";
      title: string;
      subtitle: string;
      unitPrice: string;
      remainingQuantity: 1;
      officialKind: "room";
      offer: RoomCosmeticsShopOffer;
    }
  | {
      id: string;
      source: "player";
      listingType: ListingType;
      title: string;
      subtitle: string;
      unitPrice: string;
      remainingQuantity: number;
      listing: PlayerMarketplaceListing;
    };

const CATEGORIES: CategoryOption[] = [
  { id: ListingType.egg, label: "Eggs" },
  { id: ListingType.item, label: "Items" },
  { id: ListingType.chest, label: "Chests" },
  { id: ListingType.cosmetic, label: "Room" },
  { id: ListingType.pixegotchi, label: "Pixegotchis" },
  { id: "test", label: "Test" },
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
      return listing.asset.name;
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

const getSellableKey = (asset: SellableMarketplaceAsset) => {
  switch (asset.listingType) {
    case "egg":
      return `egg-${asset.asset.id}`;
    case "item":
      return `item-${asset.asset.itemId}`;
    case "chest":
      return `chest-${asset.asset.chestType}`;
    case "cosmetic":
      return `cosmetic-${asset.asset.id}`;
    case "pixegotchi":
      return `pixegotchi-${asset.asset.id}`;
  }
};

const getSellableTitle = (asset: SellableMarketplaceAsset) => {
  switch (asset.listingType) {
    case "egg":
      return `Element Egg #${asset.asset.id}`;
    case "item":
      return asset.asset.name;
    case "chest":
      return `${capitalize(asset.asset.chestType)} Chest`;
    case "cosmetic":
      return asset.asset.name;
    case "pixegotchi":
      return asset.asset.name;
  }
};

const getSellableRarity = (asset: SellableMarketplaceAsset) =>
  asset.listingType === "egg" ? "common" : asset.asset.rarity;

const buildCreateListingInput = (
  asset: SellableMarketplaceAsset,
  quantity: number,
  unitPrice: string,
): CreateMarketplaceListingInput => {
  switch (asset.listingType) {
    case "egg":
      return {
        listingType: "egg",
        eggId: asset.asset.id,
        unitPrice,
        currency: "pgc",
      };
    case "item":
      return {
        listingType: "item",
        itemId: asset.asset.itemId,
        quantity,
        unitPrice,
        currency: "pgc",
      };
    case "chest":
      return {
        listingType: "chest",
        chestType: asset.asset.chestType,
        quantity,
        unitPrice,
        currency: "pgc",
      };
    case "cosmetic":
      return {
        listingType: "cosmetic",
        cosmeticAssetId: asset.asset.id,
        unitPrice,
        currency: "pgc",
      };
    case "pixegotchi":
      return {
        listingType: "pixegotchi",
        pixegotchiId: asset.asset.id,
        unitPrice,
        currency: "pgc",
      };
  }
};

const AssetVisual = ({
  listing,
}: {
  listing: PlayerMarketplaceListing;
}) => {
  if (listing.listingType === "item" && listing.asset.iconUrl) {
    return (
      <img
        alt={listing.asset.name}
        className="h-full w-full object-contain pixelated"
        src={toAssetUrl(listing.asset.iconUrl) ?? undefined}
      />
    );
  }

  if (
    listing.listingType === "cosmetic" &&
    listing.asset.assetUrl
  ) {
    return (
      <img
        alt={listing.asset.name}
        className="h-full w-full object-contain pixelated"
        src={toAssetUrl(listing.asset.assetUrl) ?? undefined}
      />
    );
  }

  const fallback =
    listing.listingType === "egg"
      ? "🥚"
      : listing.listingType === "chest"
        ? "🎁"
        : listing.listingType === "pixegotchi"
          ? "✨"
          : "📦";
  return <span className="text-3xl">{fallback}</span>;
};

const SellableVisual = ({ asset }: { asset: SellableMarketplaceAsset }) => {
  if (asset.listingType === "item" && asset.asset.iconUrl) {
    return (
      <img
        alt={asset.asset.name}
        className="h-full w-full object-contain pixelated"
        src={toAssetUrl(asset.asset.iconUrl) ?? undefined}
      />
    );
  }
  if (asset.listingType === "cosmetic" && asset.asset.assetUrl) {
    return (
      <img
        alt={asset.asset.name}
        className="h-full w-full object-contain pixelated"
        src={toAssetUrl(asset.asset.assetUrl) ?? undefined}
      />
    );
  }
  return (
    <span className="text-2xl">
      {asset.listingType === "egg"
        ? "🥚"
        : asset.listingType === "chest"
          ? "🎁"
          : asset.listingType === "pixegotchi"
            ? "✨"
            : "📦"}
    </span>
  );
};

const MarketplacePage: React.FC<MarketplacePageProps> = () => {
  const [mode, setMode] = useState<MarketplaceMode>("buy");
  const [category, setCategory] =
    useState<MarketplaceCategory>(ListingType.egg);
  const [purchaseListing, setPurchaseListing] =
    useState<PlayerMarketplaceListing | null>(null);
  const [selectedAssetKey, setSelectedAssetKey] = useState("");
  const [sellQuantity, setSellQuantity] = useState(1);
  const [sellUnitPrice, setSellUnitPrice] = useState("100");

  const user = useUserStore((state) => state.user);
  const pgcBalance = Number(user?.pgcBalance ?? 0);
  const listingType =
    category === "test" ? undefined : category;
  const isBuyMarketEnabled = mode === "buy" && listingType !== undefined;
  const isSellMarketEnabled =
    mode === "sell" && listingType !== undefined;

  const configQuery = useMarketplaceConfig();
  const playerListings = useMarketplaceListings(
    listingType,
    false,
    isBuyMarketEnabled,
  );
  const sellableQuery = useMarketplaceSellable(
    listingType ?? ListingType.egg,
    isSellMarketEnabled,
  );
  const myListings = useMarketplaceListings(
    undefined,
    true,
    mode === "sell",
  );
  const roomShop = useRoomCosmeticsShop();
  const createEgg = useCreateEgg();
  const purchaseRoomCosmetic = usePurchaseRoomCosmetic();
  const createListing = useCreateMarketplaceListing();
  const buyListing = useBuyMarketplaceListing();
  const cancelListing = useCancelMarketplaceListing();
  const { confirm } = useConfirmationModal();
  const { showSuccess, showApiError } = useFeedbackModal();

  const commissionBps = configQuery.data?.commissionBps ?? 500;
  const selectedAsset =
    sellableQuery.data?.assets.find(
      (asset) => getSellableKey(asset) === selectedAssetKey,
    ) ?? null;
  const maxSellQuantity = selectedAsset?.maxQuantity ?? 1;
  const normalizedSellQuantity = Math.min(
    Math.max(1, sellQuantity),
    maxSellQuantity,
  );
  const salePreview = calculateMarketplaceSalePreview(
    sellUnitPrice,
    normalizedSellQuantity,
    commissionBps,
    configQuery.data?.minUnitPrice ?? "1",
    configQuery.data?.maxUnitPrice ?? "1000000000",
  );

  useEffect(() => {
    setSelectedAssetKey("");
    setSellQuantity(1);
    setPurchaseListing(null);
  }, [category, mode]);

  const buyCards = useMemo<MarketplaceBuyCard[]>(() => {
    const cards: MarketplaceBuyCard[] = [];

    if (category === ListingType.egg) {
      cards.push({
        id: "official-egg",
        source: "official",
        listingType: "egg",
        title: "Element Egg",
        subtitle: "Official PixeGotchi Shop",
        unitPrice: String(EGG_CONSTANTS.EGG_PRICE),
        remainingQuantity: 1,
        officialKind: "egg",
      });
    }

    if (category === ListingType.cosmetic) {
      for (const offer of roomShop.data?.offers ?? []) {
        cards.push({
          id: `official-room-${offer.asset.id}`,
          source: "official",
          listingType: "cosmetic",
          title: offer.asset.name,
          subtitle: `${offer.asset.slot} · ${offer.asset.rarity}`,
          unitPrice: offer.pgcPrice,
          remainingQuantity: 1,
          officialKind: "room",
          offer,
        });
      }
    }

    for (const listing of playerListings.data?.listings ?? []) {
      cards.push({
        id: `player-${listing.id}`,
        source: "player",
        listingType: listing.listingType,
        title: getListingTitle(listing),
        subtitle: getListingSubtitle(listing),
        unitPrice: listing.unitPrice,
        remainingQuantity: listing.remainingQuantity,
        listing,
      });
    }

    return cards;
  }, [category, playerListings.data?.listings, roomShop.data?.offers]);

  const handleCancel = async (listing: PlayerMarketplaceListing) => {
    const confirmed = await confirm({
      title: "Cancel listing?",
      message: `The remaining ${listing.remainingQuantity} item(s) will return to your inventory.`,
      tone: "warning",
      confirmLabel: "Cancel listing",
    });
    if (!confirmed) return;

    cancelListing.mutate(
      {
        listingId: listing.id,
        listingType: listing.listingType,
      },
      {
        onSuccess: () =>
          showSuccess({ message: "Listing cancelled and escrow returned." }),
        onError: (error) =>
          showApiError(error, { title: "Cancel failed" }),
      },
    );
  };

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
          setPurchaseListing(null);
          showSuccess({
            message: `Purchase complete: ${quantity} item(s).`,
          });
        },
        onError: (error) => showApiError(error, { title: "Purchase failed" }),
      },
    );
  };

  const handleOfficialBuy = (card: Extract<
    MarketplaceBuyCard,
    { source: "official" }
  >) => {
    if (card.officialKind === "egg") {
      createEgg.mutate(undefined, {
        onSuccess: () => showSuccess({ message: "You bought an egg!" }),
        onError: (error) => showApiError(error, { title: "Egg purchase failed" }),
      });
      return;
    }

    purchaseRoomCosmetic.mutate(
      { cosmeticAssetId: card.offer.asset.id },
      {
        onSuccess: () =>
          showSuccess({ message: `${card.offer.asset.name} purchased.` }),
        onError: (error) =>
          showApiError(error, { title: "Room purchase failed" }),
      },
    );
  };

  const handleCreateListing = () => {
    if (!selectedAsset || !salePreview) return;

    createListing.mutate(
      buildCreateListingInput(
        selectedAsset,
        normalizedSellQuantity,
        sellUnitPrice,
      ),
      {
        onSuccess: () => {
          setSelectedAssetKey("");
          setSellQuantity(1);
          showSuccess({ message: "Listing created. Asset moved to escrow." });
        },
        onError: (error) =>
          showApiError(error, { title: "Listing failed" }),
      },
    );
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
      </section>

      {category === "test" ? (
        <section className="pixel-panel p-2.5">
          {mode === "buy" ? (
            <MarketplaceTestOffers />
          ) : (
            <div className="pixel-panel-soft p-5 text-center">
              <Package
                className="mx-auto text-pixel-orange"
                size={24}
              />
              <p className="mt-3 font-pixel text-[8px] leading-4 text-pixel-muted">
                Test offers are available only in Buy.
              </p>
            </div>
          )}
        </section>
      ) : mode === "buy" ? (
        <section className="pixel-panel p-2.5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <h2 className="font-pixel text-[10px] leading-4 text-pixel-ink">
                Buy {CATEGORIES.find((item) => item.id === category)?.label}
              </h2>
              <p className="mt-1 font-pixel text-[7px] leading-3 text-pixel-muted">
                Official offers have no marketplace fee
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
            <div className="grid grid-cols-2 gap-2">
              {buyCards.map((card) => {
                const isOwnListing =
                  card.source === "player" &&
                  card.listing.seller.id === user?.id;
                const isOfficialOwned =
                  card.source === "official" &&
                  card.officialKind === "room" &&
                  card.offer.owned;
                const cannotAfford =
                  pgcBalance < Number(card.unitPrice);
                const isPending =
                  card.source === "official"
                    ? card.officialKind === "egg"
                      ? createEgg.isPending
                      : purchaseRoomCosmetic.isPending &&
                        purchaseRoomCosmetic.variables?.cosmeticAssetId ===
                          card.offer.asset.id
                    : (buyListing.isPending &&
                        buyListing.variables?.listingId === card.listing.id) ||
                      (cancelListing.isPending &&
                        cancelListing.variables?.listingId ===
                          card.listing.id);

                return (
                  <article
                    className={`pixel-panel-soft flex min-h-44 flex-col overflow-hidden p-2 ${
                      card.source === "player" &&
                      RARITY_BORDER_COLORS[getListingRarity(card.listing)]
                        ? RARITY_BORDER_COLORS[
                            getListingRarity(card.listing)
                          ]
                        : ""
                    }`}
                    key={card.id}>
                    <div className="mb-1 flex items-center justify-between gap-1">
                      <span
                        className={`rounded-sm border px-1.5 py-1 font-pixel text-[6px] uppercase ${
                          card.source === "official"
                            ? "border-pixel-green/60 text-pixel-green"
                            : "border-pixel-highlight/60 text-pixel-highlight"
                        }`}>
                        {card.source}
                      </span>
                      <span className="font-pixel text-[6px] text-pixel-muted">
                        ×{card.remainingQuantity}
                      </span>
                    </div>

                    <div className="grid h-16 place-items-center overflow-hidden rounded-sm bg-pixel-bg-deep/35 p-1">
                      {card.source === "official" ? (
                        card.officialKind === "egg" ? (
                          <span className="text-3xl">🥚</span>
                        ) : card.offer.asset.assetUrl ? (
                          <img
                            alt={card.offer.asset.name}
                            className="h-full w-full object-contain pixelated"
                            src={
                              toAssetUrl(card.offer.asset.assetUrl) ??
                              undefined
                            }
                          />
                        ) : (
                          <Sparkles
                            className="text-pixel-highlight"
                            size={26}
                          />
                        )
                      ) : (
                        <AssetVisual listing={card.listing} />
                      )}
                    </div>

                    <div className="mt-2 min-w-0 flex-1">
                      <h3 className="truncate font-pixel text-[9px] leading-3 text-pixel-ink">
                        {card.title}
                      </h3>
                      <p className="mt-1 truncate font-pixel text-[7px] leading-3 text-pixel-muted">
                        {card.source === "player"
                          ? `by ${
                              card.listing.seller.username ??
                              `User ${card.listing.seller.id}`
                            }`
                          : card.subtitle}
                      </p>
                      {card.source === "player" && (
                        <p className="mt-1 truncate font-pixel text-[6px] capitalize leading-3 text-pixel-muted">
                          {card.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="mt-2">
                      <div className="mb-1.5 font-pixel text-[8px] text-pixel-highlight">
                        {card.unitPrice} PGC / 1
                      </div>
                      <button
                        className="pixel-button min-h-9 w-full px-2 font-pixel text-[8px] disabled:opacity-60"
                        disabled={
                          isPending ||
                          isOfficialOwned ||
                          (!isOwnListing && cannotAfford)
                        }
                        onClick={() => {
                          if (card.source === "official") {
                            handleOfficialBuy(card);
                          } else if (isOwnListing) {
                            void handleCancel(card.listing);
                          } else {
                            setPurchaseListing(card.listing);
                          }
                        }}
                        type="button">
                        {isPending
                          ? "..."
                          : isOfficialOwned
                            ? "OWNED"
                            : isOwnListing
                              ? "CANCEL"
                              : cannotAfford
                                ? "NO PGC"
                                : "BUY"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-2.5">
          <div className="pixel-panel p-2.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-pixel text-[10px] leading-4 text-pixel-ink">
                  Choose asset
                </h2>
                <p className="mt-1 font-pixel text-[7px] leading-3 text-pixel-muted">
                  {sellableQuery.data?.activeListingCount ?? 0}/
                  {sellableQuery.data?.maxActiveListings ??
                    configQuery.data?.maxActiveListings ??
                    10}{" "}
                  active listings
                </p>
              </div>
              <ShoppingBag className="text-pixel-highlight" size={18} />
            </div>

            {sellableQuery.isLoading ? (
              <div className="pixel-panel-soft mt-2 p-5 text-center font-pixel text-[8px] text-pixel-muted">
                LOADING...
              </div>
            ) : sellableQuery.isError ? (
              <div className="pixel-panel-soft mt-2 border-pixel-red/60 p-5 text-center font-pixel text-[8px] text-pixel-red">
                SELLABLE ASSETS UNAVAILABLE
              </div>
            ) : sellableQuery.data?.assets.length === 0 ? (
              <div className="pixel-panel-soft mt-2 p-5 text-center font-pixel text-[8px] text-pixel-muted">
                NOTHING TO SELL IN THIS CATEGORY
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {sellableQuery.data?.assets.map((asset) => {
                  const key = getSellableKey(asset);
                  const selected = selectedAssetKey === key;
                  const rarity = getSellableRarity(asset);

                  return (
                    <button
                      className={`pixel-panel-soft min-h-32 p-2 text-left transition ${
                        selected
                          ? "border-pixel-highlight shadow-[0_0_12px_var(--color-pixel-glow)]"
                          : RARITY_BORDER_COLORS[rarity] ?? ""
                      }`}
                      key={key}
                      onClick={() => {
                        setSelectedAssetKey(key);
                        setSellQuantity(1);
                      }}
                      type="button">
                      <div className="grid h-14 place-items-center overflow-hidden rounded-sm bg-pixel-bg-deep/35 p-1">
                        <SellableVisual asset={asset} />
                      </div>
                      <div className="mt-2 truncate font-pixel text-[8px] text-pixel-ink">
                        {getSellableTitle(asset)}
                      </div>
                      <div
                        className={`mt-1 font-pixel text-[6px] uppercase ${
                          RARITY_COLORS[rarity] ?? "text-pixel-muted"
                        }`}>
                        {rarity} · ×{asset.maxQuantity}
                      </div>
                      {asset.listingType === "cosmetic" &&
                        asset.isEquipped && (
                          <div className="mt-1 font-pixel text-[6px] text-pixel-orange">
                            EQUIPPED
                          </div>
                        )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedAsset && (
            <div className="pixel-panel p-2.5">
              <div className="mb-2 flex items-center gap-2">
                <BadgeDollarSign
                  className="text-pixel-highlight"
                  size={18}
                />
                <h2 className="font-pixel text-[10px] text-pixel-ink">
                  Create listing
                </h2>
              </div>

              {selectedAsset.listingType === "cosmetic" &&
                selectedAsset.isEquipped && (
                  <div className="pixel-panel-soft mb-2 border-pixel-orange/60 p-2 font-pixel text-[7px] leading-4 text-pixel-orange">
                    This asset is equipped. It will be removed from the Room
                    automatically before listing.
                  </div>
                )}

              <div className="grid gap-2">
                {(selectedAsset.listingType === "item" ||
                  selectedAsset.listingType === "chest") && (
                  <label className="grid gap-1">
                    <span className="font-pixel text-[7px] text-pixel-muted">
                      QUANTITY
                    </span>
                    <input
                      className="pixel-panel-soft min-h-10 px-3 font-pixel text-[9px] text-pixel-ink"
                      inputMode="numeric"
                      max={maxSellQuantity}
                      min={1}
                      onChange={(event) =>
                        setSellQuantity(
                          Math.min(
                            maxSellQuantity,
                            Math.max(1, Number(event.target.value) || 1),
                          ),
                        )
                      }
                      type="number"
                      value={normalizedSellQuantity}
                    />
                  </label>
                )}

                <label className="grid gap-1">
                  <span className="font-pixel text-[7px] text-pixel-muted">
                    PRICE FOR 1 (PGC)
                  </span>
                  <input
                    className="pixel-panel-soft min-h-10 px-3 font-pixel text-[9px] text-pixel-ink"
                    inputMode="decimal"
                    onChange={(event) =>
                      setSellUnitPrice(event.target.value.trim())
                    }
                    placeholder="100"
                    type="text"
                    value={sellUnitPrice}
                  />
                </label>
              </div>

              {salePreview ? (
                <div className="pixel-panel-soft mt-2 space-y-1 p-3 font-pixel text-[7px] leading-4">
                  <div className="flex justify-between gap-2 text-pixel-muted">
                    <span>Gross</span>
                    <span>{salePreview.gross} PGC</span>
                  </div>
                  <div className="flex justify-between gap-2 text-pixel-orange">
                    <span>Fee ({commissionBps / 100}%)</span>
                    <span>−{salePreview.fee} PGC</span>
                  </div>
                  <div className="flex justify-between gap-2 border-t border-pixel-border/50 pt-1 text-pixel-highlight">
                    <span>You receive</span>
                    <span>{salePreview.proceeds} PGC</span>
                  </div>
                </div>
              ) : (
                <div className="mt-2 font-pixel text-[7px] leading-4 text-pixel-red">
                  Enter a unit price from{" "}
                  {configQuery.data?.minUnitPrice ?? "1"} to{" "}
                  {configQuery.data?.maxUnitPrice ?? "1000000000"} PGC.
                </div>
              )}

              <button
                className="pixel-button mt-2 min-h-10 w-full font-pixel text-[8px] disabled:opacity-60"
                disabled={
                  !salePreview ||
                  createListing.isPending ||
                  (sellableQuery.data?.activeListingCount ?? 0) >=
                    (sellableQuery.data?.maxActiveListings ??
                      configQuery.data?.maxActiveListings ??
                      10)
                }
                onClick={handleCreateListing}
                type="button">
                {createListing.isPending ? "LISTING..." : "CREATE LISTING"}
              </button>
            </div>
          )}

          <div className="pixel-panel p-2.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <h2 className="font-pixel text-[10px] text-pixel-ink">
                  My active listings
                </h2>
                <p className="mt-1 font-pixel text-[7px] text-pixel-muted">
                  Escrow returns when you cancel
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
            ) : myListings.data?.listings.length === 0 ? (
              <div className="pixel-panel-soft p-4 text-center font-pixel text-[8px] text-pixel-muted">
                NO ACTIVE LISTINGS
              </div>
            ) : (
              <div className="space-y-2">
                {myListings.data?.listings.map((listing) => (
                  <article
                    className="pixel-panel-soft flex items-center gap-2 p-2"
                    key={listing.id}>
                    <div className="pixel-icon-box grid h-10 w-10 shrink-0 place-items-center">
                      {listing.listingType === "egg" ? (
                        <Egg size={20} />
                      ) : listing.listingType === "chest" ? (
                        <Box size={20} />
                      ) : listing.listingType === "pixegotchi" ? (
                        <PawPrint size={20} />
                      ) : (
                        <ShoppingBag size={20} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-pixel text-[8px] text-pixel-ink">
                        {getListingTitle(listing)}
                      </h3>
                      <p className="mt-1 font-pixel text-[6px] leading-3 text-pixel-muted">
                        {listing.remainingQuantity}/{listing.initialQuantity} ·{" "}
                        {listing.unitPrice} PGC · expires{" "}
                        {new Date(listing.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      className="pixel-button min-h-8 shrink-0 px-2 font-pixel text-[7px] text-pixel-red disabled:opacity-60"
                      disabled={
                        cancelListing.isPending &&
                        cancelListing.variables?.listingId === listing.id
                      }
                      onClick={() => void handleCancel(listing)}
                      type="button">
                      CANCEL
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <MarketplacePurchaseModal
        isPending={buyListing.isPending}
        listing={purchaseListing}
        onBuy={(quantity) => {
          if (purchaseListing) {
            handlePlayerBuy(purchaseListing, quantity);
          }
        }}
        onClose={() => {
          if (!buyListing.isPending) setPurchaseListing(null);
        }}
      />
    </div>
  );
};

export default MarketplacePage;
