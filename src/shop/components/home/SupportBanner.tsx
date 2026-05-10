import { FaWhatsapp } from "react-icons/fa";
import { getTranslations } from "next-intl/server";
import { getWhatsappChatUrl } from "@/shop/lib/whatsapp-url";

export async function SupportBanner() {
  const t = await getTranslations("home");
  const wa = getWhatsappChatUrl();
  const href = wa ?? "/contact";
  const isExternal = wa != null;

  return (
    <section
      aria-label={t("supportBannerAria")}
      className="relative overflow-hidden rounded-2xl bg-primary px-6 py-8 text-white md:px-10 md:py-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold leading-tight text-white md:text-3xl">
            {t("whatsappHelpTitle")}
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            {t("whatsappHelpSubtitle")}
          </p>
        </div>
        <a
          className="inline-flex w-full shrink-0 items-center justify-center gap-3 rounded-xl bg-[#25D366] px-10 py-5 text-base font-bold text-white shadow-lg transition hover:bg-[#22c55e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:w-auto"
          href={href}
          {...(isExternal ? { rel: "noopener noreferrer", target: "_blank" } : {})}
        >
          <FaWhatsapp className="size-6" />
          {t("whatsappHelpCta")}
        </a>
      </div>
    </section>
  );
}
