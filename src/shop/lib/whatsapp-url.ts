/**
 * Shared for footer/FAB — uses `NEXT_PUBLIC_WHATSAPP_SUPPORT` (digits with optional formatting).
 */
export function getWhatsappChatUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT?.trim();
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length > 0 ? `https://wa.me/${digits}` : null;
}
