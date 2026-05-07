"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, isApiError } from "@/lib/api/errors";
import type {
  FeaturedProductsParams,
  PublicProductListParams,
} from "@/lib/api/services/products";
import {
  fetchFeaturedProducts,
  fetchProductsPublic,
} from "@/lib/api/services/products";
import type { PaginatedProducts } from "@/lib/api/types";

function normalizeError(e: unknown): ApiError | Error {
  if (isApiError(e)) {
    return e;
  }
  if (e instanceof Error) {
    return e;
  }
  return new Error("Unknown error");
}

/**
 * Public product list with filters; re-fetches when `params` (serialized) changes.
 */
export function usePublicProducts(params?: PublicProductListParams) {
  const [data, setData] = useState<PaginatedProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const paramsKey = JSON.stringify(params ?? {});

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parsed =
        paramsKey === "{}" ? undefined : (JSON.parse(paramsKey) as PublicProductListParams);
      const res = await fetchProductsPublic(parsed);
      setData(res);
    } catch (e) {
      setData(null);
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

export function useFeaturedProducts(params?: FeaturedProductsParams) {
  const [data, setData] = useState<PaginatedProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const paramsKey = JSON.stringify(params ?? {});

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parsed =
        paramsKey === "{}" ? undefined : (JSON.parse(paramsKey) as FeaturedProductsParams);
      const res = await fetchFeaturedProducts(parsed);
      setData(res);
    } catch (e) {
      setData(null);
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
