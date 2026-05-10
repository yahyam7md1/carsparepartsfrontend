import { setRequestLocale } from "next-intl/server";
import { ProductsView } from "@/shop/views/ProductsView";

type Props = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ProductsView />;
}
