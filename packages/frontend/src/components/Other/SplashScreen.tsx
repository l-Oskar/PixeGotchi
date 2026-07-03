import { Egg } from "lucide-react";
import LoadingScreenFrame from "./LoadingScreenFrame";

const SplashScreen = () => {
  return (
    <LoadingScreenFrame withBackground>
      <div className="mb-6 animate-spin text-pixel-highlight">
        <Egg size={80} />
      </div>
      <h1 className="font-pixel text-sm leading-5">Pixegotchi</h1>
      <p className="mt-2 animate-pulse font-pixel text-[10px] leading-4 text-pixel-muted">
        Loading data...
      </p>
    </LoadingScreenFrame>
  );
};

export default SplashScreen;
