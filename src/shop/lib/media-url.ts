/**
 * Normalizes API image paths for `<img>` / `next/image`.
 * Relative paths use the app origin (Next rewrites `/uploads/*` to the API).
 */
export function getMediaUrl(path: string): string {
  if (!path) return "";
  const p = path.trim();
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  return p.startsWith("/") ? p : `/${p}`;
}
