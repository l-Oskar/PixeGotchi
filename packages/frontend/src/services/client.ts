import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth.store";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
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
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/";
    }
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    return Promise.reject(error);
  },
);
