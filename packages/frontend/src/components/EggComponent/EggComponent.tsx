import React from "react";
import { Link } from "@/components/Link/Link.tsx";
import { PageType, Egg } from "@shared";
import { Menu } from "lucide-react";
import { useGetHatchingStatus } from "@/services/queries/egg.queries";
import { useEggStore } from "@/store/egg.store";

export interface EggPageProps {
  egg: Egg | null;
  onNavigate?: (page: PageType) => void;
}

const EggComponent: React.FC<EggPageProps> = () => {
  const egg = useEggStore((s) => s.hatchingEgg);

  if (!egg) return <div>Loading...</div>;
  const status = useGetHatchingStatus(egg.id);

  return (
    <>
      <div className="bg-linear-to-br from-pink-500/20 to-purple-600/20 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {`Egg-#${egg?.id}`}
            </h2>
            <Link to="/index">
              <button className="text-white/60 hover:text-white">
                <Menu size={20} />
              </button>
            </Link>
          </div>
          <div className="flex gap-2 mt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-orange-500/30 rounded-full border border-orange-400/50 capitalize">
                {status.data?.canHatchNow ? "Ready" : "Hatching"}
              </span>
              <span className="text-xs px-2 py-0.5 bg-purple-500/30 rounded-full border border-purple-400/50">
                Progress
                {status.isFetched
                  ? " " + Math.floor(status!.data!.progress * 10) / 10
                  : "-"}
                %
              </span>
            </div>
          </div>
        </div>

        {/* Pixegotchi Visual */}
        <div className="relative bg-linear-to-b from-blue-500/10 to-purple-500/10 rounded-2xl h-56 flex items-center justify-center border border-white/5">
          <div className="text-9xl animate-egg-wobble">
            <img
              className="w-25 h-33"
              src={`public/egg-0.png`}
              alt={`Egg-${egg?.id}`}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EggComponent;
