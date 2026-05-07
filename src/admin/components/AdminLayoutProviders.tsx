"use client";

import { AdminAuthProvider } from "@/admin/context/AdminAuthContext";

export function AdminLayoutProviders({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
