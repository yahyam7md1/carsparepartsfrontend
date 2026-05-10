"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { useProduct } from "@/hooks/useProductDetail";
import { useCart } from "@/shop/context/cart-context";
import { getMediaUrl } from "@/shop/lib/media-url";
import type { AppLocale } from "@/i18n/routing";
import { Button } from "@/shared/ui/button";
import { QuantityStepper } from "@/shop/components/cart/quantity-stepper";
import { formatSar } from "@/shared/utils/formatSar";

type Props = Readonly<{
  productId: string;
  locale: AppLocale;
}>;

export function ProductDetailView({ productId, locale }: Props) {
  const tHome = useTranslations("home");
  const { data: product, loading, error } = useProduct(productId);
  const { addLine } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="h-8 w-48 animate-pulse rounded bg-secondary/20" />
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-xl bg-secondary/15" />
          <div className="space-y-4">
            <div className="h-6 w-full animate-pulse rounded bg-secondary/15" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-secondary/15" />
            <div className="h-10 w-full animate-pulse rounded bg-secondary/15" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-primary">{tHome("pdpErrorTitle")}</h1>
        <p className="mt-2 text-secondary">
          {error instanceof Error ? error.message : tHome("pdpErrorBody")}
        </p>
        <Link
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          href="/products"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {tHome("pdpBackToProducts")}
        </Link>
      </div>
    );
  }

  const title = locale === "ar" ? product.nameAr : product.nameEn;
  const description = locale === "ar" ? product.descAr : product.descEn;
  const main = product.images.find((i) => i.isMain) ?? product.images[0];
  const src = main ? getMediaUrl(main.urlThumb) : "";

  const handleAddToCart = () => {
    addLine({
      productId: product.id,
      sku: product.sku,
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      brandName: product.brandName,
      descEn: product.descEn ?? undefined,
      descAr: product.descAr ?? undefined,
      quantity,
      unitPrice: Number.parseFloat(product.price),
      imageThumbUrl: src || undefined,
      stockQuantity: product.stockQuantity,
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        href="/products"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {tHome("pdpBackToProducts")}
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-10">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-neutral-200/90 bg-secondary/10">
          {src ? (
            <Image alt={title} className="object-cover" fill priority sizes="(max-width: 768px) 100vw, 50vw" src={src} />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-secondary">
              {tHome("productCardNoImage")}
            </div>
          )}
          {product.stockQuantity < 1 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-sm">
              <span className="rounded-lg bg-red-600/90 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white">
                {tHome("outOfStock")}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
            {product.brandName}
          </p>
          <h1 className="mt-1 text-2xl font-bold leading-tight text-primary md:text-3xl">{title}</h1>
          <p className="mt-2 font-mono text-sm text-secondary">{product.sku}</p>
          {description ? (
            <p className="mt-4 text-sm leading-relaxed text-secondary whitespace-pre-line">{description}</p>
          ) : null}
          <p className="mt-6 text-2xl font-bold tabular-nums text-foreground">{formatSar(product.price)}</p>

          <div className="mt-8 space-y-4 border-t border-neutral-200/80 pt-6">
            {product.stockQuantity >= 1 ? (
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                max={product.stockQuantity}
              />
            ) : null}
            <Button
              variant="primary"
              size="md"
              className="w-full gap-2"
              disabled={product.stockQuantity < 1}
              onClick={handleAddToCart}
              type="button"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              {tHome("addToCart")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
