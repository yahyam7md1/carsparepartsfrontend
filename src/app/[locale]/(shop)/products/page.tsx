import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { ProductsView } from "@/shop/views/ProductsView";

type Props = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-secondary">
          Loading…
        </div>
      }
    >
      <ProductsView />
    </Suspense>
  );
}
