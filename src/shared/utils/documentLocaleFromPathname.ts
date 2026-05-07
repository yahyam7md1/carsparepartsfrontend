import { getDirection, type TextDirection } from "./rtl";

export type DocumentLocale = {
  lang: string;
  dir: TextDirection;
};

/**
 * Maps pathname to document lang/dir. Shop URLs use /en/... or /ar/...;
 * everything else (e.g. /admin) defaults to English LTR.
 */
export function getDocumentLocaleFromPathname(
  pathname: string | null,
): DocumentLocale {
  if (!pathname) {
    return { lang: "en", dir: "ltr" };
  }
  const match = pathname.match(/^\/(en|ar)(?:\/|$)/);
  if (match) {
    const code = match[1];
    return { lang: code, dir: getDirection(code) };
  }
  return { lang: "en", dir: "ltr" };
}
