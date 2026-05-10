"use client";

import { useTranslations } from "next-intl";
import { useCategoriesTree } from "@/hooks";
import { useProductFilters } from "@/shop/hooks/useProductFilters";
import { FilterGroup } from "./FilterGroup";
import { BrandFilterCards } from "./BrandFilterCards";
import { CategoryFilterTree } from "./CategoryFilterTree";

export type ProductsFilterSidebarProps = Readonly<{
  /** Render variant — desktop is sticky aside, mobile is plain block (inside popover). */
  variant?: "desktop" | "mobile";
}>;

const HEADING_CLASS = "text-lg font-semibold tracking-tight text-primary";

export function ProductsFilterSidebarContent() {
  const t = useTranslations("products");
  const { data: tree } = useCategoriesTree();
  const { filters, toggleBrand, setCategoryBranch } = useProductFilters();

  return (
    <div className="space-y-5">
      <FilterGroup title={t("filtersCarManufacturer")}>
        <BrandFilterCards selected={filters.brand} onToggle={toggleBrand} />
      </FilterGroup>

      {tree && tree.length > 0 ? (
        <>
          {/* Inset divider between Brand and Category sections */}
          <div className="mx-2 border-t border-neutral-200/70" />
          <FilterGroup title={t("filtersPartCategory")}>
            <CategoryFilterTree
              tree={tree}
              selected={filters.categoryIds}
              onToggleBranch={setCategoryBranch}
            />
          </FilterGroup>
        </>
      ) : null}
    </div>
  );
}

export function ProductsFilterSidebar({
  variant = "desktop",
}: ProductsFilterSidebarProps) {
  const t = useTranslations("products");

  if (variant === "mobile") {
    return (
      <div className="space-y-5">
        <h2 className={HEADING_CLASS}>{t("filtersTitle")}</h2>
        <div className="-mx-5 border-t border-neutral-200/80" />
        <ProductsFilterSidebarContent />
      </div>
    );
  }

  return (
    <aside
      aria-label={t("filtersTitle")}
      className="sticky top-24 hidden w-64 shrink-0 lg:block"
    >
      <div
        className={[
          "max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-sm",
          // Auto-hide thin scrollbar (WebKit + Firefox)
          "[scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:transparent_transparent]",
          "[&::-webkit-scrollbar]:w-1.5",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full",
          "hover:[&::-webkit-scrollbar-thumb]:bg-neutral-300/80 hover:[scrollbar-color:rgba(212,212,216,0.8)_transparent]",
        ].join(" ")}
      >
        <h2 className={HEADING_CLASS}>{t("filtersTitle")}</h2>
        {/* Full-bleed divider directly under the heading */}
        <div className="-mx-5 my-4 border-t border-neutral-200/80" />
        <ProductsFilterSidebarContent />
      </div>
    </aside>
  );
}
