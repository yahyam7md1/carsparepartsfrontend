"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { setAdminUnauthorizedHandler } from "@/lib/api/adminClient";
import {
  fetchAdminMe,
  loginRequest,
  logoutRequest,
} from "@/lib/api/services/auth";
import { isApiError } from "@/lib/api/errors";
import type { AdminUser } from "@/lib/api/types/auth";

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

type AdminAuthContextValue = {
  user: AdminUser | null;
  status: AuthStatus;
  loginError: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearLoginError: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [loginError, setLoginError] = useState<string | null>(null);

  const clearLoginError = useCallback(() => setLoginError(null), []);

  const refreshSession = useCallback(async () => {
    setStatus((s) => (s === "authenticated" ? s : "loading"));
    try {
      const me = await fetchAdminMe();
      setUser(me);
      setStatus("authenticated");
    } catch (e) {
      setUser(null);
      if (isApiError(e) && e.status === 401) {
        setStatus("unauthenticated");
        return;
      }
      setStatus("unauthenticated");
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setLoginError(null);
    setStatus("loading");
    try {
      await loginRequest({ username, password });
      const me = await fetchAdminMe();
      setUser(me);
      setStatus("authenticated");
      router.replace("/admin/dashboard");
    } catch (e) {
      setUser(null);
      setStatus("unauthenticated");
      const message = isApiError(e) ? e.message : "Sign in failed";
      setLoginError(message);
    }
  }, [router]);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    setStatus("unauthenticated");
    router.replace("/admin/login");
  }, [router]);

  useEffect(() => {
    const handler = () => {
      setUser(null);
      setStatus("unauthenticated");
      if (!pathname.startsWith("/admin/login")) {
        router.replace("/admin/login");
      }
    };
    setAdminUnauthorizedHandler(handler);
    return () => setAdminUnauthorizedHandler(null);
  }, [router, pathname]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      user,
      status,
      loginError,
      login,
      logout,
      refreshSession,
      clearLoginError,
    }),
    [user, status, loginError, login, logout, refreshSession, clearLoginError],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
