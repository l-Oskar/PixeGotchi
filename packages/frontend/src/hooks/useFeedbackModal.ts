import { useCallback } from "react";
import {
  isUnauthorizedApiError,
  normalizeApiError,
  type ApiErrorOptions,
} from "@/services/api/api-error";
import { useFeedbackModalStore } from "@/store/feedback-modal.store";
import type { CustomFeedbackDetails } from "@/types/feedback-modal";

const DEFAULT_ERROR_TITLE = "Something went wrong";
const DEFAULT_SUCCESS_TITLE = "Success";
const DEFAULT_WARNING_TITLE = "Please note";
const DEFAULT_INFO_TITLE = "Information";

export const useFeedbackModal = () => {
  const openFeedback = useFeedbackModalStore((state) => state.openFeedback);

  const showError = useCallback(
    ({ title = DEFAULT_ERROR_TITLE, ...details }: CustomFeedbackDetails) => {
      openFeedback({ variant: "error", title, ...details });
    },
    [openFeedback],
  );

  const showSuccess = useCallback(
    ({ title = DEFAULT_SUCCESS_TITLE, ...details }: CustomFeedbackDetails) => {
      openFeedback({ variant: "success", title, ...details });
    },
    [openFeedback],
  );

  const showWarning = useCallback(
    ({ title = DEFAULT_WARNING_TITLE, ...details }: CustomFeedbackDetails) => {
      openFeedback({ variant: "warning", title, ...details });
    },
    [openFeedback],
  );

  const showInfo = useCallback(
    ({ title = DEFAULT_INFO_TITLE, ...details }: CustomFeedbackDetails) => {
      openFeedback({ variant: "info", title, ...details });
    },
    [openFeedback],
  );

  const showApiError = useCallback(
    (error: unknown, options?: ApiErrorOptions) => {
      if (isUnauthorizedApiError(error)) return false;

      openFeedback(normalizeApiError(error, options));
      return true;
    },
    [openFeedback],
  );

  return {
    showError,
    showSuccess,
    showWarning,
    showInfo,
    showApiError,
  };
};
