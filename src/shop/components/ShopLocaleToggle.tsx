"use client";

import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

type Props = Readonly<{
  /** Extend or override layout when final nav/footer design is implemented. */
  className?: string;
}>;

/**
 * Minimal EN/AR switcher. Styling is placeholder — replace when UI design is ready.
 * Drop this into the future ShopHeader, ShopFooter, or any shop page.
 */
export function ShopLocaleToggle({ className }: Props) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div
      className={clsx(
        "flex flex-wrap items-center gap-2 text-sm",
        className,
      )}
      data-component="shop-locale-toggle"
      dir="ltr"
    >
      <span className="text-secondary">{t("language")}:</span>
      <Link
        aria-current={locale === "en" ? "true" : undefined}
        className={clsx(
          "underline-offset-4 hover:underline",
          locale === "en" ? "font-semibold text-primary" : "text-secondary",
        )}
        href={pathname}
        locale="en"
      >
        English
      </Link>
      <span aria-hidden className="text-secondary">
        |
      </span>
      <Link
        aria-current={locale === "ar" ? "true" : undefined}
        className={clsx(
          "underline-offset-4 hover:underline",
          locale === "ar" ? "font-semibold text-primary" : "text-secondary",
        )}
        href={pathname}
        locale="ar"
      >
        العربية
      </Link>
    </div>
  );
}
