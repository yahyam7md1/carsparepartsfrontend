"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import { useProductFilters } from "@/shop/hooks/useProductFilters";
import type { ProductSort } from "@/lib/api/services/products";

const SORT_KEYS: ProductSort[] = [
  "relevance",
  "priceAsc",
  "priceDesc",
  "newest",
];

const LABEL_KEY: Record<ProductSort, string> = {
  relevance: "sortRelevance",
  priceAsc: "sortPriceAsc",
  priceDesc: "sortPriceDesc",
  newest: "sortNewest",
};

export function ProductsSortDropdown() {
  const t = useTranslations("products");
  const { filters, updateFilters } = useProductFilters();
  const currentLabel = t(LABEL_KEY[filters.sort]);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm text-secondary transition-colors hover:text-primary"
        >
          <ArrowUpDown aria-hidden className="size-4" strokeWidth={2} />
          <span>
            {t("sortBy")}{" "}
            <span className="font-semibold text-primary">{currentLabel}</span>
          </span>
          <ChevronDown aria-hidden className="size-4" strokeWidth={2} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className={clsx(
            "z-50 min-w-[12rem] rounded-xl border border-neutral-200/90 bg-white p-1.5 shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
        >
          {SORT_KEYS.map((key) => {
            const active = filters.sort === key;
            return (
              <DropdownMenu.Item
                key={key}
                onSelect={() => updateFilters({ sort: key })}
                className={clsx(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm outline-none",
                  active
                    ? "bg-primary/5 font-semibold text-primary"
                    : "text-primary hover:bg-neutral-100",
                )}
              >
                <span>{t(LABEL_KEY[key])}</span>
                {active && <Check className="size-4" strokeWidth={2.5} />}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
