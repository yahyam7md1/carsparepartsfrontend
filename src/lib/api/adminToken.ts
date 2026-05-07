const STORAGE_KEY = "carspareparts_admin_jwt";

let cache: string | null = null;
let loaded = false;

function readStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** JWT from login; used as `Authorization: Bearer …` on admin API calls. */
export function getAdminAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  if (!loaded) {
    cache = readStorage();
    loaded = true;
  }
  return cache;
}

export function setAdminAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  loaded = true;
  cache = token;
  try {
    if (token) sessionStorage.setItem(STORAGE_KEY, token);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode / blocked storage */
  }
}
