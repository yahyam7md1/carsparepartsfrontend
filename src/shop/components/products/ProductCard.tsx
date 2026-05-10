"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Plus } from "lucide-react";
import type { ProductListRow } from "@/lib/api/types";
import { getMediaUrl } from "@/shop/lib/media-url";
import type { AppLocale } from "@/i18n/routing";
import { useCart } from "@/shop/context/cart-context";
import { Button } from "@/shared/ui/button";
import { QuantitySelector } from "@/shared/ui/quantity-selector";
import { formatSar } from "@/shared/utils/formatSar";

type Props = Readonly<{
  product: ProductListRow;
  locale: AppLocale;
}>;

export function ProductCard({ product, locale }: Props) {
  const t = useTranslations("home");
  const { addLine } = useCart();
  const [quantity, setQuantity] = useState(1);

  const title = locale === "ar" ? product.nameAr : product.nameEn;
  const description = locale === "ar" ? product.descAr : product.descEn;
  const main = product.images.find((i) => i.isMain) ?? product.images[0];
  const src = main ? getMediaUrl(main.urlThumb) : "";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addLine({
      productId: product.id,
      sku: product.sku,
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      quantity,
      unitPrice: Number.parseFloat(product.price),
      imageThumbUrl: src || undefined,
      stockQuantity: product.stockQuantity,
    });
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg">
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
          {product.stockQuantity < 1 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <span className="rounded-lg bg-red-600/80 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-lg">
                {t("outOfStock")}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4 pb-3">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-secondary">
            {product.brandName}
          </p>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-primary">
            {title}
          </h3>
          {description && (
            <p className="hidden line-clamp-2 text-sm leading-relaxed text-secondary md:block">
              {description}
            </p>
          )}
          <p className="mt-auto pt-0 text-base font-bold tabular-nums text-foreground md:pt-2">
            {formatSar(product.price)}
          </p>
        </div>
      </Link>
      <div className="flex flex-col gap-3 border-t border-neutral-200/70 p-4 pt-3">
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          max={product.stockQuantity}
        />
        <Button
          variant="primary"
          size="md"
          onClick={handleAddToCart}
          className="w-full"
          disabled={product.stockQuantity < 1}
        >
          <Plus className="size-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">{t("addToCart")}</span>
          <span className="sm:hidden">{t("addToCartShort")}</span>
        </Button>
      </div>
    </article>
  );
}
