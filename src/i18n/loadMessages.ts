import type { AppLocale } from "./routing";

const namespaces = [
  "nav",
  "hero",
  "home",
  "listing",
  "product",
  "products",
  "cart",
  "contact",
  "footer",
  "common",
  "metadata",
] as const;

export async function loadMessages(locale: AppLocale) {
  const entries = await Promise.all(
    namespaces.map(async (ns) => {
      const mod = await import(`../../messages/${locale}/${ns}.json`);
      return [ns, mod.default] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<
    (typeof namespaces)[number],
    Record<string, string>
  >;
}
