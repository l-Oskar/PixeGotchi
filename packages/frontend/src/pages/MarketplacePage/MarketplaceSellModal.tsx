import {
  ListingType,
  RARITY_BORDER_COLORS,
  type CreateMarketplaceListingInput,
  type SellableMarketplaceAsset,
} from "@pixegotchi/shared";
import {
  ArrowLeft,
  BadgeDollarSign,
  Box,
  Egg,
  Package,
  PawPrint,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useState } from "react";
import ModalShell from "@/components/Modals/ModalShell";
import { useFeedbackModal } from "@/hooks/useFeedbackModal";
import {
  useCreateMarketplaceListing,
  useMarketplaceConfig,
  useMarketplaceSellable,
} from "@/services/queries/marketplace.queries";
import { calculateMarketplaceSalePreview } from "./marketplace-money";

const SELL_CATEGORIES = [
  { id: ListingType.egg, label: "Eggs", icon: Egg },
  { id: ListingType.item, label: "Items", icon: Package },
  { id: ListingType.chest, label: "Chests", icon: Box },
  { id: ListingType.cosmetic, label: "Room", icon: ShoppingBag },
  { id: ListingType.pixegotchi, label: "Pixegotchis", icon: PawPrint },
] as const;

interface MarketplaceSellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
  initialListingType?: ListingType;
  initialAssetKey?: string;
}

const toAssetUrl = (path: string | null) => {
  if (!path) return null;
  if (/^(?:https?:|data:)/.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
};

const capitalize = (value: string) =>
  value.length > 0 ? `${value[0]?.toUpperCase()}${value.slice(1)}` : value;

export const getSellableKey = (asset: SellableMarketplaceAsset) => {
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
    case "pixegotchi":
      return asset.asset.name;
  }
};

const getSellableSubtitle = (asset: SellableMarketplaceAsset) => {
  switch (asset.listingType) {
    case "egg":
      return "Unhatched egg";
    case "item":
      return `${asset.asset.itemType} · ${asset.asset.rarity}`;
    case "chest":
      return `${asset.asset.rarity} chest`;
    case "cosmetic":
      return `${asset.asset.slot} · ${asset.asset.rarity}`;
    case "pixegotchi":
      return `Lv. ${asset.asset.level} · ${asset.asset.rarity}`;
  }
};

const getSellableRarity = (asset: SellableMarketplaceAsset) =>
  asset.listingType === "egg" ? "common" : asset.asset.rarity;

const SellableVisual = ({ asset }: { asset: SellableMarketplaceAsset }) => {
  const assetUrl =
    asset.listingType === "item"
      ? asset.asset.iconUrl
      : asset.listingType === "cosmetic"
        ? asset.asset.assetUrl
        : null;

  if (assetUrl) {
    return (
      <img
        alt={getSellableTitle(asset)}
        className="pixelated h-12 w-12 object-contain"
        src={toAssetUrl(assetUrl) ?? undefined}
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

const MarketplaceSellModal = ({
  isOpen,
  onClose,
  onCreated,
  initialListingType,
  initialAssetKey,
}: MarketplaceSellModalProps) => {
  const [listingType, setListingType] = useState<ListingType | null>(null);
  const [selectedAssetKey, setSelectedAssetKey] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState("100");
  const configQuery = useMarketplaceConfig();
  const sellableQuery = useMarketplaceSellable(
    listingType ?? ListingType.egg,
    isOpen && listingType !== null,
  );
  const createListing = useCreateMarketplaceListing();
  const { showSuccess, showApiError } = useFeedbackModal();

  useEffect(() => {
    if (!isOpen) return;
    setListingType(initialListingType ?? null);
    setSelectedAssetKey(initialAssetKey ?? "");
    setQuantity(1);
    setUnitPrice("100");
  }, [initialAssetKey, initialListingType, isOpen]);

  const selectedAsset =
    sellableQuery.data?.assets.find(
      (asset) => getSellableKey(asset) === selectedAssetKey,
    ) ?? null;
  const maxQuantity = selectedAsset?.maxQuantity ?? 1;
  const normalizedQuantity = Math.min(Math.max(1, quantity), maxQuantity);
  const commissionBps = configQuery.data?.commissionBps ?? 500;
  const salePreview = calculateMarketplaceSalePreview(
    unitPrice,
    normalizedQuantity,
    commissionBps,
    configQuery.data?.minUnitPrice ?? "1",
    configQuery.data?.maxUnitPrice ?? "1000000000",
  );
  const activeListingLimitReached =
    (sellableQuery.data?.activeListingCount ?? 0) >=
    (sellableQuery.data?.maxActiveListings ??
      configQuery.data?.maxActiveListings ??
      10);

  const handleBack = () => {
    if (selectedAssetKey && !initialAssetKey) {
      setSelectedAssetKey("");
      setQuantity(1);
      return;
    }
    if (!initialListingType) setListingType(null);
  };

  const handleCreate = () => {
    if (!selectedAsset || !salePreview) return;

    createListing.mutate(
      buildCreateListingInput(
        selectedAsset,
        normalizedQuantity,
        unitPrice,
      ),
      {
        onSuccess: () => {
          showSuccess({ message: "Listing created. Asset moved to escrow." });
          onCreated?.();
          onClose();
        },
        onError: (error) =>
          showApiError(error, { title: "Listing failed" }),
      },
    );
  };

  const modalTitle = selectedAsset
    ? "Create listing"
    : listingType
      ? `Choose ${
          SELL_CATEGORIES.find((category) => category.id === listingType)
            ?.label ?? "asset"
        }`
      : "Add listing";

  return (
    <ModalShell
      closeLabel="Close sell dialog"
      icon={<BadgeDollarSign size={18} />}
      isOpen={isOpen}
      layer="overlay"
      onClose={() => {
        if (!createListing.isPending) onClose();
      }}
      title={modalTitle}>
      <div className="space-y-3">
        {(listingType !== null || selectedAssetKey) &&
          !initialAssetKey && (
            <button
              className="pixel-button flex min-h-8 items-center gap-2 px-2 font-pixel text-[7px] text-pixel-muted"
              onClick={handleBack}
              type="button">
              <ArrowLeft size={14} />
              BACK
            </button>
          )}

        {!listingType ? (
          <div className="grid grid-cols-2 gap-2">
            {SELL_CATEGORIES.map(({ id, label, icon: Icon }) => (
              <button
                className="pixel-panel-soft flex min-h-20 flex-col items-center justify-center gap-2 p-3 font-pixel text-[8px] text-pixel-ink transition hover:border-pixel-highlight"
                key={id}
                onClick={() => setListingType(id)}
                type="button">
                <Icon className="text-pixel-highlight" size={22} />
                {label}
              </button>
            ))}
          </div>
        ) : !selectedAsset ? (
          sellableQuery.isLoading ? (
            <div className="pixel-panel-soft p-5 text-center font-pixel text-[8px] text-pixel-muted">
              LOADING...
            </div>
          ) : sellableQuery.isError ? (
            <div className="pixel-panel-soft border-pixel-red/60 p-5 text-center font-pixel text-[8px] text-pixel-red">
              SELLABLE ASSETS UNAVAILABLE
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 font-pixel text-[7px] text-pixel-muted">
                <span>Active listings</span>
                <span>
                  {sellableQuery.data?.activeListingCount ?? 0}/
                  {sellableQuery.data?.maxActiveListings ??
                    configQuery.data?.maxActiveListings ??
                    10}
                </span>
              </div>
              {sellableQuery.data?.assets.length === 0 ? (
                <div className="pixel-panel-soft p-5 text-center font-pixel text-[8px] leading-4 text-pixel-muted">
                  NOTHING TO SELL IN THIS CATEGORY
                </div>
              ) : (
                sellableQuery.data?.assets.map((asset) => {
                  const rarity = getSellableRarity(asset);
                  return (
                    <button
                      className={`pixel-panel-soft flex w-full items-center gap-3 p-2 text-left transition hover:border-pixel-highlight ${
                        RARITY_BORDER_COLORS[rarity] ?? ""
                      }`}
                      key={getSellableKey(asset)}
                      onClick={() => {
                        setSelectedAssetKey(getSellableKey(asset));
                        setQuantity(1);
                      }}
                      type="button">
                      <div className="pixel-icon-box grid h-14 w-14 shrink-0 place-items-center overflow-hidden">
                        <SellableVisual asset={asset} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-pixel text-[9px] leading-4 text-pixel-ink">
                          {getSellableTitle(asset)}
                        </div>
                        <div className="mt-1 truncate font-pixel text-[7px] capitalize leading-3 text-pixel-muted">
                          {getSellableSubtitle(asset)}
                        </div>
                      </div>
                      <span className="font-pixel text-[7px] text-pixel-highlight">
                        ×{asset.maxQuantity}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )
        ) : (
          <>
            <div className="pixel-panel-soft flex items-center gap-3 p-3">
              <div className="pixel-icon-box grid h-16 w-16 shrink-0 place-items-center overflow-hidden">
                <SellableVisual asset={selectedAsset} />
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-pixel text-[10px] leading-4 text-pixel-ink">
                  {getSellableTitle(selectedAsset)}
                </h3>
                <p className="mt-1 font-pixel text-[7px] capitalize leading-4 text-pixel-muted">
                  {getSellableSubtitle(selectedAsset)}
                </p>
                <p className="mt-1 font-pixel text-[7px] text-pixel-highlight">
                  Available: {selectedAsset.maxQuantity}
                </p>
              </div>
            </div>

            {selectedAsset.listingType === "cosmetic" &&
              selectedAsset.isEquipped && (
                <div className="pixel-panel-soft border-pixel-orange/60 p-2 font-pixel text-[7px] leading-4 text-pixel-orange">
                  This asset is equipped. It will be removed from the Room
                  automatically.
                </div>
              )}

            {(selectedAsset.listingType === "item" ||
              selectedAsset.listingType === "chest") && (
              <label className="grid gap-1">
                <span className="font-pixel text-[7px] text-pixel-muted">
                  QUANTITY
                </span>
                <input
                  className="pixel-panel-soft min-h-10 px-3 font-pixel text-[9px] text-pixel-ink"
                  inputMode="numeric"
                  max={maxQuantity}
                  min={1}
                  onChange={(event) =>
                    setQuantity(
                      Math.min(
                        maxQuantity,
                        Math.max(1, Number(event.target.value) || 1),
                      ),
                    )
                  }
                  type="number"
                  value={normalizedQuantity}
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
                onChange={(event) => setUnitPrice(event.target.value.trim())}
                placeholder="100"
                type="text"
                value={unitPrice}
              />
            </label>

            {salePreview ? (
              <div className="pixel-panel-soft space-y-1 p-3 font-pixel text-[7px] leading-4">
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
              <div className="font-pixel text-[7px] leading-4 text-pixel-red">
                Enter a unit price from{" "}
                {configQuery.data?.minUnitPrice ?? "1"} to{" "}
                {configQuery.data?.maxUnitPrice ?? "1000000000"} PGC.
              </div>
            )}

            {activeListingLimitReached && (
              <div className="font-pixel text-[7px] leading-4 text-pixel-red">
                Active listing limit reached.
              </div>
            )}

            <button
              className="pixel-button min-h-10 w-full font-pixel text-[8px] disabled:opacity-60"
              disabled={
                !salePreview ||
                createListing.isPending ||
                activeListingLimitReached
              }
              onClick={handleCreate}
              type="button">
              {createListing.isPending ? "LISTING..." : "CREATE LISTING"}
            </button>
          </>
        )}
      </div>
    </ModalShell>
  );
};

export default MarketplaceSellModal;
