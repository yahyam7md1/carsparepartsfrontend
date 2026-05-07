"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getDocumentLocaleFromPathname } from "@/shared/utils/documentLocaleFromPathname";

/**
 * Keeps <html lang dir> aligned with the active shop locale (en/ar) or resets
 * to English LTR for admin and other non-localized routes.
 */
export function DocumentLangDir() {
  const pathname = usePathname();
  const { lang, dir } = getDocumentLocaleFromPathname(pathname);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return null;
}
