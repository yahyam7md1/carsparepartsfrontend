/**
 * Browser (default): empty base URL → same-origin `/api/*`, proxied by Next.js
 * (see `rewrites` in `next.config.ts`) so `withCredentials` works without CORS.
 *
 * Override with `NEXT_PUBLIC_API_BASE_URL` when the API is on another origin and
 * the backend sends a concrete `Access-Control-Allow-Origin` (not `*`).
 *
 * Server-side: uses `API_PROXY_TARGET` or `http://localhost:3001` — no browser CORS.
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return "";
  return (
    process.env.API_PROXY_TARGET?.replace(/\/$/, "") ?? "http://localhost:3001"
  );
}
