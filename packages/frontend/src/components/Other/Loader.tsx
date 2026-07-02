import React from "react";
import { Egg } from "lucide-react";

interface LoaderProps {
  title?: string | null;
}

const Loader: React.FC<LoaderProps> = ({ title }) => {
  return (
    <div className="space-y-3 p-3">
      <div className="pixel-panel p-4">
        <div className="flex h-80 flex-col items-center justify-center">
          <div className="pixel-icon-box mb-4 h-14 w-14 animate-spin text-pixel-highlight">
            <Egg size={28} />
          </div>
          <div className="animate-pulse text-center font-pixel text-[10px] leading-4 text-pixel-muted">
            {title ? title : "Loading . . ."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
