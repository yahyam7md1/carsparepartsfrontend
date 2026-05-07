import axios, { type AxiosError } from "axios";
import { ApiError } from "./errors";

type ErrorBody = { error?: string; details?: unknown };

/**
 * Maps Axios failures to {@link ApiError} (shared by apiClient and adminApi).
 */
export function toApiError(
  error: AxiosError<ErrorBody>,
): Promise<never> {
  const status = error.response?.status ?? 0;
  const payload = error.response?.data;

  const messageFromBody =
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
      ? payload.error
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
      ? payload.details
      : undefined;

  return Promise.reject(new ApiError(message, status, details));
}

export function isAxiosErrorLike(
  error: unknown,
): error is AxiosError<ErrorBody> {
  return axios.isAxiosError(error);
}
