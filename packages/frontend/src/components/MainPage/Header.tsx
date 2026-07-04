import React, { useEffect, useRef, useState } from "react";
import { Link } from "@/components/Link/Link.tsx";
import { User } from "@pixegotchi/shared";
import { Wallet, Menu, UserRound, Crown } from "lucide-react";
import { useSignal } from "@tma.js/sdk-react";
import { viewport } from "@tma.js/sdk";
import { publicUrl } from "@/helpers/publicUrl";

export interface HeaderProps {
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const [isAddPressed, setIsAddPressed] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(() =>
    document.documentElement.classList.contains("pixel-light-theme"),
  );
  const addReleaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safeAreaInsetTop = useSignal(viewport.safeAreaInsetTop);
  const contentSafeAreaInsetTop = useSignal(viewport.contentSafeAreaInsetTop);

  const topInset = (safeAreaInsetTop ?? 0) + (contentSafeAreaInsetTop ?? 0);
  const headerAssetPath = "assets/header";

  useEffect(() => {
    document.documentElement.classList.toggle(
      "pixel-light-theme",
      isLightTheme,
    );
  }, [isLightTheme]);

  const setAddButtonPressed = () => {
    if (addReleaseTimer.current) {
      clearTimeout(addReleaseTimer.current);
    }
    setIsAddPressed(true);
  };
  const releaseAddButton = () => {
    if (addReleaseTimer.current) {
      clearTimeout(addReleaseTimer.current);
    }
    addReleaseTimer.current = setTimeout(() => {
      setIsAddPressed(false);
    }, 140);
  };

  return (
    <header
      style={{ paddingTop: `${Math.max(0, topInset - 5)}px` }}
      className="sticky top-0 z-50 bg-pixel-bg/95 shadow-[0_12px_28px_rgba(5,3,10,0.65)]">
      <div className="mx-auto flex h-16 max-w-md items-center justify-between gap-1.5 px-2 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-0">
          <div className="relative grid -ml-1 h-18 w-18 shrink-0 place-items-center text-pixel-ink max-[430px]:h-[3.875rem] max-[430px]:w-[3.875rem] max-[380px]:h-[3.75rem] max-[380px]:w-[3.75rem]">
            <img
              src={publicUrl(`${headerAssetPath}/frame.png`)}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full pixelated drop-shadow-[0_4px_0_#05030a]"
            />
            <div className="relative grid h-[76%] w-[76%] place-items-center">
              <UserRound size={30} />
            </div>
            <span className="absolute left-2 top-2 grid h-5 w-5 place-items-center rounded-sm border-2 border-pixel-bg-deep bg-pixel-highlight text-pixel-bg-deep shadow-[0_2px_0_#05030a]">
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
          <div className="pixel-panel flex h-10 items-center gap-1 bg-pixel-bg-deep/75 px-1 text-pixel-highlight">
            <img
              src={publicUrl(`${headerAssetPath}/coin.png`)}
              alt=""
              aria-hidden="true"
              className="h-8 w-8 shrink-0 pixelated drop-shadow-[0_2px_0_#05030a]"
            />
            <span className="font-pixel text-[10px] leading-4 text-pixel-ink">
              {user?.pgcBalance || "0"}
            </span>
            <button
              className={`-mt-1 mr-1 header-add-button grid h-6 w-6 place-items-center overflow-visible rounded-sm text-white transition-[transform,box-shadow] duration-75 ${
                isAddPressed ? "translate-y-0.1" : ""
              }`}
              type="button"
              aria-label="Add PGC"
              onBlur={() => setIsAddPressed(false)}
              onClick={() => {
                setAddButtonPressed();
                releaseAddButton();
              }}
              onPointerCancel={releaseAddButton}
              onPointerDown={setAddButtonPressed}
              onPointerLeave={releaseAddButton}
              onPointerUp={releaseAddButton}>
              <span
                className={`header-add-sprite h-7 w-7 pixelated ${
                  isAddPressed ? "is-pressed" : ""
                }`}
                style={{
                  backgroundImage: `url("${publicUrl(`${headerAssetPath}/FreeUI.png`)}")`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "392px 448px",
                }}
              />
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
            onClick={() => setIsLightTheme((current) => !current)}
            aria-label={
              isLightTheme ? "Switch to dark theme" : "Switch to light theme"
            }
            aria-pressed={isLightTheme}>
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
