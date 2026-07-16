import type { ReactNode } from "react";
import {
  ELEMENT_COLORS,
  ElementType,
  Pixegotchi,
  RARITY_BORDER_COLORS,
  RARITY_COLORS,
  RARITY_STATS,
} from "@pixegotchi/shared";
import {
  Apple,
  Droplets,
  Heart,
  Mars,
  Smile,
  Sparkles,
  Venus,
  Zap,
  type LucideIcon,
} from "lucide-react";
import ModalShell from "@/components/Modals/ModalShell";
import { getPixegotchiImg } from "@/utils/getImage";
import { formatWholeStatValue, toFiniteStatNumber } from "@/utils/formatStats";

interface VaultPetModalProps {
  isOpen: boolean;
  element: ElementType | null;
  pets: Pixegotchi[];
  selectedPetId: number | null;
  isLoading: boolean;
  isError: boolean;
  onSelectPet: (petId: number) => void;
  onRetry: () => void;
  onClose: () => void;
  actions?: ReactNode;
}

const STAT_CONFIG: Array<{
  key: "health" | "hunger" | "energy" | "happiness" | "cleanliness";
  label: string;
  icon: LucideIcon;
  color: string;
  iconColor: string;
}> = [
  {
    key: "health",
    label: "Health",
    icon: Heart,
    color: "bg-red-500",
    iconColor: "text-red-500",
  },
  {
    key: "hunger",
    label: "Hunger",
    icon: Apple,
    color: "bg-orange-500",
    iconColor: "text-orange-500",
  },
  {
    key: "cleanliness",
    label: "Cleanliness",
    icon: Droplets,
    color: "bg-sky-500",
    iconColor: "text-sky-500",
  },
  {
    key: "happiness",
    label: "Happiness",
    icon: Smile,
    color: "bg-fuchsia-500",
    iconColor: "text-fuchsia-500",
  },
  {
    key: "energy",
    label: "Energy",
    icon: Zap,
    color: "bg-yellow-500",
    iconColor: "text-yellow-500",
  },
];

const VaultPetModal = ({
  isOpen,
  element,
  pets,
  selectedPetId,
  isLoading,
  isError,
  onSelectPet,
  onRetry,
  onClose,
  actions,
}: VaultPetModalProps) => {
  const selectedPet =
    pets.find((pet) => pet.id === selectedPetId) ?? pets[0] ?? null;
  const maxStat = selectedPet ? RARITY_STATS[selectedPet.rarity].maxStat : 100;
  const title = element
    ? `${element.charAt(0).toUpperCase()}${element.slice(1)} Collection (${pets.length})`
    : "Vault Collection";

  return (
    <ModalShell
      actions={actions}
      closeLabel="Close Vault collection"
      icon={<Sparkles size={17} />}
      isOpen={isOpen}
      onClose={onClose}
      title={title}>
      {isLoading ? (
        <div className="pixel-panel-soft flex min-h-52 flex-col items-center justify-center gap-3 p-4">
          <Sparkles
            aria-hidden="true"
            className="animate-spin text-pixel-highlight"
            size={30}
          />
          <div className="font-pixel text-[9px] leading-4 text-pixel-muted">
            Loading Pixegotchi...
          </div>
        </div>
      ) : isError ? (
        <div className="pixel-panel-soft p-3 text-center">
          <div className="font-pixel text-[9px] leading-4 text-pixel-red">
            Vault pets failed to load.
          </div>
          <button
            className="pixel-button mt-3 px-4 py-2 font-pixel text-[8px]"
            onClick={onRetry}
            type="button">
            Retry
          </button>
        </div>
      ) : !selectedPet ? (
        <div className="pixel-panel-soft p-4 text-center font-pixel text-[9px] leading-4 text-pixel-muted">
          No Pixegotchi found for this element.
        </div>
      ) : (
        <div className="space-y-3">
          {pets.length > 1 && (
            <div
              aria-label="Pixegotchi selector"
              className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2"
              role="group">
              {pets.map((pet) => {
                const isSelected = pet.id === selectedPet.id;

                return (
                  <button
                    aria-label={`View ${pet.name}`}
                    aria-pressed={isSelected}
                    className={`pixel-panel-soft w-24 shrink-0 snap-start p-2 text-left transition ${RARITY_BORDER_COLORS[pet.rarity] || "border-pixel-border"} ${
                      isSelected
                        ? "bg-pixel-highlight/10 shadow-pixel-inset"
                        : "hover:brightness-110"
                    }`}
                    key={pet.id}
                    onClick={() => onSelectPet(pet.id)}
                    type="button">
                    <img
                      alt={pet.name}
                      className="pixelated mx-auto h-16 w-16 object-contain"
                      src={`./${getPixegotchiImg(pet)}`}
                    />
                    <div className="mt-1 truncate font-pixel text-[8px] leading-3 text-pixel-ink">
                      {pet.name}
                    </div>
                    <div className="mt-1 font-pixel text-[7px] leading-3 text-pixel-muted">
                      Lv {pet.level}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="pixel-panel-soft overflow-hidden p-3">
            <div className="grid grid-cols-[6.5rem_1fr] items-center gap-3 max-[360px]:grid-cols-[5.5rem_1fr]">
              <div className="grid min-h-28 place-items-center rounded-sm bg-pixel-bg-deep/45">
                <img
                  alt={selectedPet.name}
                  className="pixelated h-28 w-28 object-contain max-[360px]:h-24 max-[360px]:w-24"
                  src={`./${getPixegotchiImg(selectedPet)}`}
                />
              </div>

              <div className="min-w-0">
                <h3 className="truncate font-pixel text-[12px] leading-5 text-pixel-ink">
                  {selectedPet.name}
                </h3>
                <div className="mt-1 font-pixel text-[8px] leading-3 text-pixel-highlight">
                  Level {selectedPet.level}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span
                    className={`pixel-pill px-2 py-1 font-pixel text-[7px] capitalize ${RARITY_COLORS[selectedPet.rarity]}`}>
                    {selectedPet.rarity}
                  </span>
                  <span
                    className={`pixel-pill px-2 py-1 font-pixel text-[7px] capitalize ${ELEMENT_COLORS[selectedPet.element]}`}>
                    {selectedPet.element}
                  </span>
                  <span
                    className={`pixel-pill flex items-center gap-1 px-2 py-1 font-pixel text-[7px] capitalize ${
                      selectedPet.gender === "male"
                        ? "border-[var(--color-pixel-male)]/80 bg-[var(--color-pixel-male)]/15 text-[var(--color-pixel-male)]"
                        : "border-[var(--color-pixel-female)]/70 bg-[var(--color-pixel-female)]/15 text-[var(--color-pixel-female)]"
                    }`}>
                    {selectedPet.gender === "male" ? (
                      <Mars size={10} />
                    ) : (
                      <Venus size={10} />
                    )}
                    {selectedPet.gender}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex justify-between font-pixel text-[7px] leading-3 text-pixel-muted">
                <span>Experience</span>
                <span>{selectedPet.experience} / 1000 XP</span>
              </div>
              <div className="pixel-progress mt-1">
                <div
                  className="pixel-progress-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, selectedPet.experience / 10))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pixel-panel-soft p-3">
            <div className="font-pixel text-[9px] leading-4 text-pixel-ink">
              Traits
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selectedPet.traits.length > 0 ? (
                selectedPet.traits.map((trait) => (
                  <span
                    className="pixel-pill px-2 py-1 font-pixel text-[7px] leading-3 capitalize text-pixel-highlight"
                    key={trait}>
                    {trait.replace(/_/g, " ")}
                  </span>
                ))
              ) : (
                <span className="font-pixel text-[7px] text-pixel-muted">
                  No traits
                </span>
              )}
            </div>
          </div>

          <div className="pixel-panel-soft space-y-2.5 p-3">
            <div className="font-pixel text-[9px] leading-4 text-pixel-ink">
              Stats
            </div>
            {STAT_CONFIG.map(({ key, label, icon: Icon, color, iconColor }) => {
              const value = Math.min(
                maxStat,
                Math.max(0, toFiniteStatNumber(selectedPet[key])),
              );

              return (
                <div className="flex items-center gap-2" key={key}>
                  <Icon className={`shrink-0 ${iconColor}`} size={15} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2 font-pixel text-[7px] leading-3">
                      <span className="text-pixel-muted">{label}</span>
                      <span className="text-pixel-ink">
                        {formatWholeStatValue(value)} / {maxStat}
                      </span>
                    </div>
                    <div className="pixel-progress mt-1">
                      <div
                        className={`h-full ${color}`}
                        style={{ width: `${(value / maxStat) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ModalShell>
  );
};

export default VaultPetModal;
