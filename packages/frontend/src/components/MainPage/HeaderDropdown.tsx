import React from "react";
import { Menu, Moon, Sun } from "lucide-react";
import { Dropdown } from "@/components/Dropdown/Dropdown";
import { useUiStore } from "@/store/ui.store";

const HeaderDropdown: React.FC = () => {
  const isMenuOpen = useUiStore((state) => state.isHeaderMenuOpen);
  const isLightTheme = useUiStore((state) => state.isLightTheme);
  const setHeaderMenuOpen = useUiStore((state) => state.setHeaderMenuOpen);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  return (
    <Dropdown
      isOpen={isMenuOpen}
      onOpenChange={setHeaderMenuOpen}
      menuLabel="Header menu"
      trigger={(triggerProps) => (
        <button
          className="pixel-icon-button h-10 min-h-10 w-10 min-w-10 bg-pixel-surface text-pixel-ink"
          type="button"
          aria-label="Open header menu"
          {...triggerProps}>
          <Menu size={20} />
        </button>
      )}>
      <button
        className="flex w-full items-center justify-between gap-3 rounded-sm px-2.5 py-2 text-left font-pixel text-[8px] leading-4 text-pixel-ink transition hover:bg-pixel-highlight/15"
        type="button"
        role="menuitem"
        onClick={() => {
          toggleTheme();
          setHeaderMenuOpen(false);
        }}>
        <span>{isLightTheme ? "Dark theme" : "Light theme"}</span>
        {isLightTheme ? <Moon size={14} /> : <Sun size={14} />}
      </button>
    </Dropdown>
  );
};

export default HeaderDropdown;
