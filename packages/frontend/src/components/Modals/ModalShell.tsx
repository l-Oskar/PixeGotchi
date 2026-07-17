import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  type RefObject,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import SafeAreaFrame from "@/components/Other/SafeAreaFrame";

interface ModalShellProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  icon?: ReactNode;
  iconClassName?: string;
  initialFocusRef?: RefObject<HTMLElement>;
  actions?: ReactNode;
  closeLabel?: string;
  layer?: "default" | "overlay";
}

const ModalShell = ({
  isOpen,
  title,
  children,
  onClose,
  icon,
  iconClassName = "text-pixel-highlight",
  initialFocusRef,
  actions,
  closeLabel = "Close dialog",
  layer = "default",
}: ModalShellProps) => {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    (initialFocusRef?.current ?? closeButtonRef.current)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      previouslyFocusedElement?.focus();
    };
  }, [initialFocusRef, isOpen]);

  if (typeof document === "undefined") return null;

  const backdropClassName =
    layer === "overlay" ? "z-[130]" : "z-[120]";
  const dialogClassName = layer === "overlay" ? "z-[131]" : "z-[121]";

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            aria-label={closeLabel}
            className={`theme-modal-backdrop fixed inset-0 cursor-default bg-black/70 backdrop-blur-sm ${backdropClassName}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            type="button"
          />

          <SafeAreaFrame
            className={`pointer-events-none fixed inset-0 flex items-center justify-center ${dialogClassName}`}>
            <motion.div
              aria-labelledby={titleId}
              aria-modal="true"
              className="pixel-panel pointer-events-auto max-h-full w-full max-w-sm overflow-y-auto p-4"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              role="dialog"
              transition={{ type: "spring", damping: 25, stiffness: 300 }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  {icon && (
                    <div
                      className={`pixel-icon-box grid h-9 w-9 shrink-0 place-items-center ${iconClassName}`}>
                      {icon}
                    </div>
                  )}
                  <h2
                    className="font-pixel text-[11px] leading-5 text-pixel-ink"
                    id={titleId}>
                    {title}
                  </h2>
                </div>

                <button
                  aria-label={closeLabel}
                  className="pixel-button grid h-8 min-h-8 w-8 min-w-8 place-items-center p-0 text-pixel-muted hover:text-pixel-ink"
                  onClick={onClose}
                  ref={closeButtonRef}
                  type="button">
                  <X size={16} />
                </button>
              </div>

              <div className="mt-3">{children}</div>

              {actions && <div className="mt-4">{actions}</div>}
            </motion.div>
          </SafeAreaFrame>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default ModalShell;
