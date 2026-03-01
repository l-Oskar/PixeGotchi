import React from "react";
import { Egg } from "lucide-react";

interface LoaderProps {
  title?: string | null;
}

const Loader: React.FC<LoaderProps> = ({ title }) => {
  return (
    <div className="p-4 space-y-4">
      <div className="bg-linear-to-br from-pink-500/20 to-purple-600/20 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
        <div className="h-80 flex flex-col justify-center items-center">
          <div className="animate-spin mb-5">
            <Egg size={60} />
          </div>
          <div className="text-2xl animate-pulse">
            {title ? title : "Loading . . ."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
