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
    className="pixel-button flex min-h-24 w-full flex-col items-center justify-center gap-2 p-2 hover:scale-105 disabled:hover:scale-100">
    <span className={`pixel-icon-box h-8 w-8 bg-linear-to-br ${gradient}`}>
      <Icon size={18} />
    </span>
    <span className="font-pixel text-[9px] leading-3">{label}</span>
  </button>
);

export default ActionButton;
