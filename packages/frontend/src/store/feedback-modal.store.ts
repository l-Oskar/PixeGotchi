import { create } from "zustand";
import type { FeedbackModalDetails } from "@/types/feedback-modal";

interface FeedbackModalState {
  feedback: FeedbackModalDetails | null;
  openFeedback: (feedback: FeedbackModalDetails) => void;
  closeFeedback: () => void;
}

export const useFeedbackModalStore = create<FeedbackModalState>((set) => ({
  feedback: null,
  openFeedback: (feedback) => set({ feedback }),
  closeFeedback: () => set({ feedback: null }),
}));
