"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

export type AdminNavLinkProps = Readonly<{
  href: string;
  label: string;
  icon: LucideIcon;
}>;

export function AdminNavLink({ href, label, icon: Icon }: AdminNavLinkProps) {
  const pathname = usePathname();
  const active =
    href === "/admin/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-white"
          : "text-[#4a5568] hover:bg-[#f3f4f6] hover:text-primary",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="size-5 shrink-0 stroke-[1.75]" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}
