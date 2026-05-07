"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, isApiError } from "@/lib/api/errors";
import { fetchCategoryTree } from "@/lib/api/services/categories";
import type { CategoryTreeNode } from "@/lib/api/types";

function normalizeError(e: unknown): ApiError | Error {
  if (isApiError(e)) {
    return e;
  }
  if (e instanceof Error) {
    return e;
  }
  return new Error("Unknown error");
}

export function useCategoriesTree() {
  const [data, setData] = useState<CategoryTreeNode[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tree = await fetchCategoryTree();
      setData(tree);
    } catch (e) {
      setData(null);
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
