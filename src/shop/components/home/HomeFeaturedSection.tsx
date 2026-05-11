"use client";

import { useLocale, useTranslations } from "next-intl";
import { useFeaturedProducts } from "@/hooks/useProducts";
import type { AppLocale } from "@/i18n/routing";
import { ProductCard } from "@/shop/components/products/ProductCard";
import { ProductGrid } from "@/shop/components/products/ProductGrid";

const FEATURED_LIMIT = 8;

export function HomeFeaturedSection() {
  const t = useTranslations("home");
  const locale = useLocale() as AppLocale;
  const { data, loading, error } = useFeaturedProducts({ limit: FEATURED_LIMIT });

  return (
    <section aria-labelledby="best-sellers-heading">
      <div className="mb-8 text-center">
        <h2
          className="text-2xl font-semibold tracking-tight text-primary md:text-3xl"
          id="best-sellers-heading"
        >
          {t("bestSellersTitle")}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-secondary">
          {t("bestSellersSubtitle")}
        </p>
      </div>

      {loading ? (
        <p className="text-center text-sm text-secondary md:text-start">
          {t("featuredLoading")}
        </p>
      ) : null}

      {error ? (
        <p className="text-center text-sm text-red-600 md:text-start" role="alert">
          {t("featuredError")}
        </p>
      ) : null}

      {!loading && !error && data && data.products.length === 0 ? (
        <p className="text-center text-sm text-secondary md:text-start">
          {t("featuredEmpty")}
        </p>
      ) : null}

      {data && data.products.length > 0 ? (
        <ProductGrid>
          {data.products.map((p) => (
            <ProductCard key={p.id} locale={locale} product={p} />
          ))}
        </ProductGrid>
      ) : null}
    </section>
  );
}
