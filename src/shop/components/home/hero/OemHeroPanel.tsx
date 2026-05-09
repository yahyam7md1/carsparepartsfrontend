"use client";

import { ArrowRight, Hash, Tags } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import clsx from "clsx";
import { useId, useMemo, useState, type FormEvent } from "react";
import { useCategoriesTree } from "@/hooks/useCategoriesTree";
import {
  CategoryHierarchyPicker,
  flattenCategoryTreeForPicker,
} from "@/shared/ui/category-hierarchy-picker";
import { Button, Input, Label } from "@/shared/ui";

const HERO_INPUT =
  "h-11 min-h-[2.75rem] border-white/35 bg-white py-2 text-primary shadow-none placeholder:text-primary/50 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-white/50";

const HERO_LABEL =
  "mb-0 flex cursor-pointer items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white/85";

const CATEGORY_TRIGGER =
  "[&_button]:border-white/35 [&_button]:bg-white [&_button]:text-primary [&_button]:shadow-none [&_button]:ps-3 [&_button]:pe-6 [&_button]:gap-3";

export function OemHeroPanel() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const router = useRouter();
  const baseId = useId();
  const categoryFieldId = `${baseId}-category`;
  const oemFieldId = `${baseId}-oem`;

  const { data: tree, loading } = useCategoriesTree();
  const flat = useMemo(
    () => (tree ? flattenCategoryTreeForPicker(tree) : []),
    [tree],
  );
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [oem, setOem] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (categoryId !== "") params.set("categoryId", String(categoryId));
    if (oem.trim()) params.set("oem", oem.trim());
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  }

  return (
    <form
      className="grid gap-5 md:grid-cols-[1fr_1fr_auto] md:items-end md:gap-4"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-1.5">
        <Label className={HERO_LABEL} htmlFor={categoryFieldId}>
          <Tags
            aria-hidden
            className="size-3.5 shrink-0 opacity-90"
            strokeWidth={2}
          />
          {t("heroPartType")}
        </Label>
        <CategoryHierarchyPicker
          allCategoriesLabel={t("heroCategoryAll")}
          aria-label={t("heroPartType")}
          categories={flat}
          className={CATEGORY_TRIGGER}
          disabled={loading}
          id={categoryFieldId}
          locale={locale === "ar" ? "ar" : "en"}
          mode="filter"
          searchPlaceholder={t("heroCategorySearch")}
          placeholder={t("heroCategoryPlaceholder")}
          value={categoryId}
          onChange={setCategoryId}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className={HERO_LABEL} htmlFor={oemFieldId}>
          <Hash
            aria-hidden
            className="size-3.5 shrink-0 opacity-90"
            strokeWidth={2}
          />
          {t("heroOemLabel")}
        </Label>
        <Input
          aria-label={t("heroOemLabel")}
          autoComplete="off"
          className={HERO_INPUT}
          id={oemFieldId}
          placeholder={t("heroOemPlaceholder")}
          value={oem}
          onChange={(e) => setOem(e.target.value)}
        />
      </div>

      <div className="flex md:justify-end md:pb-0.5">
        <Button
          className="w-full rounded-lg shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 md:w-auto"
          type="submit"
        >
          {t("heroFindParts")}
          <ArrowRight
            aria-hidden
            className={clsx("size-4", locale === "ar" && "rotate-180")}
            strokeWidth={2}
          />
        </Button>
      </div>
    </form>
  );
}
