import React, { ReactNode, useEffect, useRef } from "react";

interface DropdownTriggerProps {
  "aria-expanded": boolean;
  "aria-haspopup": "menu";
  onClick: () => void;
}

interface DropdownProps {
  children: ReactNode;
  isOpen: boolean;
  menuLabel: string;
  onOpenChange: (isOpen: boolean) => void;
  panelClassName?: string;
  trigger: (props: DropdownTriggerProps) => ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({
  children,
  isOpen,
  menuLabel,
  onOpenChange,
  panelClassName = "",
  trigger,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onOpenChange(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onOpenChange]);

  return (
    <div className="relative" ref={containerRef}>
      {trigger({
        "aria-expanded": isOpen,
        "aria-haspopup": "menu",
        onClick: () => onOpenChange(!isOpen),
      })}

      {isOpen && (
        <div
          className={`pixel-panel absolute right-0 top-[calc(100%+0.5rem)] z-[60] w-48 p-1.5 ${panelClassName}`}
          role="menu"
          aria-label={menuLabel}>
          {children}
        </div>
      )}
    </div>
  );
};
