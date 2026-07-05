import { useEffect, useState } from "react";
import { PageType, GameStruct, Pixegotchi } from "@pixegotchi/shared";
import { Coins, StarPlus, Zap } from "lucide-react";
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
  const [activeGameId, setActiveGameId] = useState<number | null>(null);
  const games: GameStruct[] = [
    {
      id: 1,
      name: "Catch Fruits",
      difficulty: "Easy",
      reward: "50-100",
      energy: 10,
      exp: "10-50",
      icon: "🍌",
    },
    {
      id: 2,
      name: "Quick Tap",
      difficulty: "Medium",
      reward: "100-200",
      energy: 15,
      exp: "20-60",
      icon: "⚡",
    },
    {
      id: 3,
      name: "Puzzle Solver",
      difficulty: "Hard",
      reward: "200-500",
      energy: 20,
      exp: "30-70",
      icon: "🧩",
    },
  ];

  useEffect(() => {
    return () => {
      onGameActiveChange?.(false);
    };
  }, [onGameActiveChange]);

  const openGame = (gameId: number) => {
    onGameActiveChange?.(true);
    setActiveGameId(gameId);
  };

  const closeGame = () => {
    setActiveGameId(null);
    onGameActiveChange?.(false);
  };

  const handleGameEnd = async (score: number) => {
    console.log(`Game score: ${score}`);

    const rewardAmound = Math.floor(score * 2);
    console.log(`Game reward: ${rewardAmound}pgc`);
    closeGame();
  };

  if (activeGameId === 1) {
    return (
      <CatchGame
        onGameEnd={handleGameEnd}
        endGame={closeGame}
        pixegotchi={pixegotchi!}
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
          <span className="theme-readable-muted font-pixel text-[8px] leading-3">
            Coming soon
          </span>
        </div>

        <div className="space-y-2">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => {
                if (game.id === 1) {
                  if (!pixegotchi) {
                    alert("You need active Pixegotchi");
                  } else {
                    openGame(game.id);
                  }
                } else {
                  alert(`${game.name} is coming soon`);
                }
              }}
              className="pixel-panel-soft grid w-full grid-cols-[3rem_1fr] items-center gap-2 p-2 text-left transition hover:border-pixel-highlight/70">
              <div className="pixel-icon-box h-11 w-11 shrink-0 text-xl">
                {game.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-pixel text-[10px] leading-4 text-pixel-ink">
                  {game.name}
                </h3>
                <div className="mt-1 flex flex-wrap gap-1.5 font-pixel">
                  <span className="theme-readable-muted whitespace-nowrap rounded-sm border border-pixel-border bg-pixel-panel px-1.5 py-1 text-[7px] leading-3">
                    {game.difficulty}
                  </span>
                  <span className="flex items-center gap-1 whitespace-nowrap rounded-sm border border-pixel-orange/50 bg-pixel-orange/15 px-1.5 py-1 text-[7px] leading-3 text-pixel-orange">
                    {game.energy}
                    <Zap size={10} />
                  </span>
                  <span className="flex items-center gap-1 whitespace-nowrap rounded-sm border border-pixel-highlight/50 bg-pixel-highlight/15 px-1.5 py-1 text-[7px] leading-3 text-pixel-highlight">
                    {game.reward}
                    <Coins size={10} />
                  </span>
                  <span className="flex items-center gap-1 whitespace-nowrap rounded-sm border border-pixel-green/50 bg-pixel-green/15 px-1.5 py-1 text-[7px] leading-3 text-pixel-green">
                    {game.exp}
                    <StarPlus size={10} />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GamesPage;
