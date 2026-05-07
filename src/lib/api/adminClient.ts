import axios from "axios";
import { toApiError, isAxiosErrorLike } from "./toApiError";
import { getApiBaseUrl } from "./getApiBaseUrl";
import { getAdminAccessToken, setAdminAccessToken } from "./adminToken";

const baseURL = getApiBaseUrl();

/** Optional: registered by AdminAuthProvider to sync UI on 401. */
let unauthorizedHandler: (() => void) | null = null;

export function setAdminUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

/**
 * Admin API — backend expects `Authorization: Bearer <jwt>` (see `adminToken`).
 */
export const adminApi = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

adminApi.interceptors.request.use((config) => {
  const path = config.url ?? "";
  if (path.includes("/api/auth/login")) {
    return config;
  }
  const token = getAdminAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!isAxiosErrorLike(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status ?? 0;
    const url = error.config?.url ?? "";

    if (status === 401 && !url.includes("/api/auth/login")) {
      setAdminAccessToken(null);
      if (unauthorizedHandler) {
        unauthorizedHandler();
      }
    }

    return toApiError(error);
  },
);
