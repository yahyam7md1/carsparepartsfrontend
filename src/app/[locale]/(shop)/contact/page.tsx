import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const tCommon = await getTranslations("common");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-primary">
        {t("contactPageTitle")}
      </h1>
      <p className="mt-2 max-w-2xl text-pretty text-secondary">
        {t("contactPageSubtitle")}
      </p>
      <p className="mt-6 text-sm text-secondary">{tCommon("shopPhasePlaceholder")}</p>
    </div>
  );
}
