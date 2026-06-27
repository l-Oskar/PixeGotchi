import { useEffect, useState } from "react";
import { PageType, GameStruct, Pixegotchi } from "@pixegotchi/shared";
import { Coins, CircleStar, Zap } from "lucide-react";
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
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Mini Games (Comming soon!)</h1>

      <div className="space-y-3">
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
                alert(`${game.name} is comming sood`);
              }
            }}
            className="w-full bg-linear-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-2xl p-4 border border-white/10 transition flex items-center gap-4">
            <div className="text-5xl">{game.icon}</div>
            <div className="flex-1 text-left">
              <h3 className="font-bold">{game.name}</h3>
              <div className="flex gap-1.5 mt-1 overflow-x-auto">
                <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded-full whitespace-nowrap">
                  {game.difficulty}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/20 rounded-full text-orange-400 whitespace-nowrap flex items-center gap-0.5">
                  {game.energy} <Zap size={12} className="text-orange-400" />
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 rounded-full text-yellow-400 whitespace-nowrap flex items-center gap-0.5">
                  {game.reward} <Coins size={12} className="text-yellow-400" />
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 rounded-full text-green-400 whitespace-nowrap flex items-center gap-0.5">
                  {game.exp} <CircleStar size={12} className="text-green-400" />
                </span>
              </div>
            </div>
            <div className="text-white/40">▶</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GamesPage;
