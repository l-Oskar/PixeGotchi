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
    className={`bg-linear-to-br ${gradient} hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl p-4 transition flex flex-col items-center gap-2 shadow-lg`}>
    <Icon size={24} />
    <span className="text-xs font-semibold">{label}</span>
  </button>
);

export default ActionButton;
