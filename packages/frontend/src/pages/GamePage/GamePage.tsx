import { useState } from "react";
import { PageType, GameStruct, Pixegotchi } from "@pixegotchi/shared";
import { CatchGame } from "@/components/GamesComponents/CatchGame";
export interface GamePageProps {
  onNavigate?: (page: PageType) => void;
  pixegotchi: Pixegotchi | null;
}

// GamesPage
const GamesPage: React.FC<GamePageProps> = ({ pixegotchi }) => {
  const [activeGameId, setActiveGameId] = useState<number | null>(null);
  const games: GameStruct[] = [
    {
      id: 1,
      name: "Catch Fruits",
      difficulty: "Easy",
      reward: "50-100",
      icon: "🍌",
    },
    {
      id: 2,
      name: "Quick Tap",
      difficulty: "Medium",
      reward: "100-200",
      icon: "⚡",
    },
    {
      id: 3,
      name: "Puzzle Solver",
      difficulty: "Hard",
      reward: "200-500",
      icon: "🧩",
    },
  ];

  const handleGameEnd = async (score: number) => {
    console.log(`Game score: ${score}`);

    const rewardAmound = Math.floor(score * 2);
    console.log(`Game reward: ${rewardAmound}pgc`);
    setActiveGameId(null);
  };

  if (activeGameId === 1) {
    return (
      <div className="p-4">
        <CatchGame
          onGameEnd={handleGameEnd}
          endGame={setActiveGameId}
          pixegotchi={pixegotchi!}
        />
      </div>
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
                  setActiveGameId(game.id);
                }
              } else {
                alert(`${game.name} is comming sood`);
              }
            }}
            className="w-full bg-linear-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-2xl p-4 border border-white/10 transition flex items-center gap-4">
            <div className="text-5xl">{game.icon}</div>
            <div className="flex-1 text-left">
              <h3 className="font-bold">{game.name}</h3>
              <div className="flex gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full">
                  {game.difficulty}
                </span>
                <span className="text-xs px-2 py-0.5 bg-yellow-500/20 rounded-full text-yellow-400">
                  {game.reward} PGC
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
