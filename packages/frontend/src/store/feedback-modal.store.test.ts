import { beforeEach, describe, expect, it } from "vitest";
import { useFeedbackModalStore } from "./feedback-modal.store";

const resetStore = () => {
  useFeedbackModalStore.setState({ feedback: null });
};

describe("feedback modal store", () => {
  beforeEach(resetStore);

  it("opens and closes an error", () => {
    useFeedbackModalStore.getState().openFeedback({
      variant: "error",
      title: "Cannot continue",
      message: "Try again later.",
    });

    expect(useFeedbackModalStore.getState().feedback).toEqual({
      variant: "error",
      title: "Cannot continue",
      message: "Try again later.",
    });

    useFeedbackModalStore.getState().closeFeedback();

    expect(useFeedbackModalStore.getState().feedback).toBeNull();
  });

  it("supports success feedback", () => {
    useFeedbackModalStore.getState().openFeedback({
      variant: "success",
      title: "Saved",
      message: "Your changes were saved.",
    });

    expect(useFeedbackModalStore.getState().feedback).toEqual({
      variant: "success",
      title: "Saved",
      message: "Your changes were saved.",
    });
  });

  it.each(["warning", "info"] as const)(
    "supports %s feedback",
    (variant) => {
      useFeedbackModalStore.getState().openFeedback({
        variant,
        title: "Notice",
        message: "Useful information.",
      });

      expect(useFeedbackModalStore.getState().feedback).toEqual({
        variant,
        title: "Notice",
        message: "Useful information.",
      });
    },
  );

  it("replaces the current feedback with a newer one", () => {
    useFeedbackModalStore.getState().openFeedback({
      variant: "error",
      title: "First error",
      message: "First message",
    });
    useFeedbackModalStore.getState().openFeedback({
      variant: "success",
      title: "Completed",
      message: "Second message",
    });

    expect(useFeedbackModalStore.getState().feedback).toEqual({
      variant: "success",
      title: "Completed",
      message: "Second message",
    });
  });
});
