"use client";

import { ChevronDown, Folder } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCategoriesTree } from "@/hooks";
import clsx from "clsx";
import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import type { CategoryTreeNode } from "@/lib/api/types";

function CategoryChip({
  category,
  locale,
  subcategoriesLabel,
}: {
  category: CategoryTreeNode;
  locale: string;
  subcategoriesLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const label = locale === "ar" ? category.nameAr : category.nameEn;
  const hasChildren = category.children.length > 0;

  const chipContent = (
    <div
      className={clsx(
        "group flex min-h-[4.5rem] w-full items-center gap-3 rounded-xl border border-neutral-200/90 bg-white px-4 py-3 shadow-sm",
        "transition-all duration-200 ease-out",
        "hover:border-primary/25 hover:shadow-md",
        hasChildren && "cursor-pointer",
      )}
    >
      <Folder
        aria-hidden
        className="size-5 shrink-0 text-secondary transition-colors duration-200 group-hover:text-primary"
        strokeWidth={2}
      />
      <div className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-primary">
          {label}
        </span>
        {hasChildren && (
          <span className="block truncate text-xs text-secondary">
            {category.children.length} {subcategoriesLabel}
          </span>
        )}
      </div>
      <ChevronDown
        aria-hidden
        className={clsx(
          "size-4 shrink-0 text-secondary transition-all duration-200",
          "group-hover:text-primary",
          open && "rotate-180",
        )}
        strokeWidth={2}
      />
    </div>
  );

  if (!hasChildren) {
    return (
      <Link href={`/products?categoryId=${category.id}`}>{chipContent}</Link>
    );
  }

  return (
    <Popover.Root open={open || isHovering} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="w-full text-start"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {chipContent}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          className={clsx(
            "z-50 w-[min(90vw,36rem)] rounded-xl border border-neutral-200/90 bg-white p-4 shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
          sideOffset={8}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="grid grid-cols-3 gap-2">
            {category.children.map((child) => {
              const childLabel = locale === "ar" ? child.nameAr : child.nameEn;
              return (
                <Link
                  key={child.id}
                  href={`/products?categoryId=${child.id}`}
                  onClick={() => {
                    setOpen(false);
                    setIsHovering(false);
                  }}
                  className={clsx(
                    "rounded-full border border-neutral-200/90 bg-white px-3 py-1.5 text-xs font-medium text-primary text-center shadow-sm",
                    "transition-colors duration-150",
                    "hover:border-primary/25",
                  )}
                >
                  {childLabel}
                </Link>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function BrowseByCategorySection() {
  const t = useTranslations("home");
  const locale = useLocale();
  const { data: tree, loading, error } = useCategoriesTree();

  if (loading) {
    return (
      <section
        aria-labelledby="browse-categories-heading"
        className="scroll-mt-8"
      >
        <div className="text-center">
          <h2
            className="text-2xl font-bold tracking-tight text-primary md:text-3xl"
            id="browse-categories-heading"
          >
            {t("browseCategoriesTitle")}
          </h2>
          <p className="mx-auto mt-3 text-sm text-secondary">
            {t("categoriesLoading")}
          </p>
        </div>
      </section>
    );
  }

  if (error || !tree || tree.length === 0) {
    return null;
  }

  const topCategories = tree.slice(0, 6);

  return (
    <section aria-labelledby="browse-categories-heading" className="scroll-mt-8">
      <div className="mb-10 text-center">
        <h2
          className="text-2xl font-bold tracking-tight text-primary md:text-3xl"
          id="browse-categories-heading"
        >
          {t("browseCategoriesTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-secondary md:text-base">
          {t("browseCategoriesSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {topCategories.map((category) => (
          <CategoryChip
            key={category.id}
            category={category}
            locale={locale}
            subcategoriesLabel={t("categoriesSubcategories")}
          />
        ))}
      </div>
    </section>
  );
}
