"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { SearchField } from "@/shared/ui/search-field";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useProductFilters } from "@/shop/hooks/useProductFilters";

export function ProductsSearchBar() {
  const t = useTranslations("products");
  const { filters, updateFilters } = useProductFilters();
  const [local, setLocal] = useState(filters.q);
  const debounced = useDebouncedValue(local, 350);

  useEffect(() => {
    if (debounced !== filters.q) {
      updateFilters({ q: debounced });
    }
  }, [debounced, filters.q, updateFilters]);

  useEffect(() => {
    if (filters.q !== local && document.activeElement?.id !== "products-search") {
      setLocal(filters.q);
    }
  }, [filters.q]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SearchField
      id="products-search"
      aria-label={t("searchPlaceholder")}
      placeholder={t("searchPlaceholder")}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      leftAdornment={<Search className="size-4" strokeWidth={2} />}
      className="h-12 min-h-12 rounded-xl"
      inputClassName="h-12 text-sm"
    />
  );
}
