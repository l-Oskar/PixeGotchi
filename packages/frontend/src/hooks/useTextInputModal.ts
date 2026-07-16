import { useTextInputModalStore } from "@/store/text-input-modal.store";

export const useTextInputModal = () => {
  const requestText = useTextInputModalStore((state) => state.requestInput);

  return { requestText };
};
