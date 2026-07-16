import {
  CircleHelp,
  ShieldAlert,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { useCallback } from "react";
import ModalShell from "./ModalShell";
import { useConfirmationModalStore } from "@/store/confirmation-modal.store";
import type { ConfirmationTone } from "@/types/confirmation-modal";

interface ConfirmationPresentation {
  Icon: LucideIcon;
  iconClassName: string;
  borderClassName: string;
  confirmClassName: string;
}

const CONFIRMATION_PRESENTATION: Record<
  ConfirmationTone,
  ConfirmationPresentation
> = {
  default: {
    Icon: CircleHelp,
    iconClassName: "text-pixel-highlight",
    borderClassName: "border-pixel-highlight/50",
    confirmClassName: "text-pixel-highlight",
  },
  warning: {
    Icon: ShieldAlert,
    iconClassName: "text-pixel-yellow",
    borderClassName: "border-pixel-yellow/50",
    confirmClassName: "text-pixel-yellow",
  },
  danger: {
    Icon: TriangleAlert,
    iconClassName: "text-pixel-red",
    borderClassName: "border-pixel-red/50",
    confirmClassName: "text-pixel-red",
  },
};

const ConfirmationModal = () => {
  const confirmation = useConfirmationModalStore(
    (state) => state.confirmation,
  );
  const resolveConfirmation = useConfirmationModalStore(
    (state) => state.resolveConfirmation,
  );
  const cancel = useCallback(
    () => resolveConfirmation(false),
    [resolveConfirmation],
  );
  const confirm = useCallback(
    () => resolveConfirmation(true),
    [resolveConfirmation],
  );
  const presentation =
    CONFIRMATION_PRESENTATION[confirmation?.tone ?? "default"];
  const { Icon } = presentation;

  return (
    <ModalShell
      actions={
        <div className="grid grid-cols-2 gap-2">
          <button
            className="pixel-button px-3 py-3 font-pixel text-[8px] leading-4 text-pixel-muted"
            onClick={cancel}
            type="button">
            {confirmation?.cancelLabel ?? "Cancel"}
          </button>
          <button
            className={`pixel-button px-3 py-3 font-pixel text-[8px] leading-4 ${presentation.confirmClassName}`}
            onClick={confirm}
            type="button">
            {confirmation?.confirmLabel ?? "Confirm"}
          </button>
        </div>
      }
      closeLabel="Cancel confirmation"
      icon={<Icon size={18} />}
      iconClassName={presentation.iconClassName}
      isOpen={confirmation !== null}
      layer="overlay"
      onClose={cancel}
      title={confirmation?.title ?? "Confirm action"}>
      <div
        className={`pixel-panel-soft bg-pixel-bg-deep/45 p-3 ${presentation.borderClassName}`}>
        <p className="font-pixel text-[8px] leading-4 text-pixel-ink">
          {confirmation?.message}
        </p>
      </div>
    </ModalShell>
  );
};

export default ConfirmationModal;
