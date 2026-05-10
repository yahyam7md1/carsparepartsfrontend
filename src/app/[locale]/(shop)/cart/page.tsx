"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { useCart } from "@/shop/context/cart-context";
import { CartLineItem } from "@/shop/components/cart/CartLineItem";
import { OrderSummary } from "@/shop/components/cart/OrderSummary";

export default function CartPage() {
  const locale = useLocale() as AppLocale;
  const tc = useTranslations("cart");
  const { lines, itemCount, setQuantity, removeLine } = useCart();

  const subtotal = useMemo(
    () =>
      Math.round(
        lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0) * 100,
      ) / 100,
    [lines],
  );

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-primary">
          {tc("cartEmptyTitle")}
        </h1>
        <p className="mt-2 text-secondary">{tc("cartEmptySubtitle")}</p>
        <Link
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          href="/products"
        >
          {tc("cartContinueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-primary md:text-3xl">
          {tc("cartPageHeading")}
        </h1>
        <p className="text-sm text-secondary">
          {itemCount === 1
            ? tc("cartCountParenOne")
            : tc("cartCountParenMany", { n: itemCount })}
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_min(100%,380px)] lg:items-start">
        <div className="min-w-0 rounded-2xl border border-secondary/20 bg-white px-4 shadow-sm ring-1 ring-primary/5 md:px-6">
          <ul
            aria-label={tc("cartItemsListAria")}
            className="divide-y divide-primary/10"
          >
            {lines.map((line) => (
              <CartLineItem
                key={line.productId}
                line={line}
                locale={locale}
                onQuantityChange={setQuantity}
                onRemove={removeLine}
              />
            ))}
          </ul>
        </div>

        <OrderSummary lines={lines} subtotal={subtotal} />
      </div>
    </div>
  );
}
