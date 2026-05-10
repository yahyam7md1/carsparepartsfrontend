"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FaWhatsapp } from "react-icons/fa";
import { isApiError } from "@/lib/api/errors";
import { postWhatsappCheckoutIntent } from "@/lib/api/services/checkout";
import type { CartLine } from "@/shop/types/cart";
import type { AppLocale } from "@/i18n/routing";
import { SAR_RIYAL_GLYPH, formatSar } from "@/shared/utils/formatSar";
import { Button, FieldError } from "@/shared/ui";
import { Link } from "@/i18n/navigation";

type Props = Readonly<{
  lines: CartLine[];
  subtotal: number;
}>;

function openWhatsAppUrl(url: string): boolean {
  const win = globalThis.window?.open(url, "_blank", "noopener,noreferrer");
  return win != null && typeof win.closed !== "undefined";
}

export function OrderSummary({ lines, subtotal }: Props) {
  const rawLocale = useLocale();
  const locale = rawLocale === "ar" ? "ar" : "en";
  const tc = useTranslations("cart");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualWaUrl, setManualWaUrl] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [noWaLink, setNoWaLink] = useState(false);

  const currencySymbol = SAR_RIYAL_GLYPH;

  const onConfirm = useCallback(async () => {
    setLoading(true);
    setError(null);
    setManualWaUrl(null);
    setCopied(false);
    setLastMessage(null);
    setNoWaLink(false);
    try {
      const items = lines.map(
        ({ sku, quantity, unitPrice, nameEn, nameAr }) => ({
          sku,
          quantity,
          unitPrice,
          nameEn,
          nameAr,
        }),
      );
      const res = await postWhatsappCheckoutIntent({
        locale: locale as AppLocale,
        currencySymbol,
        items,
        notes: notes.trim() || undefined,
      });
      setLastMessage(res.message);
      setNoWaLink(res.waUrl == null);

      if (res.waUrl) {
        const opened = openWhatsAppUrl(res.waUrl);
        if (!opened) {
          setManualWaUrl(res.waUrl);
        }
      }
    } catch (e) {
      const msg = isApiError(e)
        ? e.message
        : e instanceof Error
          ? e.message
          : tc("cartCheckoutErrorGeneric");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [currencySymbol, lines, locale, notes, tc]);

  const onCopyMessage = useCallback(async () => {
    if (!lastMessage) return;
    try {
      await navigator.clipboard.writeText(lastMessage);
      setCopied(true);
      globalThis.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(tc("cartCopyFailed"));
    }
  }, [lastMessage, tc]);

  return (
    <aside className="rounded-2xl border border-secondary/20 bg-white p-5 shadow-sm ring-1 ring-primary/5">
      <h2 className="text-lg font-bold text-primary">{tc("cartOrderSummary")}</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-secondary">{tc("cartSubtotal")}</dt>
          <dd className="font-semibold tabular-nums text-foreground">{formatSar(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-secondary">{tc("cartShipping")}</dt>
          <dd className="text-secondary">{tc("cartShippingNote")}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-secondary/15 pt-3">
          <dt className="font-semibold text-foreground">{tc("cartEstimatedTotal")}</dt>
          <dd className="font-bold tabular-nums text-foreground">{formatSar(subtotal)}</dd>
        </div>
      </dl>

      <label className="mt-5 block">
        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
          {tc("cartNotesLabel")}
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-2 w-full rounded-lg border border-neutral-200/90 bg-white px-3 py-2 text-sm text-foreground outline-none ring-primary/25 placeholder:text-secondary focus:border-primary/30 focus:ring-2"
          placeholder={tc("cartNotesPlaceholder")}
          rows={3}
          maxLength={2000}
        />
      </label>

      <p className="mt-3 text-xs text-secondary">{tc("cartConfirmOrderWhatsappNote")}</p>

      {error ? (
        <FieldError className="mt-3">{error}</FieldError>
      ) : null}

      {manualWaUrl ? (
        <p className="mt-3 text-sm text-secondary">
          {tc("cartPopupBlockedHint")}{" "}
          <a
            className="font-medium text-primary underline underline-offset-2"
            href={manualWaUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {tc("cartOpenWhatsApp")}
          </a>
        </p>
      ) : null}

      {lastMessage ? (
        <div className="mt-3 flex flex-col gap-2">
          {noWaLink ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">
              {tc("cartWhatsAppNotConfigured")}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => void onCopyMessage()}>
              {copied ? tc("cartCopied") : tc("cartCopyOrderMessage")}
            </Button>
          </div>
        </div>
      ) : null}

      <Button
        type="button"
        variant="primary"
        size="md"
        className="mt-5 w-full gap-2 bg-[#25D366] font-semibold text-white hover:opacity-95"
        disabled={loading || lines.length === 0}
        onClick={() => void onConfirm()}
      >
        <FaWhatsapp className="size-5 shrink-0" aria-hidden />
        {loading ? tc("cartCheckoutLoading") : tc("cartConfirmOrderWhatsapp")}
      </Button>

      <p className="mt-4 text-center text-xs text-secondary">
        <Link className="font-medium text-primary hover:underline" href="/products">
          {tc("cartContinueShopping")}
        </Link>
      </p>
    </aside>
  );
}
