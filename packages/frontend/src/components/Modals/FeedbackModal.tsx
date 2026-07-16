import {
  AlertTriangle,
  CircleCheck,
  Info,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { useCallback } from "react";
import ModalShell from "./ModalShell";
import { useFeedbackModalStore } from "@/store/feedback-modal.store";
import type { FeedbackVariant } from "@/types/feedback-modal";

interface FeedbackPresentation {
  Icon: LucideIcon;
  iconClassName: string;
  borderClassName: string;
}

const FEEDBACK_PRESENTATION: Record<
  FeedbackVariant,
  FeedbackPresentation
> = {
  error: {
    Icon: AlertTriangle,
    iconClassName: "text-pixel-red",
    borderClassName: "border-pixel-red/50",
  },
  success: {
    Icon: CircleCheck,
    iconClassName: "text-pixel-green",
    borderClassName: "border-pixel-green/50",
  },
  warning: {
    Icon: ShieldAlert,
    iconClassName: "text-pixel-yellow",
    borderClassName: "border-pixel-yellow/50",
  },
  info: {
    Icon: Info,
    iconClassName: "text-pixel-blue",
    borderClassName: "border-pixel-blue/50",
  },
};

const FeedbackModal = () => {
  const feedback = useFeedbackModalStore((state) => state.feedback);
  const closeFeedback = useFeedbackModalStore((state) => state.closeFeedback);
  const presentation =
    FEEDBACK_PRESENTATION[feedback?.variant ?? "error"];
  const { Icon } = presentation;
  const action = feedback?.action;
  const runAction = useCallback(() => {
    if (!action) return;

    closeFeedback();
    action.onClick();
  }, [action, closeFeedback]);
  const actionClassName =
    action?.tone === "danger"
      ? "text-pixel-red"
      : "text-pixel-highlight";

  return (
    <ModalShell
      actions={
        action ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              className="pixel-button px-3 py-3 font-pixel text-[8px] leading-4 text-pixel-muted"
              onClick={closeFeedback}
              type="button">
              Close
            </button>
            <button
              className={`pixel-button px-3 py-3 font-pixel text-[8px] leading-4 ${actionClassName}`}
              onClick={runAction}
              type="button">
              {action.label}
            </button>
          </div>
        ) : (
          <button
            className="pixel-button w-full px-3 py-3 font-pixel text-[9px] leading-4"
            onClick={closeFeedback}
            type="button">
            Got it
          </button>
        )
      }
      icon={<Icon size={18} />}
      iconClassName={presentation.iconClassName}
      isOpen={feedback !== null}
      onClose={closeFeedback}
      title={feedback?.title ?? "Something went wrong"}>
      <div
        className={`pixel-panel-soft bg-pixel-bg-deep/45 p-3 ${presentation.borderClassName}`}>
        <p className="font-pixel text-[8px] leading-4 text-pixel-ink">
          {feedback?.message}
        </p>
      </div>

      {feedback?.requestId && (
        <p className="mt-2 break-all font-pixel text-[6px] leading-3 text-pixel-muted">
          Request ID: {feedback.requestId}
        </p>
      )}
    </ModalShell>
  );
};

export default FeedbackModal;
