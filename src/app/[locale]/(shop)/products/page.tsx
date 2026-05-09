import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-primary">{tNav("products")}</h1>
      <p className="mt-2 text-secondary">{tCommon("shopPhasePlaceholder")}</p>
    </div>
  );
}
