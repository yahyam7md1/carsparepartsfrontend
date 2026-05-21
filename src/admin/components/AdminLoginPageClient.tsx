"use client";

import { ADMIN_DASHBOARD_PATH } from "@/admin/constants/adminUiRoutes";
import { AdminLoginForm } from "@/admin/components/AdminLoginForm";
import { useAuth } from "@/admin/context/AdminAuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminLoginPageClient() {
  const { status, user, refreshSession } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void refreshSession().finally(() => setReady(true));
  }, [refreshSession]);

  useEffect(() => {
    if (!ready) return;
    if (status === "authenticated" && user) {
      router.replace(ADMIN_DASHBOARD_PATH);
    }
  }, [ready, status, user, router]);

  if (!ready || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-secondary">Loading…</p>
      </div>
    );
  }

  if (status === "authenticated" && user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-secondary/20 bg-white shadow-sm ring-1 ring-primary/5">
        <div className="h-1 bg-accent" aria-hidden />
        <div className="p-8 sm:p-10">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
