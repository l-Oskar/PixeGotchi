export type ToastVariant = "success" | "info";

export interface ToastInput {
  variant: ToastVariant;
  message: string;
  title?: string;
  durationMs?: number;
}

export interface ToastDetails extends ToastInput {
  id: string;
}

export type CustomToastInput = Omit<ToastInput, "variant">;
