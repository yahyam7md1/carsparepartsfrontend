import axios from "axios";
import { isAxiosErrorLike, toApiError } from "./toApiError";
import { getApiBaseUrl } from "./getApiBaseUrl";

const baseURL = getApiBaseUrl();

/** Shop and public API — no session cookies. */
export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!isAxiosErrorLike(error)) {
      return Promise.reject(error);
    }
    return toApiError(error);
  },
);
