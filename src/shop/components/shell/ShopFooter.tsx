import { getTranslations } from "next-intl/server";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { LanguageSwitch } from "@/shop/components/shell/LanguageSwitch";
import { getWhatsappChatUrl } from "@/shop/lib/whatsapp-url";

const SHOP_LINKS = [
  { href: "/products", messageKey: "footerLinkAllProducts" as const },
  {
    href: "/products?sort=featured",
    messageKey: "footerLinkBestSellers" as const,
  },
] as const;

const HELP_LINKS = [
  { href: "/contact", messageKey: "footerLinkContact" as const },
] as const;

const LEGAL_LINKS = [
  { href: "/privacy", messageKey: "footerLinkPrivacy" as const },
  { href: "/terms", messageKey: "footerLinkTerms" as const },
] as const;

export async function ShopFooter() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const waUrl = getWhatsappChatUrl();

  const helpExtras =
    waUrl != null
      ? [
          {
            href: waUrl,
            messageKey: "footerLinkWhatsapp" as const,
            external: true as const,
          },
        ]
      : [];

  return (
    <footer
      className="border-t border-white/10 bg-primary text-white"
      data-component="shop-footer"
    >
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="border-l-4 border-accent pl-4 sm:col-span-2 lg:col-span-1">
            <p className="text-lg font-bold leading-snug">{tn("brand")}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
              {t("footerTagline")}
            </p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-white">
              {t("footerHeadingShop")}
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {SHOP_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    className="text-white/75 transition hover:text-white"
                    href={item.href}
                  >
                    {t(item.messageKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-white">
              {t("footerHeadingHelp")}
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {HELP_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    className="text-white/75 transition hover:text-white"
                    href={item.href}
                  >
                    {t(item.messageKey)}
                  </Link>
                </li>
              ))}
              {helpExtras.map((item) => (
                <li key={item.href}>
                  <a
                    className="text-white/75 transition hover:text-white"
                    href={item.href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t(item.messageKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-white">
              {t("footerHeadingLegal")}
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {LEGAL_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    className="text-white/75 transition hover:text-white"
                    href={item.href}
                  >
                    {t(item.messageKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 pt-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <LanguageSwitch variant="footer" />

            <div className="text-start sm:text-end">
              <p className="text-xs text-white/60">{t("footerCopyright")}</p>
              <NextLink
                className="mt-2 inline-block text-xs text-white/45 underline-offset-4 transition hover:text-white/70 hover:underline"
                href="/admin/login"
              >
                {tn("adminConsole")}
              </NextLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
