import React from "react";
import { Link } from "@/components/Link/Link.tsx";
import { User } from "@pixegotchi/shared";
import { Crown, Wallet, Coins, Plus, Menu } from "lucide-react";
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
      className="sticky top-0 z-50 bg-pixel-bg/95">
      <div className="mx-auto flex max-w-md items-center justify-between gap-1 px-2 py-1.5">
        <div className="pixel-panel-soft flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1">
          <div className="pixel-icon-box h-8 w-8 shrink-0 bg-linear-to-br from-pixel-highlight to-yellow-600 text-pixel-bg-deep">
            <Crown size={15} />
          </div>
          <div className="min-w-0">
            <div className="font-pixel text-[8px] leading-3 text-pixel-muted">
              Player
            </div>
            <div
              className="truncate font-pixel text-[10px] leading-4 text-pixel-ink"
              title={user?.username || "Unknown"}>
              {user?.username || "Unknown"}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <div className="pixel-panel-soft flex items-center gap-1 p-2 text-pixel-highlight">
            <Coins size={14} />
            <span className="font-pixel text-[9px] leading-4">
              {user?.pgcBalance || "0"}
            </span>
            <button
              className="grid h-6 w-6 place-items-center border-l-2 border-pixel-border pl-1 text-pixel-green"
              type="button"
              aria-label="Add PGC">
              <Plus size={14} />
            </button>
          </div>
          <Link to="/ton-connect">
            <button
              className="pixel-icon-button"
              type="button"
              aria-label="Wallet">
              <Wallet size={15} />
            </button>
          </Link>
          <button
            className="pixel-icon-button text-pixel-muted"
            type="button"
            aria-label="Menu">
            <Menu size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
