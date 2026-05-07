"use client";

import {
  BookOpen,
  LayoutGrid,
  Package,
  Settings,
  SlidersHorizontal,
} from "lucide-react";
import { AdminNavLink } from "@/admin/components/AdminNavLink";
import { useAuth } from "@/admin/context/AdminAuthContext";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/vehicles", label: "Vehicle Library", icon: BookOpen },
  { href: "/admin/categories", label: "Categories", icon: SlidersHorizontal },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminSidebar() {
  const { logout } = useAuth();

  return (
    <aside
      className="flex h-screen w-72 shrink-0 flex-col border-e border-black/[.08] bg-[#f9fafb] px-3 py-6"
      aria-label="Admin navigation"
    >
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
          <Settings className="size-5" aria-hidden strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase leading-tight tracking-wide text-primary">
            Genuine German
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
            Admin console
          </p>
        </div>
      </div>

      <hr className="my-6 border-black/[.06]" />

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <AdminNavLink key={item.href} {...item} />
        ))}
      </nav>

      <hr className="my-4 border-black/[.06]" />

      <button
        type="button"
        onClick={() => void logout()}
        className="flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-red-600/90 transition-colors hover:bg-red-50 hover:text-red-700"
      >
        <span className="inline-flex size-5 items-center justify-center" aria-hidden>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </span>
        Log out
      </button>
    </aside>
  );
}
