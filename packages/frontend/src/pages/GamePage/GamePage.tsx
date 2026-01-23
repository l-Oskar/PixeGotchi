import { PageType } from "../MainPage/mainPageTypes";

export interface GamePageProps {
  onNavigate?: (page: PageType) => void;
}

export interface Game {
  id: number;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  reward: string;
  icon: string;
}

// GamesPage
const GamesPage: React.FC<GamePageProps> = () => {
  const games: Game[] = [
    {
      id: 1,
      name: "Memory Match",
      difficulty: "Easy",
      reward: "50-100",
      icon: "🧠",
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

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Mini Games</h1>

      <div className="space-y-3">
        {games.map((game) => (
          <button
            key={game.id}
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
