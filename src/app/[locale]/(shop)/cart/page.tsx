"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/shop/context/cart-context";

export default function CartPage() {
  const locale = useLocale();
  const tc = useTranslations("cart");
  const { lines, itemCount, removeLine } = useCart();

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
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-primary">
        {tc("cartPageHeading")}
      </h1>
      <p className="mt-1 text-sm text-secondary">
        {itemCount === 1
          ? tc("cartCountParenOne")
          : tc("cartCountParenMany", { n: itemCount })}
      </p>
      <ul
        aria-label={tc("cartItemsListAria")}
        className="mt-8 divide-y divide-primary/10 border-y border-primary/10"
      >
        {lines.map((line) => (
          <li
            className="flex flex-wrap items-center justify-between gap-4 py-4"
            key={line.productId}
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {locale === "ar" ? line.nameAr : line.nameEn}
              </p>
              <p className="text-xs text-secondary">{line.sku}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="tabular-nums text-sm text-secondary">
                × {line.quantity}
              </span>
              <button
                className="text-sm text-primary underline-offset-4 hover:underline"
                onClick={() => removeLine(line.productId)}
                type="button"
              >
                {tc("cartRemoveLine")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
