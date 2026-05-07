export type TextDirection = "ltr" | "rtl";

/** Map locale code to document direction (extend when you add more locales). */
export function getDirection(locale: string): TextDirection {
  return locale === "ar" ? "rtl" : "ltr";
}
