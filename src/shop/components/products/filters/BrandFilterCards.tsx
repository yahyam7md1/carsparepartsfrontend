"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import type { IconType } from "react-icons";
import { SiAudi, SiBmw, SiMini, SiVolkswagen } from "react-icons/si";

/**
 * PLP filter brand config — independent of the home grid.
 * Uniform icon sizing so all four cards look identical in scale.
 */
type FilterBrandSlug = "bmw" | "mini" | "audi" | "vw";

type FilterBrand = Readonly<{
  slug: FilterBrandSlug;
  /** Server-side filter value (matches `brandName` on `ProductListRow`). */
  query: string;
  /** Lucide / Simple-Icons component. */
  Icon: IconType;
}>;

const FILTER_BRANDS: FilterBrand[] = [
  { slug: "bmw", query: "BMW", Icon: SiBmw },
  { slug: "mini", query: "Mini", Icon: SiMini },
  { slug: "audi", query: "Audi", Icon: SiAudi },
  { slug: "vw", query: "Volkswagen", Icon: SiVolkswagen },
];

export type BrandFilterCardsProps = Readonly<{
  selected: string[];
  onToggle: (brandQuery: string) => void;
}>;

/**
 * Compact 2x2 brand toggle cards used in the PLP filter sidebar.
 * Uniform sizing across all brands — single icon scale, single label scale.
 */
export function BrandFilterCards({ selected, onToggle }: BrandFilterCardsProps) {
  const t = useTranslations("home");

  return (
    <div className="grid grid-cols-2 gap-2">
      {FILTER_BRANDS.map((brand) => {
        const isSelected = selected.includes(brand.query);
        const label = t(`brandTile_${brand.slug}`);
        const iconSizeClass =
          brand.slug === "mini" || brand.slug === "audi" ? "h-8 w-8" : "h-6 w-6";
        const contentGapClass =
          brand.slug === "mini" || brand.slug === "audi" ? "gap-0.5" : "gap-1.5";
        return (
          <button
            key={brand.slug}
            type="button"
            onClick={() => onToggle(brand.query)}
            aria-pressed={isSelected}
            className={clsx(
              "group flex h-[74px] cursor-pointer flex-col items-center justify-center rounded-xl border bg-white px-2 py-2 text-center shadow-sm transition-all duration-200 ease-out",
              contentGapClass,
              isSelected
                ? "border-primary border-2 bg-primary/[0.04]"
                : "border-neutral-200/90 hover:border-primary/25 hover:shadow-md",
            )}
          >
            <brand.Icon
              aria-hidden
              className={clsx(
                iconSizeClass,
                "shrink-0 transition-colors duration-200",
                isSelected
                  ? "text-primary"
                  : "text-secondary group-hover:text-primary",
              )}
            />
            <span className="text-xs font-medium text-primary">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
