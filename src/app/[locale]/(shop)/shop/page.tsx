import { setRequestLocale } from "next-intl/server";
import { HomeView } from "@/shop/views/HomeView";

type Props = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function ShopHomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeView />;
}
