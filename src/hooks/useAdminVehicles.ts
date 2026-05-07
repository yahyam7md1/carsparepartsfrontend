"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, isApiError } from "@/lib/api/errors";
import {
  fetchAdminVehicles,
  type AdminVehiclesParams,
  type AdminVehiclesResponse,
} from "@/lib/api/services/vehicles";

function normalizeError(e: unknown): ApiError | Error {
  if (isApiError(e)) {
    return e;
  }
  if (e instanceof Error) {
    return e;
  }
  return new Error("Unknown error");
}

export function useAdminVehicles(
  options: {
    enabled?: boolean;
    params?: AdminVehiclesParams;
  } = {},
) {
  const { enabled = true, params } = options;
  const [data, setData] = useState<AdminVehiclesResponse | null>(null);
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
        paramsKey === "{}" ? undefined : (JSON.parse(paramsKey) as AdminVehiclesParams);
      const res = await fetchAdminVehicles(parsed);
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
