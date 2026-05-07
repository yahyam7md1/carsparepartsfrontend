import axios, { type AxiosError } from "axios";
import { ApiError } from "./errors";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3001";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; details?: unknown }>) => {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data;

    const messageFromBody =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof (payload as { error: unknown }).error === "string"
        ? (payload as { error: string }).error
        : null;

    const message = messageFromBody ?? error.message ?? "Request failed";

    if (process.env.NODE_ENV === "development") {
      const method = error.config?.method?.toUpperCase() ?? "?";
      const url = error.config?.url ?? "";
      console.warn("[api]", `${method} ${url}`, status || "network", message);
    }

    const details =
      typeof payload === "object" &&
      payload !== null &&
      "details" in payload
        ? (payload as { details: unknown }).details
        : undefined;

    return Promise.reject(new ApiError(message, status, details));
  },
);
