import { useCallback } from "react";
import { useToastStore } from "@/store/toast.store";
import type { CustomToastInput } from "@/types/toast";

export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast);

  const showSuccessToast = useCallback(
    (toast: CustomToastInput) =>
      addToast({ variant: "success", title: "Success", ...toast }),
    [addToast],
  );

  const showInfoToast = useCallback(
    (toast: CustomToastInput) =>
      addToast({ variant: "info", title: "Information", ...toast }),
    [addToast],
  );

  return { showSuccessToast, showInfoToast };
};
