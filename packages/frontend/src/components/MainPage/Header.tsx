import React from "react";
import { Link } from "@/components/Link/Link.tsx";
import { User } from "@pixegotchi/shared";
import { Crown, Wallet, Coins, Plus, Menu, UserRound } from "lucide-react";
import { useSignal } from "@tma.js/sdk-react";
import { viewport } from "@tma.js/sdk";

export interface HeaderProps {
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const safeAreaInsetTop = useSignal(viewport.safeAreaInsetTop);
  const contentSafeAreaInsetTop = useSignal(viewport.contentSafeAreaInsetTop);

  const topInset = (safeAreaInsetTop ?? 0) + (contentSafeAreaInsetTop ?? 0);

  return (
    <header
      style={{ paddingTop: `${Math.max(0, topInset - 5)}px` }}
      className="sticky top-0 z-50 bg-pixel-bg/95 shadow-[0_12px_28px_rgba(5,3,10,0.65)]">
      <div className="mx-auto flex max-w-md items-center justify-between gap-1.5 px-2.5 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <div className="relative grid h-[3.25rem] w-[3.25rem] shrink-0 place-items-center rounded-sm border-2 border-pixel-red bg-linear-to-br from-pixel-red/80 to-pixel-bg-deep text-pixel-ink shadow-[0_4px_0_#05030a,inset_0_0_0_2px_rgba(255,255,255,0.14)] max-[430px]:h-12 max-[430px]:w-12">
            <UserRound size={24} />
            <span className="absolute -left-1 -top-1 grid h-5 w-5 place-items-center rounded-sm border-2 border-pixel-bg-deep bg-pixel-highlight text-pixel-bg-deep shadow-[0_2px_0_#05030a]">
              <Crown size={12} />
            </span>
          </div>
          <div
            className="min-w-0 truncate font-pixel text-sm leading-5 text-pixel-ink max-[380px]:text-xs"
            title={user?.username || "Unknown"}>
            {user?.username || "Unknown"}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div className="pixel-panel flex h-10 items-center gap-1.5 bg-pixel-bg-deep/75 px-1.5 text-pixel-highlight">
            <Coins size={16} />
            <span className="font-pixel text-[10px] leading-4 text-pixel-ink">
              {user?.pgcBalance || "0"}
            </span>
            <button
              className="grid h-7 w-7 place-items-center rounded-sm border-2 border-pixel-bg-deep bg-pixel-border text-white shadow-[0_2px_0_#05030a]"
              type="button"
              aria-label="Add PGC">
              <Plus size={16} />
            </button>
          </div>
          <Link to="/ton-connect">
            <button
              className="pixel-icon-button h-10 min-h-10 w-10 min-w-10 bg-pixel-surface text-pixel-ink"
              type="button"
              aria-label="Wallet">
              <Wallet size={18} />
            </button>
          </Link>
          <button
            className="pixel-icon-button h-10 min-h-10 w-10 min-w-10 bg-pixel-surface text-pixel-ink"
            type="button"
            aria-label="Menu">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
