import { LucideIcon } from "lucide-react";

export interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  gradient: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  disabled,
  gradient,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`pixel-button relative flex min-h-[4.8rem] w-full flex-col items-center justify-center gap-1.5 overflow-hidden border-pixel-bg-deep/80 bg-linear-to-br p-1.5 shadow-[0_5px_0_#090412,inset_0_0_0_2px_rgba(255,255,255,0.14)] hover:scale-[1.015] disabled:hover:scale-100 max-[380px]:min-h-[4.75rem] ${gradient}`}>
    <span className="absolute left-2 top-2 h-1.5 w-1.5 border-l-2 border-t-2 border-white/20" />
    <span className="absolute right-2 top-2 h-1.5 w-1.5 border-r-2 border-t-2 border-white/20" />
    <span className="absolute bottom-2 left-2 h-1.5 w-1.5 border-b-2 border-l-2 border-black/20" />
    <span className="absolute bottom-2 right-2 h-1.5 w-1.5 border-b-2 border-r-2 border-black/20" />
    <span className="grid place-items-center text-white max-[380px]:h-8 max-[380px]:w-8">
      <Icon
        size={22}
        strokeWidth={2.2}
        className="max-[380px]:h-5 max-[380px]:w-5"
      />
    </span>
    <span className="font-pixel text-[9px] uppercase leading-3 text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.65)]">
      {label}
    </span>
  </button>
);

export default ActionButton;
