export interface GameStruct {
  id: number;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  reward: string;
  icon: string;
}
