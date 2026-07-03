import React from "react";
import { Egg } from "lucide-react";
import LoadingScreenFrame from "./LoadingScreenFrame";

interface LoaderProps {
  title?: string | null;
}

const Loader: React.FC<LoaderProps> = ({ title }) => {
  return (
    <LoadingScreenFrame>
      <div className="mb-6 animate-spin text-pixel-highlight">
        <Egg size={80} />
      </div>
      <div className="animate-pulse text-center font-pixel text-[15px] leading-4 text-pixel-muted">
        {title ? title : "Loading . . ."}
      </div>
    </LoadingScreenFrame>
  );
};

export default Loader;
