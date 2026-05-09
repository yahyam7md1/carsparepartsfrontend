"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, isApiError } from "@/lib/api/errors";
import {
  fetchVehicleFacetBrands,
  fetchVehicleFacetSeries,
  fetchVehicleFacetVehicles,
} from "@/lib/api/services/vehicleFacets";
import type { VehicleFacetRow } from "@/lib/api/types";

function normalizeError(e: unknown): ApiError | Error {
  if (isApiError(e)) return e;
  if (e instanceof Error) return e;
  return new Error("Unknown error");
}

export function useVehicleFacetBrands() {
  const [data, setData] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const brands = await fetchVehicleFacetBrands();
      setData(brands);
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

export function useVehicleFacetSeries(brand: string | null) {
  const [data, setData] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  useEffect(() => {
    if (brand == null || brand === "") {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const series = await fetchVehicleFacetSeries(brand);
        if (!cancelled) setData(series);
      } catch (e) {
        if (!cancelled) {
          setData(null);
          setError(normalizeError(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [brand]);

  return { data, loading, error };
}

export function useVehicleFacetVehicles(
  brand: string | null,
  series: string | null,
) {
  const [data, setData] = useState<VehicleFacetRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  useEffect(() => {
    if (brand == null || brand === "" || series == null || series === "") {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const vehicles = await fetchVehicleFacetVehicles(brand, series);
        if (!cancelled) setData(vehicles);
      } catch (e) {
        if (!cancelled) {
          setData(null);
          setError(normalizeError(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [brand, series]);

  return { data, loading, error };
}
