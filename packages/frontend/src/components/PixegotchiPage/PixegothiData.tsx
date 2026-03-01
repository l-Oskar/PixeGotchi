import React from "react";
import { Pixegotchi } from "@shared";

interface PixegothiDataProps {
  pixegotchi: Pixegotchi | null;
}

const PixegothiData: React.FC<PixegothiDataProps> = ({ pixegotchi }) => {
  return (
    <div className="p-4 space-y-4">
      <div className="min-h-96 bg-linear-to-br from-pink-500/20 to-purple-600/20 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
        <div className="text-center">Pixegotchi data</div>
      </div>
    </div>
  );
};

export default PixegothiData;
