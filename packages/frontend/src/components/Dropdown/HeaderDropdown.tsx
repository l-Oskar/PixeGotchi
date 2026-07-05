import React from "react";
import { Wallet, Menu, Moon, Sun } from "lucide-react";
import { Dropdown } from "@/components/Dropdown/Dropdown";
import DropDownButton from "@/components/Dropdown/DropDownButton";
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
      <div className="grid">
        <DropDownButton
          icon={isLightTheme ? <Moon size={14} /> : <Sun size={14} />}
          onClick={() => {
            toggleTheme();
            setHeaderMenuOpen(false);
          }}>
          Theme
        </DropDownButton>
        <DropDownButton
          icon={<Wallet size={14} />}
          to="/ton-connect"
          onClick={() => setHeaderMenuOpen(false)}>
          Wallet
        </DropDownButton>
      </div>
    </Dropdown>
  );
};

export default HeaderDropdown;
