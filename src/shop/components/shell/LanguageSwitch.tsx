"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

export type HeaderLanguageMode = "mobile-dropdown" | "desktop-segmented";

type Variant = "header" | "footer";

type Props = Readonly<{
  variant?: Variant;
  /** When `variant` is `header`, selects compact dropdown vs pill switcher. */
  headerMode?: HeaderLanguageMode;
  className?: string;
  /** Smaller dropdown trigger (mobile toolbar). */
  compact?: boolean;
}>;

export function LanguageSwitch({
  variant = "header",
  headerMode = "desktop-segmented",
  className,
  compact = false,
}: Props) {
  const t = useTranslations("nav");
  const tf = useTranslations("footer");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();

  if (variant === "footer") {
    return (
      <div
        className={clsx(
          "flex flex-wrap items-center gap-2 text-sm text-white/90",
          className,
        )}
        data-component="language-switch-footer"
        dir="ltr"
      >
        <Link
          aria-current={locale === "en" ? "true" : undefined}
          className={clsx(
            "rounded px-2 py-0.5 transition-colors",
            locale === "en"
              ? "bg-white/15 font-medium text-white"
              : "text-white/70 hover:text-white",
          )}
          href={pathname}
          locale="en"
        >
          {tf("footerLocaleEnShort")}
        </Link>
        <span className="text-white/50" aria-hidden>
          /
        </span>
        <Link
          aria-current={locale === "ar" ? "true" : undefined}
          className={clsx(
            "rounded px-2 py-0.5 transition-colors",
            locale === "ar"
              ? "bg-white/15 font-medium text-white"
              : "text-white/70 hover:text-white",
          )}
          href={pathname}
          locale="ar"
        >
          {tf("footerLocaleArShort")}
        </Link>
      </div>
    );
  }

  if (headerMode === "mobile-dropdown") {
    return <HeaderLanguageDropdown className={className} compact={compact} />;
  }

  return (
    <div
      className={clsx(
        "inline-flex rounded-lg border border-primary bg-white p-0.5 shadow-sm",
        className,
      )}
      data-component="language-switch-header-desktop"
      dir="ltr"
      role="group"
      aria-label={t("language")}
    >
      <Link
        aria-current={locale === "en" ? "true" : undefined}
        className={clsx(
          "rounded-md px-3 py-1 text-sm font-medium leading-tight transition-colors",
          locale === "en"
            ? "bg-primary text-white"
            : "text-primary hover:bg-primary/5",
        )}
        href={pathname}
        locale="en"
      >
        {t("localeEnShort")}
      </Link>
      <Link
        aria-current={locale === "ar" ? "true" : undefined}
        className={clsx(
          "rounded-md px-3 py-1 text-sm font-medium leading-tight transition-colors",
          locale === "ar"
            ? "bg-primary text-white"
            : "text-primary hover:bg-primary/5",
        )}
        href={pathname}
        locale="ar"
      >
        {t("localeArShort")}
      </Link>
    </div>
  );
}

function HeaderLanguageDropdown({
  className,
  compact = false,
}: Readonly<{
  className?: string;
  compact?: boolean;
}>) {
  const t = useTranslations("nav");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      if (
        rootRef.current &&
        e.target instanceof Node &&
        !rootRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerLabel =
    locale === "en" ? t("localeEnMobileTrigger") : t("localeArMobileTrigger");

  return (
    <div
      className={clsx("relative", className)}
      data-component="language-switch-header-mobile"
      ref={rootRef}
    >
      <button
        aria-controls={listId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("languageMenu")}
        className={clsx(
          "inline-flex items-center gap-1 rounded-md text-primary",
          compact ? "ps-1.5 pe-2.5 text-xs" : "ps-2 pe-3 text-sm font-semibold",
        )}
        dir="ltr"
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        <span className={compact ? "font-bold" : undefined}>{triggerLabel}</span>
        <ChevronDown
          aria-hidden
          className={clsx(
            compact ? "h-3 w-3" : "h-4 w-4",
            "transition-transform",
            open ? "rotate-180" : "",
          )}
        />
      </button>

      {open ? (
        <div
          className="absolute end-0 top-full z-[60] mt-1 min-w-[8.5rem] rounded-lg border border-primary/10 bg-white py-1 shadow-lg ring-1 ring-black/5"
          id={listId}
          role="listbox"
        >
          <Link
            className={clsx(
              "block px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5",
              locale === "en" && "bg-primary/5",
            )}
            href={pathname}
            locale="en"
            onClick={() => setOpen(false)}
            role="option"
            aria-selected={locale === "en"}
          >
            {t("localeEnMobileTrigger")}
          </Link>
          <Link
            className={clsx(
              "block px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5",
              locale === "ar" && "bg-primary/5",
            )}
            href={pathname}
            locale="ar"
            onClick={() => setOpen(false)}
            role="option"
            aria-selected={locale === "ar"}
          >
            {t("localeArMobileTrigger")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
