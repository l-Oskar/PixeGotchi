import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import axios from "axios";
import type { ReactNode } from "react";

const enableQueryDevtools = import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS === "1";

const shouldRetryQuery = (failureCount: number, error: unknown) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
      return false;
    }
  }

  return failureCount < 3;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: shouldRetryQuery,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {enableQueryDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
