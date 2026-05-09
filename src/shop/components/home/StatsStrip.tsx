import { getTranslations } from "next-intl/server";

export async function StatsStrip() {
  const t = await getTranslations("home");

  const items = [
    { valueKey: "statsStripValueParts", labelKey: "statsStripLabelParts" as const },
    { valueKey: "statsStripValueClients", labelKey: "statsStripLabelClients" as const },
    { valueKey: "statsStripValueSupport", labelKey: "statsStripLabelSupport" as const },
    { valueKey: "statsStripValueYears", labelKey: "statsStripLabelYears" as const },
  ] as const;

  return (
    <section aria-label={t("statsStripAria")}>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
        {items.map((item) => (
          <div className="text-center" key={item.labelKey}>
            <p className="text-2xl font-bold tabular-nums text-primary md:text-3xl">
              {t(item.valueKey)}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-secondary md:text-sm">
              {t(item.labelKey)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
