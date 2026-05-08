"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, isApiError } from "@/lib/api/errors";
import { fetchAdminStats } from "@/lib/api/services/adminStats";
import type { AdminStats } from "@/lib/api/types";

function normalizeError(e: unknown): ApiError | Error {
  if (isApiError(e)) return e;
  if (e instanceof Error) return e;
  return new Error("Unknown error");
}

export function useAdminStats(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminStats();
      setData(res);
    } catch (e) {
      setData(null);
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
