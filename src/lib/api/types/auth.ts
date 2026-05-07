/**
 * Admin auth — backend contract:
 * - `POST /api/auth/login` body `{ username, password }` → `{ token }` (JWT).
 * - Store token in `sessionStorage` (see `adminToken`); `adminApi` sends
 *   `Authorization: Bearer <token>` on all routes except login.
 * - `GET /api/admin/me` → {@link AdminUser}.
 * - `POST /api/auth/logout` optional; token is cleared client-side regardless.
 */
export type AdminUser = {
  id: string;
  username: string;
  createdAt: string;
};

export type AdminLoginResponse = {
  token: string;
};
