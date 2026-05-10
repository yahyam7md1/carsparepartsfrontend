"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ProductsFilterSidebar } from "@/shop/components/products/filters/ProductsFilterSidebar";
import { ProductsSearchBar } from "@/shop/components/products/ProductsSearchBar";
import { ProductsSortDropdown } from "@/shop/components/products/ProductsSortDropdown";
import { MobileFilterPopover } from "@/shop/components/products/MobileFilterPopover";
import { ProductsResults } from "@/shop/components/products/ProductsResults";

export function ProductsView() {
  const t = useTranslations("products");
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

          {/* Meta row: result count + sort dropdown */}
          <div className="mt-4 flex items-center justify-between gap-3">
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
            <ProductsSortDropdown />
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
