"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";

type MatchMode = "exact" | "prefix";

type Props = Readonly<{
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  /** `prefix` matches nested routes (e.g. `/products` matches `/products/abc`). */
  match?: MatchMode;
  /** Fires after the link is activated (e.g. close a mobile drawer). */
  onNavigate?: () => void;
}>;

export function NavLink({
  href,
  children,
  className,
  activeClassName = "font-semibold text-primary",
  match = "exact",
  onNavigate,
}: Props) {
  const pathname = usePathname();
  const active =
    match === "prefix"
      ? pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))
      : pathname === href;

  return (
    <Link
      className={clsx(
        "text-sm text-primary transition-opacity hover:opacity-80",
        active ? activeClassName : "font-medium",
        className,
      )}
      href={href}
      onClick={() => onNavigate?.()}
    >
      {children}
    </Link>
  );
}
