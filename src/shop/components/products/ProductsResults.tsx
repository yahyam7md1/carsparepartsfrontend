"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  fetchProductsPublic,
  PRODUCT_SORT_API_KEY,
} from "@/lib/api/services/products";
import type { ProductListRow } from "@/lib/api/types";
import type { AppLocale } from "@/i18n/routing";
import { Button } from "@/shared/ui/button";
import { useProductFilters } from "@/shop/hooks/useProductFilters";
import { ProductCard } from "./ProductCard";
import { ProductGrid } from "./ProductGrid";
import { ProductsSkeletonGrid } from "./ProductsSkeletonGrid";

const PAGE_LIMIT = 12;

type ResultsState = {
  products: ProductListRow[];
  total: number;
  page: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
};

const INITIAL_STATE: ResultsState = {
  products: [],
  total: 0,
  page: 0,
  loading: true,
  loadingMore: false,
  error: null,
};

export type ProductsResultsProps = Readonly<{
  onTotalChange?: (total: number) => void;
}>;

export function ProductsResults({ onTotalChange }: ProductsResultsProps) {
  const t = useTranslations("products");
  const locale = useLocale() as AppLocale;
  const { filters } = useProductFilters();
  const [state, setState] = useState<ResultsState>(INITIAL_STATE);

  const filtersKey = JSON.stringify(filters);

  const loadPage = useCallback(
    async (pageToLoad: number, append: boolean) => {
      setState((prev) => ({
        ...prev,
        loading: !append,
        loadingMore: append,
        error: null,
      }));
      try {
        const params = JSON.parse(filtersKey) as typeof filters;
        const res = await fetchProductsPublic({
          q: params.q || undefined,
          brand: params.brand.length ? params.brand : undefined,
          categoryIds: params.categoryIds.length ? params.categoryIds : undefined,
          vehicleId: params.vehicleId ?? undefined,
          oem: params.oem || undefined,
          sort: PRODUCT_SORT_API_KEY[params.sort],
          page: pageToLoad,
          limit: PAGE_LIMIT,
        });
        setState((prev) => ({
          ...prev,
          products: append ? [...prev.products, ...res.products] : res.products,
          total: res.total,
          page: pageToLoad,
          loading: false,
          loadingMore: false,
        }));
        onTotalChange?.(res.total);
      } catch {
        setState((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
          error: t("loadError"),
        }));
      }
    },
    [filtersKey, onTotalChange, t],
  );

  useEffect(() => {
    void loadPage(1, false);
  }, [loadPage]);

  if (state.loading && state.products.length === 0) {
    return <ProductsSkeletonGrid />;
  }

  if (state.error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
        {state.error}
      </div>
    );
  }

  if (state.products.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200/90 bg-white px-6 py-16 text-center shadow-sm">
        <p className="text-base font-semibold text-primary">{t("noResults")}</p>
        <p className="mt-2 text-sm text-secondary">{t("noResultsHint")}</p>
      </div>
    );
  }

  const hasMore = state.products.length < state.total;

  return (
    <div className="space-y-8">
      <ProductGrid cols="plp">
        {state.products.map((p) => (
          <ProductCard key={p.id} locale={locale} product={p} />
        ))}
      </ProductGrid>
      {hasMore && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => void loadPage(state.page + 1, true)}
            disabled={state.loadingMore}
            className="min-w-[12rem]"
          >
            {state.loadingMore ? t("loadingMore") : t("loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
