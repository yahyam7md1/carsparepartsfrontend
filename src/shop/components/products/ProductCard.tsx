"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ProductListRow } from "@/lib/api/types";
import { getMediaUrl } from "@/shop/lib/media-url";
import type { AppLocale } from "@/i18n/routing";

type Props = Readonly<{
  product: ProductListRow;
  locale: AppLocale;
}>;

export function ProductCard({ product, locale }: Props) {
  const t = useTranslations("home");
  const title = locale === "ar" ? product.nameAr : product.nameEn;
  const main = product.images.find((i) => i.isMain) ?? product.images[0];
  const src = main ? getMediaUrl(main.urlThumb) : "";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-secondary/15 bg-background shadow-sm transition hover:border-primary/25 hover:shadow-md">
      <Link
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        href={`/products/${product.id}`}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary/10">
          {src ? (
            <Image
              alt={title}
              className="object-cover transition group-hover:scale-[1.02]"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              src={src}
            />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0 flex items-center justify-center bg-secondary/15 text-xs text-secondary"
            >
              {t("productCardNoImage")}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <p className="text-xs font-medium text-secondary">{product.brandName}</p>
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug text-foreground">
            {title}
          </h3>
          <p className="mt-auto pt-2 text-base font-semibold tabular-nums text-primary">
            {product.price}{" "}
            <span className="text-xs font-normal text-secondary">{t("priceCurrency")}</span>
          </p>
        </div>
      </Link>
    </article>
  );
}
