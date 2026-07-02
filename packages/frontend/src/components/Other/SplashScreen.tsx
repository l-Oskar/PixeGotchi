import { Egg } from "lucide-react";

const SplashScreen = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-pixel-bg p-3 text-pixel-ink">
      <div className="pixel-panel flex w-full max-w-sm flex-col items-center gap-4 p-4">
        <div className="pixel-icon-box h-16 w-16 animate-spin text-pixel-highlight">
          <Egg size={32} />
        </div>
        <h1 className="font-pixel text-sm leading-5">Pixegotchi</h1>
        <p className="font-pixel text-[9px] leading-4 text-pixel-muted">
          Loading data...
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
