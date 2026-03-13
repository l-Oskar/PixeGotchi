import React from "react";
import { Pixegotchi } from "@shared";

interface PixegothiDataProps {
  pixegotchi: Pixegotchi | null;
}

const PixegothiData: React.FC<PixegothiDataProps> = ({ pixegotchi }) => {
  return (
    <div className="p-4 space-y-4">
      <div className="min-h-96 bg-linear-to-br from-pink-500/20 to-purple-600/20 rounded-3xl p-6 border border-white/10 backdrop-blur-sm text-xl">
        <div className="text-center">Pixegotchi data</div>
        <p>ID: #{pixegotchi?.id}</p>
        <p>Name: {pixegotchi?.name}</p>
        <p>LVL: {pixegotchi?.level}</p>
        <p>Experiance: {pixegotchi?.experience}</p>
        <p>Element: {pixegotchi?.element}</p>
        <p>Rarity: {pixegotchi?.rarity}</p>
        <p>Gender: {pixegotchi?.gender}</p>
        <p>Created at: {pixegotchi?.hatchedAt ? new Date(pixegotchi.hatchedAt).toLocaleString() : "N/A"}</p>
        <p>Genome: {pixegotchi?.genomeHash}</p>
        <p>
          Traits:{" "}
          {pixegotchi?.traits
            ? pixegotchi?.traits?.map((t) => (
                <span className="text-blue-400">{t.toLocaleUpperCase()} </span>
              ))
            : "No traits"}
        </p>
      </div>
    </div>
  );
};

export default PixegothiData;
