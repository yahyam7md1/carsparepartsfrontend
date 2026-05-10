import { ProductDetailView } from "@/shop/views/ProductDetailView";
import type { AppLocale } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";

type Props = Readonly<{
  params: Promise<{ locale: string; id: string }>;
}>;

export default async function ProductDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <ProductDetailView locale={locale as AppLocale} productId={id} />;
}
