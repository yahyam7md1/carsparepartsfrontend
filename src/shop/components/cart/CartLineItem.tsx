"use client";

import Image from "next/image";
import { Package, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { CartLine } from "@/shop/types/cart";
import { formatSar } from "@/shared/utils/formatSar";
import { QuantityStepper } from "@/shop/components/cart/quantity-stepper";

type Props = Readonly<{
  line: CartLine;
  locale: AppLocale;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}>;

export function CartLineItem({
  line,
  locale,
  onQuantityChange,
  onRemove,
}: Props) {
  const tc = useTranslations("cart");
  const title = locale === "ar" ? line.nameAr : line.nameEn;
  const thumb = line.imageThumbUrl?.trim();
  const stockCap = line.stockQuantity;
  const maxQuantity =
    stockCap === undefined
      ? 999
      : Math.min(999, Math.max(line.quantity, stockCap));

  const lineTotal = Math.round(line.quantity * line.unitPrice * 100) / 100;
  const brand = line.brandName?.trim();
  const description = (locale === "ar" ? line.descAr : line.descEn)?.trim();
  const productHref = `/products/${line.productId}`;

  return (
    <li className="py-4 sm:py-6">
      <div>
        <div className="flex items-start gap-3">
          <Link
            href={productHref}
            className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-neutral-200/90 bg-secondary/10 transition hover:border-primary/30 sm:size-24 sm:rounded-xl"
            aria-label={title}
          >
            {thumb ? (
              <Image alt="" className="object-cover" fill sizes="96px" src={thumb} />
            ) : (
              <div className="flex size-full items-center justify-center text-secondary">
                <Package className="size-6 stroke-[1.25] sm:size-8" aria-hidden />
              </div>
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                {brand ? (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-secondary sm:text-xs">
                    {brand}
                  </p>
                ) : null}
                <Link
                  href={productHref}
                  className="line-clamp-1 text-sm font-semibold leading-snug text-foreground underline-offset-4 transition hover:text-primary hover:underline sm:text-base"
                >
                  {title}
                </Link>
                {description ? (
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-secondary sm:line-clamp-1 sm:text-sm">
                    {description}
                  </p>
                ) : null}
          
              </div>
              <button
                type="button"
                className="inline-flex rounded-md p-1 text-secondary transition hover:bg-secondary/10 hover:text-primary"
                aria-label={`${tc("cartRemoveLine")} ${title}`}
                onClick={() => onRemove(line.productId)}
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>

            <div className="mt-2.5 flex flex-col gap-2 sm:mt-3 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex max-w-[132px] sm:max-w-[96px]">
                <QuantityStepper
                  max={maxQuantity}
                  value={line.quantity}
                  onChange={(q) => onQuantityChange(line.productId, q)}
                  size="xs"
                />
              </div>
              <p className="text-xs tabular-nums text-secondary sm:ps-1 sm:text-sm">
        
                <span>{formatSar(line.unitPrice)}</span>
                <span className="px-1">×</span>
                <span>{line.quantity}</span>
                <span className="px-1">=</span>
                <strong className="font-semibold text-foreground">
                  {formatSar(lineTotal)}
                </strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
