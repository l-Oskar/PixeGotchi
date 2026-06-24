import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth.store";
import { API_URL } from "./config";
import { reportClientError } from "@/services/client-logger";

export const apiClient = axios.create({
  baseURL: API_URL,
  //baseURL: import.meta.env.VITE_API_URL_LOCAL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    let token: string | null;
    token = useAuthStore.getState().accessToken;

    // if (import.meta.env.DEV) {
    //   token = import.meta.env.VITE_DEV_TOKEN;
    // } else {
    //   token = useAuthStore.getState().accessToken;
    // }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    reportClientError("api", error, {
      requestId: error.response?.headers["x-request-id"] as string | undefined,
      metadata: {
        apiMethod: error.config?.method?.toUpperCase(),
        apiPath: error.config?.url?.split("?", 1)[0],
        statusCode: error.response?.status,
      },
    });

    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);
