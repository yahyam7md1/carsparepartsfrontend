"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ProductsFilterSidebar } from "@/shop/components/products/filters/ProductsFilterSidebar";
import { ProductsSearchBar } from "@/shop/components/products/ProductsSearchBar";
import { ProductsSortDropdown } from "@/shop/components/products/ProductsSortDropdown";
import { MobileFilterPopover } from "@/shop/components/products/MobileFilterPopover";
import { ProductsResults } from "@/shop/components/products/ProductsResults";
import { useProductFilters } from "@/shop/hooks/useProductFilters";

export function ProductsView() {
  const t = useTranslations("products");
  const { isAnyFilterActive } = useProductFilters();
  const [total, setTotal] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex gap-8">
        {/* Sticky filter sidebar (desktop only). Top-aligned with the search bar. */}
        <ProductsFilterSidebar variant="desktop" />

        {/* Main column: search bar → meta row (count + sort) → results grid. */}
        <main className="min-w-0 flex-1">
          {/* Search bar + mobile filter trigger */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ProductsSearchBar />
            </div>
            <MobileFilterPopover />
          </div>

          {/* Meta row: result count + all products + sort */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="text-sm text-secondary">
              {total == null ? (
                <span className="opacity-60">&nbsp;</span>
              ) : (
                <>
                  <span className="font-semibold text-primary">{total}</span>{" "}
                  {t("productsCount")}
                </>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className={
                  isAnyFilterActive
                    ? "text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                    : "text-sm font-medium text-secondary hover:text-primary"
                }
              >
                {t("allProducts")}
              </Link>
              <ProductsSortDropdown />
            </div>
          </div>

          {/* Results grid */}
          <div className="mt-5">
            <ProductsResults onTotalChange={setTotal} />
          </div>
        </main>
      </div>
    </div>
  );
}
