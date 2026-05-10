import { getTranslations } from "next-intl/server";
import { StatsStripClient } from "./StatsStripClient";

export async function StatsStrip() {
  const t = await getTranslations("home");

  return (
    <StatsStripClient
      labels={{
        parts:   t("statsStripLabelParts"),
        clients: t("statsStripLabelClients"),
        support: t("statsStripLabelSupport"),
        years:   t("statsStripLabelYears"),
        aria:    t("statsStripAria"),
      }}
    />
  );
}
