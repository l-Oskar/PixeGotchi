export type FeedbackVariant = "error" | "success" | "warning" | "info";
export type FeedbackActionTone = "default" | "danger";

export interface FeedbackAction {
  label: string;
  onClick: () => void;
  tone?: FeedbackActionTone;
}

export interface FeedbackModalDetails {
  variant: FeedbackVariant;
  title: string;
  message: string;
  status?: number;
  code?: string;
  requestId?: string;
  action?: FeedbackAction;
}

export type CustomFeedbackDetails = Omit<
  FeedbackModalDetails,
  "title" | "variant"
> & {
  title?: string;
};
