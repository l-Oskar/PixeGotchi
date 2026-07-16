export type ConfirmationTone = "default" | "warning" | "danger";

export interface ConfirmationOptions {
  title: string;
  message: string;
  tone?: ConfirmationTone;
  confirmLabel?: string;
  cancelLabel?: string;
}
