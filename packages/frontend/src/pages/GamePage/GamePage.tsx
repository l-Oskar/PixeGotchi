import { useEffect, useState } from "react";
import {
  PageType,
  GameConfig,
  Pixegotchi,
  GAME_CONFIGS,
  getFinalEnergyCost,
} from "@pixegotchi/shared";
import { AlertCircle, Coins, StarPlus, Zap } from "lucide-react";
import { CatchGame } from "@/components/GamesComponents/CatchGame";
export interface GamePageProps {
  onNavigate?: (page: PageType) => void;
  onGameActiveChange?: (isActive: boolean) => void;
  pixegotchi: Pixegotchi | null;
}

// GamesPage
const GamesPage: React.FC<GamePageProps> = ({
  onGameActiveChange,
  pixegotchi,
}) => {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const canPlayGames = pixegotchi?.status === "active";
  const activePetMessage = pixegotchi
    ? "Потрібен активний пет, щоб запускати міні-ігри."
    : "You need active pixegotchi to play minigames. Hatch or activate one!";
  const games = Object.entries(GAME_CONFIGS).map(([id, config]) => ({
    id,
    ...config,
  }));
  const getDisplayedEnergyCost = (game: GameConfig) => {
    if (!pixegotchi) {
      return { finalCost: game.energyCost, traitDelta: 0 };
    }

    const baseCost = getFinalEnergyCost(
      Number(pixegotchi.health),
      pixegotchi.rarity,
      game.energyCost,
    );
    const finalCost = getFinalEnergyCost(
      Number(pixegotchi.health),
      pixegotchi.rarity,
      game.energyCost,
      pixegotchi.traits,
    );

    return { finalCost, traitDelta: finalCost - baseCost };
  };

  useEffect(() => {
    return () => {
      onGameActiveChange?.(false);
    };
  }, [onGameActiveChange]);

  useEffect(() => {
    if (!canPlayGames && activeGameId) {
      setActiveGameId(null);
      onGameActiveChange?.(false);
    }
  }, [activeGameId, canPlayGames, onGameActiveChange]);

  const openGame = (gameId: string, energyCost: number) => {
    if (!canPlayGames) {
      return;
    }
    if (Number(pixegotchi?.energy ?? 0) < energyCost) {
      return;
    }

    onGameActiveChange?.(true);
    setActiveGameId(gameId);
  };

  const closeGame = () => {
    setActiveGameId(null);
    onGameActiveChange?.(false);
  };

  const handleGameEnd = () => {
    closeGame();
  };

  if (activeGameId === "catch_fruits" && canPlayGames) {
    return (
      <CatchGame
        onGameEnd={handleGameEnd}
        endGame={closeGame}
        pixegotchi={pixegotchi}
      />
    );
  }

  return (
    <div className="space-y-3 p-3">
      <div className="pixel-panel p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h1 className="font-pixel text-sm leading-5 text-pixel-ink">
            Mini Games
          </h1>
        </div>

        {!canPlayGames && (
          <div className="mb-3 flex items-start gap-2 rounded-sm border border-pixel-orange/50 bg-pixel-orange/15 px-2 py-2">
            <AlertCircle
              size={16}
              className="mt-0.5 shrink-0 text-pixel-orange"
            />
            <p className="font-pixel text-[8px] leading-4 text-pixel-ink">
              {activePetMessage}
            </p>
          </div>
        )}

        <div className="space-y-2">
          {games.map((game) => {
            const { finalCost, traitDelta } = getDisplayedEnergyCost(game);
            const lacksEnergy =
              game.id === "catch_fruits" &&
              Number(pixegotchi?.energy ?? 0) < finalCost;

            return (
              <button
                key={game.id}
                disabled={!canPlayGames || lacksEnergy}
                onClick={() => {
                  if (!canPlayGames) {
                    return;
                  }

                  if (game.id === "catch_fruits") {
                    openGame(game.id, finalCost);
                  } else {
                    alert(`${game.name} is coming soon`);
                  }
                }}
                className={`pixel-panel-soft grid w-full grid-cols-[3rem_1fr] items-center gap-2 p-2 text-left transition hover:border-pixel-highlight/70 disabled:cursor-not-allowed disabled:hover:border-pixel-border ${
                  !canPlayGames ? "grayscale" : ""
                }`}>
                <div className="pixel-icon-box h-11 w-11 shrink-0 text-2xl">
                  {game.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-pixel text-[12px] leading-4 text-pixel-ink">
                    {game.name}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-1.5 font-pixel">
                    <span className="theme-readable-muted whitespace-nowrap rounded-sm border border-pixel-border bg-pixel-panel px-1.5 py-1 text-[7px] leading-3">
                      {game.difficulty}
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap rounded-sm border border-pixel-orange/50 bg-pixel-orange/15 px-1.5 py-1 text-[7px] leading-3 text-pixel-orange">
                      {finalCost}
                      <Zap size={10} />
                    </span>
                    {traitDelta !== 0 && (
                      <span className="whitespace-nowrap rounded-sm border border-pixel-blue/50 bg-pixel-blue/15 px-1.5 py-1 text-[7px] leading-3 text-pixel-blue">
                        trait {traitDelta > 0 ? "+" : ""}
                        {traitDelta}
                      </span>
                    )}
                    {lacksEnergy && (
                      <span className="whitespace-nowrap rounded-sm border border-pixel-red/50 bg-pixel-red/15 px-1.5 py-1 text-[7px] leading-3 text-pixel-red">
                        Need {finalCost - Number(pixegotchi?.energy ?? 0)} more
                      </span>
                    )}
                    <span className="flex items-center gap-1 whitespace-nowrap rounded-sm border border-pixel-highlight/50 bg-pixel-highlight/15 px-1.5 py-1 text-[7px] leading-3 text-pixel-highlight">
                      {game.rewardLabel}
                      <Coins size={10} />
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap rounded-sm border border-pixel-green/50 bg-pixel-green/15 px-1.5 py-1 text-[7px] leading-3 text-pixel-green">
                      {game.expLabel}
                      <StarPlus size={10} />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GamesPage;
