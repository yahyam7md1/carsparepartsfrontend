"use client";

import * as Popover from "@radix-ui/react-popover";
import { SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProductsFilterSidebarContent } from "./filters/ProductsFilterSidebar";

/**
 * Mobile-only filter trigger — drops down a popover anchored under the button
 * (NOT a full-screen drawer). Hidden on `lg` and up since the sticky sidebar
 * is visible there.
 */
export function MobileFilterPopover() {
  const t = useTranslations("products");

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={t("filtersOpen")}
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neutral-200/90 bg-white text-primary shadow-sm transition-colors hover:border-primary/25 lg:hidden"
        >
          <SlidersHorizontal aria-hidden className="size-4" strokeWidth={2} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          collisionPadding={16}
          className="z-50 max-h-[70vh] w-[min(92vw,22rem)] overflow-y-auto rounded-xl border border-neutral-200/90 bg-white p-5 shadow-xl"
        >
          <h2 className="text-base font-semibold tracking-tight text-primary">
            {t("filtersTitle")}
          </h2>
          <div className="-mx-5 my-4 border-t border-neutral-200/80" />
          <ProductsFilterSidebarContent />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
