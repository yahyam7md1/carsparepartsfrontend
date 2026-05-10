"use client";

import Image from "next/image";
import { Package } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { formatSar } from "@/shared/utils/formatSar";

type Props = Readonly<{
  title: string;
  thumbSrc: string | null;
  price: number;
  compareAtPrice: number | null;
  addToCartLabel: string;
  disabled: boolean;
  onAddToCart: () => void;
}>;

export function MobileStickyPurchaseBar({
  title,
  thumbSrc,
  price,
  compareAtPrice,
  addToCartLabel,
  disabled,
  onAddToCart,
}: Props) {
  const hasCompareAt = compareAtPrice != null && compareAtPrice > price;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-secondary/20 bg-white/98 px-3 py-2 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative size-9 shrink-0 overflow-hidden rounded-md border border-secondary/20 bg-secondary/10">
            {thumbSrc ? (
              <Image alt="" className="object-cover" fill sizes="36px" src={thumbSrc} />
            ) : (
              <div className="flex size-full items-center justify-center text-secondary">
                <Package className="size-4" aria-hidden />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tabular-nums text-primary">
              {formatSar(price)}
            </p>
            {hasCompareAt ? (
              <p className="truncate text-xs tabular-nums text-secondary line-through">
                {formatSar(compareAtPrice)}
              </p>
            ) : (
              <p className="truncate text-xs text-secondary">{title}</p>
            )}
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          className="min-w-[86px] rounded-lg px-4"
          disabled={disabled}
          onClick={onAddToCart}
        >
          {addToCartLabel}
        </Button>
      </div>
    </div>
  );
}
