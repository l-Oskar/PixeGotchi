import { useConfirmationModalStore } from "@/store/confirmation-modal.store";

export const useConfirmationModal = () => {
  const confirm = useConfirmationModalStore(
    (state) => state.requestConfirmation,
  );

  return { confirm };
};
