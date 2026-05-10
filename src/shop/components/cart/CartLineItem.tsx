"use client";

import Image from "next/image";
import { Package } from "lucide-react";
import { useTranslations } from "next-intl";
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

  return (
    <li className="flex flex-col gap-4 py-6 sm:flex-row sm:items-start">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-neutral-200/90 bg-secondary/10">
        {thumb ? (
          <Image alt="" className="object-cover" fill sizes="96px" src={thumb} />
        ) : (
          <div className="flex size-full items-center justify-center text-secondary">
            <Package className="size-8 stroke-[1.25]" aria-hidden />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <h2 className="font-semibold leading-snug text-foreground">{title}</h2>
          <p className="mt-0.5 text-xs tabular-nums text-secondary">{line.sku}</p>
          <p className="mt-1 text-sm tabular-nums text-secondary">
            {formatSar(line.unitPrice)} <span className="text-secondary/80">{tc("cartEachShort")}</span>
          </p>
        </div>
        <div className="flex max-w-[220px]">
          <QuantityStepper
            max={maxQuantity}
            value={line.quantity}
            onChange={(q) => onQuantityChange(line.productId, q)}
            size="sm"
          />
        </div>
      </div>
      <div className="flex shrink-0 flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
        <p className="text-sm font-semibold tabular-nums text-foreground">
          {tc("cartLineTotalPrefix")}: {formatSar(lineTotal)}
        </p>
        <button
          type="button"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          onClick={() => onRemove(line.productId)}
        >
          {tc("cartRemoveLine")}
        </button>
      </div>
    </li>
  );
}
