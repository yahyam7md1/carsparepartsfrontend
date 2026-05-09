import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("footer");
  const tCommon = await getTranslations("common");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-primary">
        {t("footerLinkTerms")}
      </h1>
      <p className="mt-4 text-secondary">{tCommon("legalPagePlaceholder")}</p>
    </div>
  );
}
