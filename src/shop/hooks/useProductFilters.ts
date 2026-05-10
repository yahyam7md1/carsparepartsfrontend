"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import type { ProductSort } from "@/lib/api/services/products";

export type ProductFilters = {
  q: string;
  brand: string[];
  categoryIds: number[];
  vehicleId: number | null;
  oem: string;
  sort: ProductSort;
};

const DEFAULT_FILTERS: ProductFilters = {
  q: "",
  brand: [],
  categoryIds: [],
  vehicleId: null,
  oem: "",
  sort: "relevance",
};

const SORT_VALUES: ReadonlySet<ProductSort> = new Set([
  "relevance",
  "priceAsc",
  "priceDesc",
  "newest",
]);

function parseCsv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseCsvNumeric(value: string | null): number[] {
  return parseCsv(value)
    .map((s) => Number.parseInt(s, 10))
    .filter((n) => Number.isFinite(n));
}

/** URL may use legacy `categoryId` (singular); PLP uses `categoryIds`. */
function categoryIdsFromSearchParams(searchParams: {
  get: (key: string) => string | null;
}): number[] {
  const fromPlural = parseCsvNumeric(searchParams.get("categoryIds"));
  const rawSingle = searchParams.get("categoryId");
  const single =
    rawSingle !== null && rawSingle !== ""
      ? Number.parseInt(rawSingle, 10)
      : Number.NaN;
  const set = new Set<number>();
  for (const id of fromPlural) {
    if (id > 0) set.add(id);
  }
  if (Number.isFinite(single) && single > 0) set.add(single);
  return [...set];
}

function parseSort(value: string | null): ProductSort {
  if (value && SORT_VALUES.has(value as ProductSort)) {
    return value as ProductSort;
  }
  return "relevance";
}

export function useProductFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo<ProductFilters>(() => {
    const vehicleIdRaw = searchParams.get("vehicleId");
    const vehicleIdParsed = vehicleIdRaw
      ? Number.parseInt(vehicleIdRaw, 10)
      : Number.NaN;
    const vehicleId = Number.isFinite(vehicleIdParsed) ? vehicleIdParsed : null;
    return {
      q: searchParams.get("q") ?? "",
      brand: parseCsv(searchParams.get("brand")),
      categoryIds: categoryIdsFromSearchParams(searchParams),
      vehicleId,
      oem: searchParams.get("oem") ?? "",
      sort: parseSort(searchParams.get("sort")),
    };
  }, [searchParams]);

  const updateFilters = useCallback(
    (patch: Partial<ProductFilters>) => {
      const next = { ...filters, ...patch };
      const params = new URLSearchParams();

      if (next.q) params.set("q", next.q);
      if (next.brand.length) params.set("brand", next.brand.join(","));
      if (next.categoryIds.length) {
        params.set("categoryIds", next.categoryIds.join(","));
      }
      if (next.vehicleId != null) params.set("vehicleId", String(next.vehicleId));
      if (next.oem) params.set("oem", next.oem);
      if (next.sort !== "relevance") params.set("sort", next.sort);

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  const toggleBrand = useCallback(
    (brand: string) => {
      const exists = filters.brand.includes(brand);
      updateFilters({
        brand: exists
          ? filters.brand.filter((b) => b !== brand)
          : [...filters.brand, brand],
      });
    },
    [filters.brand, updateFilters],
  );

  const toggleCategory = useCallback(
    (id: number) => {
      const exists = filters.categoryIds.includes(id);
      updateFilters({
        categoryIds: exists
          ? filters.categoryIds.filter((c) => c !== id)
          : [...filters.categoryIds, id],
      });
    },
    [filters.categoryIds, updateFilters],
  );

  /**
   * Apply a single selection/deselection across many category IDs at once
   * (used when a parent category cascades its state to all descendants).
   */
  const setCategoryBranch = useCallback(
    (ids: number[], select: boolean) => {
      if (ids.length === 0) return;
      const idSet = new Set(ids);
      const next = select
        ? Array.from(new Set([...filters.categoryIds, ...ids]))
        : filters.categoryIds.filter((id) => !idSet.has(id));
      updateFilters({ categoryIds: next });
    },
    [filters.categoryIds, updateFilters],
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const isAnyFilterActive =
    filters.q !== "" ||
    filters.brand.length > 0 ||
    filters.categoryIds.length > 0 ||
    filters.vehicleId != null ||
    filters.oem !== "" ||
    filters.sort !== "relevance";

  return {
    filters,
    defaultFilters: DEFAULT_FILTERS,
    updateFilters,
    toggleBrand,
    toggleCategory,
    setCategoryBranch,
    resetFilters,
    isAnyFilterActive,
  };
}
