"use client";

import clsx from "clsx";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import type { FormEventHandler } from "react";
import { useState } from "react";
import { useCart } from "@/shop/context/cart-context";
import { LanguageSwitch } from "@/shop/components/shell/LanguageSwitch";
import { NavLink } from "@/shop/components/shell/NavLink";

function ShopSearchForm({
  q,
  setQ,
  onSubmit,
  placeholder,
  className,
  density = "comfortable",
}: Readonly<{
  q: string;
  setQ: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  placeholder: string;
  className?: string;
  /** Tighter field for mobile header / drawer. */
  density?: "comfortable" | "compact";
}>) {
  return (
    <form className={className} onSubmit={onSubmit} role="search">
      <div className="relative min-w-0">
        <Search
          aria-hidden
          className={clsx(
            "pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary sm:left-3",
            density === "compact" ? "h-3.5 w-3.5" : "h-4 w-4",
          )}
        />
        <input
          className={clsx(
            "w-full rounded-lg border border-transparent bg-[#f3f4f6] pr-3 text-sm text-foreground placeholder:text-secondary outline-none ring-primary/30 transition focus:border-primary/20 focus:bg-white focus:ring-2",
            density === "compact"
              ? "py-1.5 pl-9 text-[13px] leading-tight"
              : "py-2 pl-10",
          )}
          name="q"
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          type="search"
          value={q}
        />
      </div>
    </form>
  );
}

function HeaderCartLink({
  cartLabel,
  itemCount,
  iconClassName,
  onClick,
}: Readonly<{
  cartLabel: string;
  itemCount: number;
  iconClassName: string;
  onClick?: () => void;
}>) {
  return (
    <Link
      aria-label={cartLabel}
      className="relative inline-flex shrink-0 text-primary transition-opacity hover:opacity-80"
      href="/cart"
      onClick={onClick}
    >
      <ShoppingCart aria-hidden className={iconClassName} />
      {itemCount > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600/90 px-0.5 text-[0.6rem] font-semibold leading-none text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}

function ShopBrandLink({
  className,
}: Readonly<{
  className: string;
}>) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const isAr = locale === "ar";

  const logo = (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-visible sm:h-10 sm:w-10 lg:h-10 lg:w-10">
      <Image
        alt=""
        className="size-full origin-center scale-[1.2] object-contain sm:scale-[1.18] lg:scale-[1.22]"
        height={160}
        priority
        src="/am-logo.png"
        width={160}
      />
    </span>
  );
  const label = <span className="truncate">{t("brand")}</span>;

  return (
    <Link
      className={clsx("flex min-w-0 items-center gap-2.5", className)}
      dir="ltr"
      href="/shop"
    >
      {isAr ? (
        <>
          {label}
          {logo}
        </>
      ) : (
        <>
          {logo}
          {label}
        </>
      )}
    </Link>
  );
}

export function ShopHeader() {
  const t = useTranslations("nav");
  const router = useRouter();
  const { itemCount } = useCart();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  function runSearchNavigation() {
    const query = q.trim();
    const path =
      query === "" ? "/products" : `/products?q=${encodeURIComponent(query)}`;
    setMenuOpen(false);
    setSearchOpen(false);
    router.push(path);
  }

  function onSearchSubmit(
    e: Parameters<FormEventHandler<HTMLFormElement>>[0],
  ) {
    e.preventDefault();
    runSearchNavigation();
  }

  function toggleMenu() {
    setMenuOpen((open) => {
      if (!open) setSearchOpen(false);
      return !open;
    });
  }

  function toggleSearchRow() {
    setSearchOpen((open) => {
      if (!open) setMenuOpen(false);
      return !open;
    });
  }

  const navGroup = (
    <>
      <NavLink href="/shop" onNavigate={() => setMenuOpen(false)}>
        {t("home")}
      </NavLink>
      <NavLink
        href="/products"
        match="prefix"
        onNavigate={() => setMenuOpen(false)}
      >
        {t("products")}
      </NavLink>
      <NavLink href="/contact" onNavigate={() => setMenuOpen(false)}>
        {t("contact")}
      </NavLink>
    </>
  );

  return (
    <header
      className="sticky top-0 z-50 border-b border-primary/10 bg-white shadow-sm"
      data-component="shop-header"
    >
      <div className="mx-auto max-w-7xl px-4 py-1.5 sm:px-4 sm:py-2 lg:py-3">
        {/* Mobile */}
        <div className="flex flex-col gap-2 lg:hidden">
          <div className="flex items-center justify-between gap-2">
            <ShopBrandLink className="min-w-0 text-base font-semibold leading-tight tracking-tight text-primary sm:text-lg" />

            <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
              <button
                aria-controls="shop-mobile-search-expand"
                aria-expanded={searchOpen}
                className={clsx(
                  "inline-flex rounded-md p-1.5 text-primary",
                  searchOpen && "bg-primary/5",
                )}
                onClick={toggleSearchRow}
                type="button"
              >
                <span className="sr-only">{t("toggleSearch")}</span>
                <Search aria-hidden className="h-5 w-5" />
              </button>

              <HeaderCartLink
                cartLabel={t("cart")}
                iconClassName="h-5 w-5"
                itemCount={itemCount}
                onClick={() => {
                  setMenuOpen(false);
                  setSearchOpen(false);
                }}
              />

              <LanguageSwitch compact headerMode="mobile-dropdown" variant="header" />

              <button
                aria-controls="shop-mobile-nav"
                aria-expanded={menuOpen}
                className="inline-flex rounded-md p-1.5 text-primary"
                onClick={toggleMenu}
                type="button"
              >
                <span className="sr-only">
                  {menuOpen ? t("closeMenu") : t("openMenu")}
                </span>
                {menuOpen ? (
                  <X aria-hidden className="h-5 w-5" />
                ) : (
                  <Menu aria-hidden className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div
            className={clsx(
              "transition-[max-height] duration-200 ease-out",
              searchOpen ? "max-h-24" : "max-h-0",
            )}
            id="shop-mobile-search-expand"
          >
            {searchOpen ? (
              <ShopSearchForm
                className="w-full pt-0.5"
                density="compact"
                onSubmit={onSearchSubmit}
                placeholder={t("searchPlaceholder")}
                q={q}
                setQ={setQ}
              />
            ) : null}
          </div>

          {menuOpen ? (
            <nav
              className="flex flex-col gap-3 border-t border-primary/10 pt-3"
              id="shop-mobile-nav"
            >
              <ShopSearchForm
                className="w-full"
                density="compact"
                onSubmit={onSearchSubmit}
                placeholder={t("searchPlaceholder")}
                q={q}
                setQ={setQ}
              />
              <div className="flex flex-col gap-3">{navGroup}</div>
            </nav>
          ) : null}
        </div>

        {/* Desktop: nav fills space between brand and tools; links centered in that corridor. */}
        <div className="hidden items-center gap-6 lg:flex">
          <div className="min-w-0 shrink-0">
            <ShopBrandLink className="truncate text-xl font-semibold tracking-tight text-primary" />
          </div>

          <nav
            aria-label={t("storeNav")}
            className="flex min-w-0 flex-1 justify-center gap-8"
          >
            <NavLink href="/shop">{t("home")}</NavLink>
            <NavLink href="/products" match="prefix">
              {t("products")}
            </NavLink>
            <NavLink href="/contact">{t("contact")}</NavLink>
          </nav>

          <div className="flex min-w-0 shrink-0 items-center gap-4">
            <ShopSearchForm
              className="relative w-full min-w-[12rem] max-w-72"
              onSubmit={onSearchSubmit}
              placeholder={t("searchPlaceholder")}
              q={q}
              setQ={setQ}
            />
            <HeaderCartLink
              cartLabel={t("cart")}
              iconClassName="h-6 w-6"
              itemCount={itemCount}
            />
            <div className="shrink-0">
              <LanguageSwitch headerMode="desktop-segmented" variant="header" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
