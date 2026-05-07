"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, isApiError } from "@/lib/api/errors";
import {
  fetchProductFitments,
  fetchProductPublic,
} from "@/lib/api/services/products";
import type { ProductDetail, ProductFitmentsResponse } from "@/lib/api/types";

function normalizeError(e: unknown): ApiError | Error {
  if (isApiError(e)) {
    return e;
  }
  if (e instanceof Error) {
    return e;
  }
  return new Error("Unknown error");
}

export function useProduct(productId: string | null) {
  const [data, setData] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(productId));
  const [error, setError] = useState<ApiError | Error | null>(null);

  const refetch = useCallback(async () => {
    if (!productId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const product = await fetchProductPublic(productId);
      setData(product);
    } catch (e) {
      setData(null);
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

export function useProductFitments(productId: string | null) {
  const [data, setData] = useState<ProductFitmentsResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(productId));
  const [error, setError] = useState<ApiError | Error | null>(null);

  const refetch = useCallback(async () => {
    if (!productId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchProductFitments(productId);
      setData(res);
    } catch (e) {
      setData(null);
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
