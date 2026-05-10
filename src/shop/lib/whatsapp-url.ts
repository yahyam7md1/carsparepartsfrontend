import { fetchShopSupportPublic } from "@/lib/api/services/shopSupport";

export type WhatsappChatUrlOptions = Readonly<{
  /** If set, sent as the `text` query on wa.me (UTF-8 encoded). */
  prefillText?: string;
}>;

/** Build wa.me URL from digits only (with optional prefill). */
export function buildWhatsappMeUrl(
  digitsRaw: string,
  options?: WhatsappChatUrlOptions,
): string | null {
  const digits = digitsRaw.replace(/\D/g, "");
  if (digits.length === 0) return null;
  const text = options?.prefillText?.trim();
  if (text) {
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
  }
  return `https://wa.me/${digits}`;
}

/**
 * Uses `NEXT_PUBLIC_WHATSAPP_SUPPORT` only. On the storefront, prefer
 * {@link resolveWhatsappChatUrl} so admin / server env (`WHATSAPP_BUSINESS_PHONE`) applies.
 */
export function getWhatsappChatUrlFromEnv(options?: WhatsappChatUrlOptions): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT?.trim();
  if (!raw) return null;
  return buildWhatsappMeUrl(raw, options);
}

/**
 * Resolves WhatsApp link: **GET /api/shop/support** (DB + `WHATSAPP_BUSINESS_PHONE`),
 * then falls back to `NEXT_PUBLIC_WHATSAPP_SUPPORT`. Use in Server Components / after await.
 */
export async function resolveWhatsappChatUrl(
  options?: WhatsappChatUrlOptions,
): Promise<string | null> {
  try {
    const { whatsappPhoneDigits } = await fetchShopSupportPublic();
    if (whatsappPhoneDigits != null && whatsappPhoneDigits.trim() !== "") {
      const url = buildWhatsappMeUrl(whatsappPhoneDigits, options);
      if (url) return url;
    }
  } catch {
    /* API unreachable — env fallback */
  }
  return getWhatsappChatUrlFromEnv(options);
}

/** @deprecated Use {@link getWhatsappChatUrlFromEnv} or {@link resolveWhatsappChatUrl}. */
export function getWhatsappChatUrl(options?: WhatsappChatUrlOptions): string | null {
  return getWhatsappChatUrlFromEnv(options);
}
