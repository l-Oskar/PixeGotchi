import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api/",
});

api.interceptors.request.use((config) => {
  let token: string | null = null;

  if (import.meta.env.DEV) {
    token = import.meta.env.VITE_DEV_TOKEN;
  } else {
    token = localStorage.getItem("accessToken");
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
