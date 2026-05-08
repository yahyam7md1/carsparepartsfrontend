"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, isApiError } from "@/lib/api/errors";
import { fetchAdminLowStockRows } from "@/lib/api/services/adminStats";
import type { AdminLowStockRowsResponse } from "@/lib/api/types";

function normalizeError(e: unknown): ApiError | Error {
  if (isApiError(e)) return e;
  if (e instanceof Error) return e;
  return new Error("Unknown error");
}

export function useAdminLowStockRows(
  options: { enabled?: boolean; params?: { page?: number; limit?: number; q?: string } } = {},
) {
  const { enabled = true, params } = options;
  const [data, setData] = useState<AdminLowStockRowsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const paramsKey = JSON.stringify(params ?? {});

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
      const parsed =
        paramsKey === "{}"
          ? undefined
          : (JSON.parse(paramsKey) as { page?: number; limit?: number; q?: string });
      const res = await fetchAdminLowStockRows(parsed);
      setData(res);
    } catch (e) {
      setData(null);
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
  }, [enabled, paramsKey]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
