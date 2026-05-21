"use client";

import { ADMIN_LOGIN_PATH } from "@/admin/constants/adminUiRoutes";
import { AdminShell } from "@/admin/components/AdminShell";
import { useAuth } from "@/admin/context/AdminAuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminProtectedLayoutClient({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { status, user, refreshSession } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void refreshSession().finally(() => setReady(true));
  }, [refreshSession]);

  useEffect(() => {
    if (!ready) return;
    if (status === "unauthenticated" || !user) {
      router.replace(ADMIN_LOGIN_PATH);
    }
  }, [ready, status, user, router]);

  if (!ready || status === "idle" || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-secondary">Loading…</p>
      </div>
    );
  }

  if (status !== "authenticated" || !user) {
    return null;
  }

  return <AdminShell>{children}</AdminShell>;
}
