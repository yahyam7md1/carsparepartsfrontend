"use client";

import { FaWhatsapp } from "react-icons/fa";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { QuantityStepper } from "@/shop/components/cart/quantity-stepper";
import { formatSar } from "@/shared/utils/formatSar";
import { PDP_CARD_SHELL } from "@/shop/components/pdp/cardShell";

type Props = Readonly<{
  brandName: string;
  title: string;
  sku: string;
  inStock: boolean;
  stockLabel: string;
  outOfStockLabel: string;
  priceLabel: string;
  vatNote: string;
  price: number;
  compareAtPrice: number | null;
  quantity: number;
  maxQuantity: number;
  addToCartLabel: string;
  askSpecialistLabel: string;
  onQuantityChange: (value: number) => void;
  onAddToCart: () => void;
  onAskSpecialist: () => void;
}>;

export function ProductPurchaseCard({
  brandName,
  title,
  sku,
  inStock,
  stockLabel,
  outOfStockLabel,
  priceLabel,
  vatNote,
  price,
  compareAtPrice,
  quantity,
  maxQuantity,
  addToCartLabel,
  askSpecialistLabel,
  onQuantityChange,
  onAddToCart,
  onAskSpecialist,
}: Props) {
  const hasCompareAt = compareAtPrice != null && compareAtPrice > price;

  return (
    <section className={`${PDP_CARD_SHELL} p-6 md:p-7`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
        {brandName}
      </p>
      <h1 className="mt-1 text-2xl font-semibold leading-tight text-primary md:text-[2rem]">
        {title}
      </h1>
      <p className={`mt-1 text-sm ${inStock ? "text-[#0a7b46]" : "text-red-600"}`}>
        {inStock ? stockLabel : outOfStockLabel}
      </p>

      <div className="mt-7 border-t border-secondary/12 pt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
          {priceLabel}
        </p>
        <div className="mt-1.5 flex items-end gap-2">
          <p className="text-4xl font-bold leading-none tabular-nums text-primary">
            {formatSar(price)}
          </p>
          {hasCompareAt ? (
            <p className="text-lg font-medium leading-none text-secondary line-through">
              {formatSar(compareAtPrice)}
            </p>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-secondary">{vatNote}</p>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <div className="w-full sm:max-w-[172px]">
          <QuantityStepper
            value={quantity}
            onChange={onQuantityChange}
            max={maxQuantity}
          />
        </div>
        <Button
          type="button"
          variant="primary"
          className="w-full gap-2"
          disabled={!inStock}
          onClick={onAddToCart}
        >
          <ShoppingCart className="size-4" aria-hidden />
          {addToCartLabel}
        </Button>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="mt-4 w-full gap-2 border-secondary/20 text-foreground"
        onClick={onAskSpecialist}
      >
        <FaWhatsapp className="size-4 text-[#25D366]" aria-hidden />
        {askSpecialistLabel}
      </Button>
    </section>
  );
}
