import { Sparkles, SquareArrowLeft, SquareArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  ElementType,
  PageType,
  PixegotchiStatus,
  RARITY_COLORS,
} from "@pixegotchi/shared";
import Loader from "@/components/Other/Loader";
import { useConfirmationModal } from "@/hooks/useConfirmationModal";
import { useFeedbackModal } from "@/hooks/useFeedbackModal";
import { useToast } from "@/hooks/useToast";
import {
  useAllVault,
  useStatsVault,
} from "@/services/queries/vault.queries";
import { getPixegotchiImg } from "@/utils/getImage";
import {
  usePixegotchiFromVault,
  usePixegotchiToVault,
} from "@/services/queries/pixegotchi.queries";
import { usePixegotchiStore } from "@/store/pixegotchi.store";
import VaultPetModal from "@/components/Modals/VaultPetModal";

interface VaultPageProps {
  onNavigate: (page: PageType) => void;
}

const VAULT_ERROR_TITLE = "Cannot send to Vault";
const ACTIVATE_ERROR_TITLE = "Cannot activate Pixegotchi";

const VaultPage: React.FC<VaultPageProps> = ({ onNavigate }) => {
  const { isLoading, data } = useStatsVault();
  const vaultStats = data ?? [];
  const allVaultQuery = useAllVault();
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(
    null,
  );
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const setPixegotchiToVault = usePixegotchiToVault();
  const activateFromVault = usePixegotchiFromVault();
  const currentPixegotchi = usePixegotchiStore((s) => s.currentPixegotchi);
  const { confirm } = useConfirmationModal();
  const { showError, showApiError } = useFeedbackModal();
  const { showSuccessToast } = useToast();
  const selectedElementPets = useMemo(
    () =>
      selectedElement
        ? (allVaultQuery.data ?? []).filter(
            (pet) => pet.element === selectedElement,
          )
        : [],
    [allVaultQuery.data, selectedElement],
  );
  const selectedVaultPet =
    selectedElementPets.find((pet) => pet.id === selectedPetId) ??
    selectedElementPets[0] ??
    null;

  useEffect(() => {
    if (!selectedElement || selectedElementPets.length === 0) return;
    if (selectedElementPets.some((pet) => pet.id === selectedPetId)) return;

    setSelectedPetId(selectedElementPets[0].id);
  }, [selectedElement, selectedElementPets, selectedPetId]);

  const handleOpenElement = (element: ElementType) => {
    const firstPet = (allVaultQuery.data ?? []).find(
      (pet) => pet.element === element,
    );

    setSelectedElement(element);
    setSelectedPetId(firstPet?.id ?? null);
  };

  const handleCloseElement = () => {
    setSelectedElement(null);
    setSelectedPetId(null);
  };

  const sendToVault = async (): Promise<void> => {
    try {
      await setPixegotchiToVault.mutateAsync();
      showSuccessToast({
        title: "Stored in Vault",
        message:
          `${currentPixegotchi?.name ?? "Pixegotchi"} was sent to Vault successfully.`,
      });
      onNavigate("start");
    } catch (error) {
      showApiError(error, {
        title: VAULT_ERROR_TITLE,
        retry: () => {
          void sendToVault();
        },
      });
    }
  };

  const handleSetToVault = async () => {
    if (!currentPixegotchi) {
      showError({
        title: VAULT_ERROR_TITLE,
        message: "There is no current Pixegotchi to send.",
      });
      return;
    }

    if (currentPixegotchi.status !== PixegotchiStatus.active) {
      showError({
        title: VAULT_ERROR_TITLE,
        message: "Only an active Pixegotchi can be sent to Vault.",
      });
      return;
    }

    if (currentPixegotchi.level % 10 !== 0) {
      showError({
        title: VAULT_ERROR_TITLE,
        message:
          "Pixegotchi can only be stored at levels 10, 20, 30, and so on.",
      });
      return;
    }

    const confirmed = await confirm({
      title: "Send to Vault?",
      message: `${currentPixegotchi.name} will become inactive and stop stat degradation. Continue?`,
      tone: "warning",
      confirmLabel: "Send to Vault",
    });

    if (!confirmed) return;
    await sendToVault();
  };

  const activatePet = async (pixegotchiId: number, name: string) => {
    try {
      await activateFromVault.mutateAsync(pixegotchiId);
      handleCloseElement();
      showSuccessToast({
        title: "Pixegotchi activated",
        message: `${name} is now your active Pixegotchi.`,
      });
      onNavigate("start");
    } catch (error) {
      showApiError(error, {
        title: ACTIVATE_ERROR_TITLE,
        retry: () => {
          void activatePet(pixegotchiId, name);
        },
      });
    }
  };

  const handleActivateFromVault = async () => {
    if (!selectedVaultPet) {
      showError({
        title: ACTIVATE_ERROR_TITLE,
        message: "Select a Pixegotchi from the Vault first.",
      });
      return;
    }

    if (currentPixegotchi) {
      showError({
        title: ACTIVATE_ERROR_TITLE,
        message:
          "Send your current Pixegotchi to the Vault before activating another one.",
      });
      return;
    }

    const confirmed = await confirm({
      title: "Activate Pixegotchi?",
      message: `${selectedVaultPet.name} will leave the Vault and become your active Pixegotchi. Continue?`,
      confirmLabel: "Activate",
    });

    if (!confirmed) return;
    await activatePet(selectedVaultPet.id, selectedVaultPet.name);
  };

  const collectedCount = vaultStats
    ? vaultStats.filter((stat) => !stat.isEmpty).length
    : 0;
  const totalCount = 14;

  if (isLoading) {
    return <Loader title={"Loading vault..."} />;
  }

  return (
    <div className="space-y-2.5 p-2.5">
      <div className="pixel-panel p-2.5">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <h1 className="font-pixel text-sm leading-5 text-pixel-ink">Vault</h1>
        </div>

        <div className="pixel-panel-soft overflow-hidden border-pink-400/70 bg-linear-to-br from-fuchsia-500/20 via-pixel-surface-soft to-pixel-bg-deep p-3">
          <div className="grid grid-cols-[1fr_auto] items-center gap-2.5">
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center gap-2">
                <Sparkles className="text-pixel-highlight" size={15} />
                <span className="font-pixel text-[9px] leading-3 text-pixel-ink">
                  Collection Progress
                </span>
              </div>
              <div className="font-pixel text-xl leading-7 text-pixel-ink">
                {collectedCount} / {totalCount}
              </div>
              <div className="pixel-progress mt-1.5 h-2.5">
                <div
                  className="pixel-progress-fill bg-linear-to-r from-pink-500 to-fuchsia-400"
                  style={{ width: `${(collectedCount / totalCount) * 100}%` }}
                />
              </div>
              <div className="theme-readable-muted mt-2 max-w-48 font-pixel text-[7px] leading-3">
                Collect all elements with level 100 to get Unique rarity.
              </div>
            </div>

            <div className="pixel-panel-soft grid h-16 w-16 place-items-center border-pink-300/50 bg-pixel-bg-deep/40 shadow-pixel-inset">
              <div className="relative grid h-12 w-12 place-items-center">
                <span className="text-3xl leading-none">🏆</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="font-pixel text-[10px] leading-4 text-pixel-ink">
              Elements Collection
            </h2>
            <div className="theme-readable-muted mt-1 font-pixel text-[7px] leading-3">
              Best Pixegotchi by element
            </div>
          </div>
          <div className="pixel-panel-soft px-2 py-1 font-pixel text-[8px] leading-3 text-pixel-highlight">
            {collectedCount}/{totalCount}
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          {vaultStats.map((item) => {
            const cardContent = (
              <>
                {!item.isEmpty && item.count > 1 && (
                  <div className="absolute right-1.5 top-1.5 rounded-sm border border-pixel-ink/20 bg-pixel-bg-deep/80 px-1.5 py-1 font-pixel text-[7px] leading-3 text-pixel-ink">
                    x{item.count}
                  </div>
                )}

                <div className="grid h-20 place-items-center max-[380px]:h-16">
                  {item.isEmpty ? (
                    <div className="grid h-16 w-16 place-items-center rounded-sm border border-dashed border-pixel-border/70 bg-pixel-surface/40 max-[380px]:h-14 max-[380px]:w-14">
                      <span className="font-pixel text-lg leading-none text-pixel-muted">
                        ?
                      </span>
                    </div>
                  ) : (
                    <img
                      className="pixelated h-24 w-24 object-contain max-[380px]:h-20 max-[380px]:w-20"
                      src={`./${getPixegotchiImg(item)}`}
                      alt={`Pixegotchi-${item.element}`}
                    />
                  )}
                </div>

                {!item.isEmpty ? (
                  <div className="mt-1">
                    <h3 className="truncate font-pixel text-[9px] leading-3 capitalize text-pixel-ink max-[380px]:text-[8px]">
                      {item.element}
                    </h3>
                    <div className="mt-1 flex items-center justify-between gap-1">
                      <div className="theme-readable-muted font-pixel text-[8px] leading-3">
                        Lv {item.highestLevel}
                      </div>
                      <div
                        className={`rounded-sm border px-1.5 py-1 font-pixel text-[7px] leading-3 max-[380px]:px-1 max-[380px]:py-0.5 ${RARITY_COLORS[item.bestRarity] || "text-pixel-ink"}`}>
                        {item.bestRarity.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 text-center">
                    <h3 className="font-pixel text-[9px] leading-3 text-pixel-muted max-[380px]:text-[8px]">
                      Empty
                    </h3>
                    <div className="mt-1 font-pixel text-[7px] leading-3 text-pixel-muted">
                      Not collected
                    </div>
                  </div>
                )}
              </>
            );

            return item.isEmpty ? (
              <div
                key={item.element}
                className="pixel-panel-soft relative min-h-36 overflow-hidden border-dashed bg-pixel-bg-deep/35 p-2 opacity-70 max-[380px]:min-h-32 max-[380px]:p-1.5">
                {cardContent}
              </div>
            ) : (
              <button
                aria-label={`View ${item.element} Pixegotchi collection`}
                className={`pixel-panel-soft relative min-h-36 overflow-hidden bg-linear-to-b from-pixel-surface-soft to-pixel-bg-deep/60 p-2 text-left transition hover:border-pixel-highlight/70 focus-visible:border-pixel-highlight max-[380px]:min-h-32 max-[380px]:p-1.5 ${RARITY_COLORS[item.bestRarity]?.replace("text", "border") || ""}`}
                key={item.element}
                onClick={() => handleOpenElement(item.element as ElementType)}
                type="button">
                {cardContent}
              </button>
            );
          })}
        </div>

        {currentPixegotchi && (
          <div className="pixel-panel-soft mt-3 border-pixel-highlight/60 bg-pixel-bg-deep/45 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-pixel text-[10px] leading-4 text-pixel-ink">
                  Add current Pixegotchi
                </div>
                <div className="theme-readable-muted mt-1 font-pixel text-[7px] leading-3">
                  Send it to the vault collection
                </div>
              </div>
              <SquareArrowRight
                className="shrink-0 text-pixel-highlight"
                size={18}
              />
            </div>
            <button
              className="pixel-button flex w-full min-h-0 items-center justify-center gap-2 px-3 py-3 font-pixel text-[9px] leading-3 hover:scale-105 disabled:hover:scale-100"
              onClick={handleSetToVault}
              disabled={setPixegotchiToVault.isPending}
              type="button">
              <SquareArrowRight size={14} />
              <span>
                {setPixegotchiToVault.isPending
                  ? "Sending..."
                  : "Send to Vault"}
              </span>
            </button>
          </div>
        )}

        {collectedCount === totalCount && (
          <div className="pixel-panel-soft mt-3 overflow-hidden border-pink-400/70 bg-linear-to-r from-pixel-bg-deep via-fuchsia-500/15 to-pixel-bg-deep p-3">
            <div className="flex items-center gap-3">
              <div className="pixel-panel-soft grid h-14 w-14 shrink-0 place-items-center border-pink-300/50 bg-pixel-bg-deep/50 shadow-pixel-inset">
                <span className="text-3xl leading-none">🏆</span>
              </div>
              <div className="min-w-0">
                <div className="font-pixel text-[10px] leading-4 text-pixel-highlight">
                  Complete Collection!
                </div>
                <div className="theme-readable-muted mt-1 font-pixel text-[8px] leading-4">
                  Level them up to 100 for Unique rarity.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <VaultPetModal
        actions={
          selectedVaultPet ? (
            <button
              className="pixel-button flex w-full min-h-0 items-center justify-center gap-2 px-3 py-3 font-pixel text-[9px] leading-3 text-pixel-highlight hover:scale-105 disabled:hover:scale-100"
              disabled={activateFromVault.isPending}
              onClick={handleActivateFromVault}
              type="button">
              <SquareArrowLeft size={14} />
              <span>
                {activateFromVault.isPending ? "Activating..." : "Activate"}
              </span>
            </button>
          ) : undefined
        }
        element={selectedElement}
        isError={allVaultQuery.isError}
        isLoading={allVaultQuery.isLoading}
        isOpen={selectedElement !== null}
        onClose={handleCloseElement}
        onRetry={() => {
          void allVaultQuery.refetch();
        }}
        onSelectPet={setSelectedPetId}
        pets={selectedElementPets}
        selectedPetId={selectedPetId}
      />
    </div>
  );
};

export default VaultPage;
