export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: string;
  statusCode?: number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** Type guard to check if a response is an error */
export function isApiError(response: unknown): response is ApiError {
  return typeof response === "object" && response !== null && "error" in response;
}
