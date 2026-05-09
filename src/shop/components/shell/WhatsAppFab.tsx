"use client";

import { FaWhatsapp } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getWhatsappChatUrl } from "@/shop/lib/whatsapp-url";

const FAB_BASE =
  "fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/**
 * Fixed support FAB (bottom-right). Opens WhatsApp when `NEXT_PUBLIC_WHATSAPP_SUPPORT`
 * is set; otherwise `/contact` so the control is never hidden in local dev.
 */
export function WhatsAppFab() {
  const t = useTranslations("nav");
  const waHref = getWhatsappChatUrl();
  const label = t("whatsapp");

  const icon = <FaWhatsapp aria-hidden className="h-8 w-8" />;

  if (waHref != null) {
    return (
      <a
        aria-label={label}
        className={FAB_BASE}
        data-component="whatsapp-fab"
        href={waHref}
        rel="noopener noreferrer"
        target="_blank"
      >
        {icon}
      </a>
    );
  }

  return (
    <Link
      aria-label={label}
      className={FAB_BASE}
      data-component="whatsapp-fab"
      href="/contact"
    >
      {icon}
    </Link>
  );
}
