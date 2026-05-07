import { adminApi } from "../adminClient";
import { setAdminAccessToken } from "../adminToken";
import type { AdminLoginResponse, AdminUser } from "../types/auth";

export async function loginRequest(body: {
  username: string;
  password: string;
}): Promise<AdminLoginResponse> {
  const { data } = await adminApi.post<AdminLoginResponse>(
    "/api/auth/login",
    body,
  );
  const token = data.token?.trim();
  if (!token) {
    throw new Error("Login response missing token");
  }
  setAdminAccessToken(token);
  return data;
}

export async function fetchAdminMe(): Promise<AdminUser> {
  const { data } = await adminApi.get<AdminUser>("/api/admin/me");
  return data;
}

export async function logoutRequest(): Promise<void> {
  try {
    await adminApi.post("/api/auth/logout");
  } catch {
    /* endpoint may not exist */
  } finally {
    setAdminAccessToken(null);
  }
}
