"use client";

import { Search } from "lucide-react";
import clsx from "clsx";
import type { AdminCategoryRow } from "@/lib/api/services/adminCategories";
import {
  CategoryHierarchyPicker,
  type CategoryHierarchyPickerLocale,
  SearchField,
} from "@/shared/ui";

export type InventoryToolbarProps = Readonly<{
  search: string;
  onSearchChange: (v: string) => void;
  categoryId: number | "";
  onCategoryChange: (id: number | "") => void;
  categories: AdminCategoryRow[];
  categoriesLoading: boolean;
  /** Category labels + search UI (`en` / `ar`). */
  locale?: CategoryHierarchyPickerLocale;
  className?: string;
}>;

export function InventoryToolbar({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  categories,
  categoriesLoading,
  locale = "en",
  className,
}: InventoryToolbarProps) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
        className,
      )}
    >
      <SearchField
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="SKU, OEM, or name…"
        leftAdornment={<Search className="size-4" strokeWidth={2} />}
        className="min-w-0 flex-1 sm:max-w-xl"
        autoComplete="off"
      />
      <div className="w-full min-w-0 sm:w-64">
        <CategoryHierarchyPicker
          mode="filter"
          locale={locale}
          categories={categories}
          value={categoryId}
          onChange={onCategoryChange}
          disabled={categoriesLoading}
          aria-label={
            locale === "ar" ? "تصفية حسب الفئة" : "Filter by category"
          }
        />
      </div>
    </div>
  );
}
