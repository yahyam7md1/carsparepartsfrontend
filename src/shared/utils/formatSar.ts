/** Saudi Riyal display glyph used on Saudi e‑commerce storefronts (per product copy). */
export const SAR_RIYAL_GLYPH = "⃁";

export function formatSar(amount: string | number): string {
  const n = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (!Number.isFinite(n)) {
    return `${SAR_RIYAL_GLYPH}—`;
  }
  const formatted = n.toLocaleString("en-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${SAR_RIYAL_GLYPH}${formatted}`;
}
