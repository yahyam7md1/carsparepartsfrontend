"use client";

import {
  BookOpen,
  LayoutGrid,
  LogOut,
  Package,
  Settings,
  SlidersHorizontal,
} from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/admin/context/AdminAuthContext";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  {
    href: "/admin/vehicles",
    label: "Vehicle Library",
    shortLabel: "Vehicles",
    icon: BookOpen,
  },
  { href: "/admin/categories", label: "Categories", icon: SlidersHorizontal },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function BrandBlock({ className }: { className?: string }) {
  return (
    <div className={clsx("flex items-center gap-3 px-2", className)}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
        <Settings className="size-5" aria-hidden strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold uppercase leading-tight tracking-wide text-primary">
          Almani Motors
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
          Admin console
        </p>
      </div>
    </div>
  );
}

function SidebarNavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
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

function MobileNavLink({
  href,
  label,
  ariaLabel,
  icon: Icon,
}: {
  href: string;
  label: string;
  /** Full name for accessibility (e.g. “Vehicle Library” vs short “Vehicles”). */
  ariaLabel: string;
  icon: LucideIcon;
}) {
  const pathname = usePathname();
  const active =
    href === "/admin/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      title={ariaLabel}
      aria-label={ariaLabel}
      className={clsx(
        "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-1.5 text-[0.6rem] font-semibold leading-tight transition-colors min-[400px]:px-1 min-[400px]:py-2 min-[400px]:text-[0.65rem]",
        active ? "text-primary" : "text-[#4a5568]",
      )}
      aria-current={active ? "page" : undefined}
    >
      <span
        className={clsx(
          "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors min-[400px]:size-9",
          active ? "bg-primary text-white" : "bg-[#eceff3] text-[#4a5568]",
        )}
      >
        <Icon className="size-[1.05rem] shrink-0 stroke-[1.75] min-[400px]:size-[1.15rem]" aria-hidden />
      </span>
      <span className="hidden w-full text-center line-clamp-2 min-[380px]:block">{label}</span>
    </Link>
  );
}

export function AdminMobileHeaderBrand() {
  return <BrandBlock className="px-0" />;
}

export function AdminSidebar() {
  const { logout } = useAuth();

  return (
    <>
      <aside
        className="hidden h-screen w-72 shrink-0 flex-col border-e border-black/[.08] bg-[#f9fafb] px-3 py-6 md:flex"
        aria-label="Admin navigation"
      >
        <BrandBlock />

        <hr className="my-6 border-black/[.06]" />

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <SidebarNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </nav>

        <hr className="my-4 border-black/[.06]" />

        <button
          type="button"
          onClick={() => void logout()}
          className="flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-red-600/90 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="size-5 shrink-0" aria-hidden strokeWidth={2} />
          Log out
        </button>
      </aside>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex items-stretch border-t border-black/[.08] bg-[#f9fafb]/95 px-1 pt-1 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md pb-[max(0.35rem,env(safe-area-inset-bottom))] md:hidden"
        aria-label="Admin navigation"
      >
        {navItems.map((item) => (
          <MobileNavLink
            key={item.href}
            href={item.href}
            label={"shortLabel" in item ? item.shortLabel : item.label}
            ariaLabel={item.label}
            icon={item.icon}
          />
        ))}
        <button
          type="button"
          onClick={() => void logout()}
          aria-label="Log out"
          title="Log out"
          className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-1.5 text-[0.6rem] font-semibold leading-tight text-red-600/90 transition-colors active:bg-red-50 min-[400px]:px-1 min-[400px]:py-2 min-[400px]:text-[0.65rem]"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#eceff3] min-[400px]:size-9">
            <LogOut className="size-[1.05rem] shrink-0 min-[400px]:size-[1.15rem]" aria-hidden strokeWidth={2} />
          </span>
          <span className="hidden w-full text-center line-clamp-2 min-[380px]:block">Log out</span>
        </button>
      </nav>
    </>
  );
}
