"use client";

import { Search } from "lucide-react";
import clsx from "clsx";
import type { AdminCategoryRow } from "@/lib/api/services/adminCategories";
import { SearchField, Select } from "@/shared/ui";

export type InventoryToolbarProps = Readonly<{
  search: string;
  onSearchChange: (v: string) => void;
  categoryId: number | "";
  onCategoryChange: (id: number | "") => void;
  categories: AdminCategoryRow[];
  categoriesLoading: boolean;
  className?: string;
}>;

export function InventoryToolbar({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  categories,
  categoriesLoading,
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
      <div className="w-full sm:w-56">
        <Select
          disabled={categoriesLoading}
          value={categoryId === "" ? "" : String(categoryId)}
          onChange={(e) => {
            const v = e.target.value;
            onCategoryChange(v === "" ? "" : Number(v));
          }}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameEn}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
