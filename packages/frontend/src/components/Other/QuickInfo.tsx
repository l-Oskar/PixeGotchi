import { useAllVault } from "@/services/queries/vault.queries";
import { User } from "@pixegotchi/shared";
import { useUserStore } from "@/store/user.store";
import { Clock3, Gamepad2 } from "lucide-react";

const QuickInfo = () => {
  const { data: vault } = useAllVault();
  const user = useUserStore((s) => s.user);

  const userAge = (user: User | null) => {
    if (!user?.createdAt) return "0";

    const dateNow = Date.now();
    const createdAt = Date.parse(`${user.createdAt}`);
    if (Number.isNaN(createdAt)) return "0";

    const timeSince = Math.floor((dateNow - createdAt) / 1000 / 86400);
    return timeSince;
  };
  return (
    <div className="pixel-panel-soft p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-pixel text-[10px] leading-4 text-pixel-ink">
          Quick Info
        </h3>
        <span className="font-pixel text-[7px] leading-3 text-pixel-muted">
          Profile
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="pixel-panel-soft flex min-h-18 items-center gap-2 bg-pixel-bg-deep/35 p-2">
          <div className="pixel-icon-box h-9 w-9 shrink-0 text-pixel-highlight">
            <Gamepad2 size={18} />
          </div>
          <div className="min-w-0">
            <div className="truncate font-pixel text-[7px] leading-3 text-pixel-muted">
              Have Pixegotchis
            </div>
            <div className="mt-1 font-pixel text-[11px] leading-4 text-pixel-ink">
              {vault ? vault.length : "?"}
            </div>
          </div>
        </div>

        <div className="pixel-panel-soft flex min-h-18 items-center gap-2 bg-pixel-bg-deep/35 p-2">
          <div className="pixel-icon-box h-9 w-9 shrink-0 text-pixel-highlight">
            <Clock3 size={18} />
          </div>
          <div className="min-w-0">
            <div className="truncate font-pixel text-[7px] leading-3 text-pixel-muted">
              Age
            </div>
            <div className="mt-1 font-pixel text-[11px] leading-4 text-pixel-ink">
              {userAge(user)} days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickInfo;
