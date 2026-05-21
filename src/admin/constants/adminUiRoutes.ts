/** Next.js browser routes for the admin app (not REST `/api/admin`). */
export const ADMIN_UI_BASE = "/internal/manage";

export const ADMIN_LOGIN_PATH = `${ADMIN_UI_BASE}/login`;
export const ADMIN_DASHBOARD_PATH = `${ADMIN_UI_BASE}/dashboard`;

export function isAdminLoginPath(pathname: string): boolean {
  return (
    pathname === ADMIN_LOGIN_PATH ||
    pathname.startsWith(`${ADMIN_LOGIN_PATH}/`)
  );
}
