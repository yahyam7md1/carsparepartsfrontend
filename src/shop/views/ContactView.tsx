import { getTranslations } from "next-intl/server";
import { Info, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { resolveWhatsappChatUrl } from "@/shop/lib/whatsapp-url";

export async function ContactView() {
  const t = await getTranslations("contact");
  const waUrl = await resolveWhatsappChatUrl({
    prefillText: t("contactPageWaPrefill"),
  });
  const phoneNumber = t("contactPagePhoneNumber");
  const phoneHref = `tel:${phoneNumber.replaceAll(" ", "")}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
          {t("contactPageTitle")}
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-balance text-lg leading-relaxed text-secondary">
          {t("contactPageSubtitle")}
        </p>
      </header>

      <section
        aria-label={t("contactPageCardsAria")}
        className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2"
      >
        <article className="rounded-2xl border border-secondary/10 bg-white p-6 shadow-md shadow-slate-900/5 ring-1 ring-secondary/10">
          <div className="mb-4 inline-flex rounded-xl bg-[#25D366]/10 p-2.5 text-[#25D366]">
            <FaWhatsapp className="size-5" aria-hidden />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-primary">
            {t("contactPageWaTitle")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-secondary">
            {t("contactPageWaDesc")}
          </p>
          <a
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
            href={waUrl ?? "/contact"}
            {...(waUrl ? { rel: "noopener noreferrer", target: "_blank" } : {})}
          >
            <FaWhatsapp className="size-4" aria-hidden />
            {t("contactPageWaCta")}
          </a>
        </article>

        <article className="rounded-2xl border border-secondary/10 bg-white p-6 shadow-md shadow-slate-900/5 ring-1 ring-secondary/10">
          <div className="mb-4 inline-flex rounded-xl bg-primary/8 p-2.5 text-primary">
            <Phone className="size-5" aria-hidden />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-primary">
            {t("contactPagePhoneTitle")}
          </h2>
          <a
            className="mt-2 block text-xl font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline"
            href={phoneHref}
          >
            {phoneNumber}
          </a>
          <p className="mt-3 text-sm leading-relaxed text-secondary">
            {t("contactPagePhoneDesc")}
          </p>
        </article>
      </section>

      <section
        aria-label={t("contactPageBeforeMessageAria")}
        className="mx-auto mt-8 max-w-4xl"
      >
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          {t("contactPageBeforeMessageTitle")}
        </p>
        <div className="mt-3 flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/8 p-3.5">
          <span className="inline-flex rounded-lg bg-primary/10 p-2 text-primary">
            <Info className="size-4" aria-hidden />
          </span>
          <p className="text-sm leading-relaxed text-foreground">
            {t("contactPageBeforeMessageBody")}
          </p>
        </div>
      </section>

      <footer className="mx-auto mt-10 max-w-4xl border-t border-secondary/12 pt-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">
          {t("contactPageOperatingHoursTitle")}
        </p>
        <p className="mt-2 text-2xl font-semibold text-primary">
          {t("contactPageOperatingHoursValue")}
        </p>
        <p className="mt-4 text-sm text-secondary">
          {t("contactPageSupportLanguagesNote")}
        </p>
      </footer>
    </div>
  );
}
