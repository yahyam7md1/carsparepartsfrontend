import { setRequestLocale } from "next-intl/server";
import { getDirection } from "@/shared/utils/rtl";

type Props = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export default async function ShopGroupLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const dir = getDirection(locale);

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      data-silo="shop"
      dir={dir}
      lang={locale}
    >
      {children}
    </div>
  );
}
