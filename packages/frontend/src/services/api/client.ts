import axios, { AxiosError } from "axios";
import { logout, useAuthStore } from "@/store/auth.store";
import { API_URL } from "./config";
import { reportClientError } from "@/services/client-logger";

const AUTH_LOGIN_PATH = "/auth/telegram";
const AUTH_REFRESH_PATH = "/auth/refresh";
const TOKEN_REFRESH_THRESHOLD_MS = 60 * 1000;

export const apiClient = axios.create({
  baseURL: API_URL,
  //baseURL: import.meta.env.VITE_API_URL_LOCAL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

let refreshPromise: Promise<string> | null = null;

const getTokenExpiresAt = (token: string): number | null => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(atob(normalizedPayload));

    return typeof decodedPayload.exp === "number"
      ? decodedPayload.exp * 1000
      : null;
  } catch {
    return null;
  }
};

const shouldRefreshToken = (token: string) => {
  const expiresAt = getTokenExpiresAt(token);

  return expiresAt !== null && expiresAt - Date.now() <= TOKEN_REFRESH_THRESHOLD_MS;
};

const isAuthRequest = (url?: string) =>
  !!url && (url.includes(AUTH_LOGIN_PATH) || url.includes(AUTH_REFRESH_PATH));

const refreshAccessToken = async (token: string) => {
  refreshPromise ??= axios
    .post<{ token: string }>(
      `${API_URL}${AUTH_REFRESH_PATH}`,
      undefined,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    .then(({ data }) => {
      useAuthStore.getState().setAuth(data.token);
      return data.token;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

apiClient.interceptors.request.use(
  async (config) => {
    let token: string | null;
    token = useAuthStore.getState().accessToken;

    // if (import.meta.env.DEV) {
    //   token = import.meta.env.VITE_DEV_TOKEN;
    // } else {
    //   token = useAuthStore.getState().accessToken;
    // }

    if (token && !isAuthRequest(config.url) && shouldRefreshToken(token)) {
      try {
        token = await refreshAccessToken(token);
      } catch {
        logout();
        return config;
      }
    }

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
      logout();
    }
    return Promise.reject(error);
  },
);
