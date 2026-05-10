import { setRequestLocale } from "next-intl/server";
import { CartView } from "@/shop/views/CartView";

type Props = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function CartPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CartView />;
}
