import { getTranslations } from "next-intl/server";
import { getWhatsappChatUrl } from "@/shop/lib/whatsapp-url";

export async function SupportBanner() {
  const t = await getTranslations("home");
  const wa = getWhatsappChatUrl();

  return (
    <section
      aria-label={t("supportBannerAria")}
      className="rounded-2xl bg-primary px-6 py-10 text-white md:px-10 md:py-12"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center md:items-start md:text-start">
        <h2 className="text-2xl font-bold leading-tight md:text-3xl">
          {t("whatsappHelpTitle")}
        </h2>
        <p className="text-base leading-relaxed text-white/85">{t("whatsappHelpSubtitle")}</p>
        {wa ? (
          <a
            className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-primary shadow-sm transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            href={wa}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("whatsappHelpCta")}
          </a>
        ) : null}
      </div>
    </section>
  );
}
