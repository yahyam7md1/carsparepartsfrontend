import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = Readonly<{
  params: Promise<{ locale: string; id: string }>;
}>;

/** Placeholder until Phase F5 full PDP. */
export default async function ProductDetailStubPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="text-xl font-semibold text-primary">{t("pdpStubTitle")}</h1>
      <p className="mt-2 font-mono text-sm text-secondary">{id}</p>
      <p className="mt-4 text-secondary">{t("pdpStubBody")}</p>
    </div>
  );
}
