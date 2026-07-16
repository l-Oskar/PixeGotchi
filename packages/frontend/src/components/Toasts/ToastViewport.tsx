import { viewport } from "@tma.js/sdk";
import { useSignal } from "@tma.js/sdk-react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, Info, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useToastStore } from "@/store/toast.store";
import type { ToastDetails } from "@/types/toast";

const DEFAULT_TOAST_DURATION_MS = 3_000;

interface ToastCardProps {
  toast: ToastDetails;
  onDismiss: (id: string) => void;
}

const ToastCard = ({ toast, onDismiss }: ToastCardProps) => {
  const isSuccess = toast.variant === "success";
  const Icon = isSuccess ? CircleCheck : Info;

  useEffect(() => {
    const timer = window.setTimeout(
      () => onDismiss(toast.id),
      toast.durationMs ?? DEFAULT_TOAST_DURATION_MS,
    );

    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.durationMs, toast.id]);

  return (
    <motion.div
      className={`pixel-panel pointer-events-auto w-full p-3 ${
        isSuccess ? "border-pixel-green/60" : "border-pixel-blue/60"
      }`}
      initial={{ opacity: 0, scale: 0.96, y: -12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -8 }}
      layout
      role="status">
      <div className="flex items-start gap-2.5">
        <div
          className={`pixel-icon-box grid h-8 w-8 shrink-0 place-items-center ${
            isSuccess ? "text-pixel-green" : "text-pixel-blue"
          }`}>
          <Icon size={16} />
        </div>

        <div className="min-w-0 flex-1">
          {toast.title && (
            <div className="font-pixel text-[8px] leading-4 text-pixel-ink">
              {toast.title}
            </div>
          )}
          <p className="mt-0.5 font-pixel text-[7px] leading-4 text-pixel-muted">
            {toast.message}
          </p>
        </div>

        <button
          aria-label="Dismiss notification"
          className="pixel-icon-button h-7 min-h-7 w-7 min-w-7 shrink-0 text-pixel-muted hover:text-pixel-ink"
          onClick={() => onDismiss(toast.id)}
          type="button">
          <X size={13} />
        </button>
      </div>
    </motion.div>
  );
};

const ToastViewport = () => {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);
  const safeAreaInsetTop = useSignal(viewport.safeAreaInsetTop);
  const contentSafeAreaInsetTop = useSignal(viewport.contentSafeAreaInsetTop);
  const topInset =
    (safeAreaInsetTop ?? 0) + (contentSafeAreaInsetTop ?? 0);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 z-[110] mx-auto flex max-w-sm flex-col gap-2"
      style={{
        top: `calc(max(${topInset}px, env(safe-area-inset-top)) + 0.75rem)`,
      }}>
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            onDismiss={dismissToast}
            toast={toast}
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
};

export default ToastViewport;
