import { Egg } from "lucide-react";

const SplashScreen = () => {
  return (
    <div className="splash gap-5">
      <Egg size={80} className="animate-spin" />
      <h1 className="text-3xl">Pixegotchi</h1>
      <p className="text-xl">Loading data...</p>
    </div>
  );
};

export default SplashScreen;
