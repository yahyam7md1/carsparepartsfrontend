# Phase 2 — Document `lang` / `dir`, fonts, locale toggle (placeholder UI)

## What was added

### `DocumentLangDir` ([`src/shared/ui/DocumentLangDir.tsx`](../src/shared/ui/DocumentLangDir.tsx))

- Client component mounted once in [`src/app/layout.tsx`](../src/app/layout.tsx).
- Reads **`usePathname()`** (Next.js). If the path starts with **`/en/`** or **`/en`** (end of segment) or **`/ar`**, it sets **`document.documentElement.lang`** and **`.dir`** via [`getDocumentLocaleFromPathname`](../src/shared/utils/documentLocaleFromPathname.ts).
- Any other path (e.g. **`/admin/dashboard`**) resets **`lang="en"`** and **`dir="ltr"`**.

`html` keeps **`suppressHydrationWarning`** because the server render uses a default while the client corrects after hydration.

### `ShopLocaleToggle` ([`src/shop/components/ShopLocaleToggle.tsx`](../src/shop/components/ShopLocaleToggle.tsx))

- Reusable EN/AR control using **`Link`** from **`@/i18n/navigation`** and **`usePathname`** so the current route is preserved when switching locale.
- **`className`** prop is for layout wrappers; **visual design is intentionally temporary** — replace when your nav/footer comps are ready (`data-component="shop-locale-toggle"` helps queries).

### Fonts

- **[`Noto Sans Arabic`](https://fonts.google.com/noto/specimen/Noto+Sans+Arabic)** is loaded in root layout as **`--font-arabic`**.
- [`globals.css`](../src/app/globals.css) **`--font-sans`** stacks Geist → Noto Arabic → system UI so Arabic glyphs render well in the shop without dropping Geist for Latin.

## RTL / LTR styling conventions (for future pages)

1. Prefer **logical** spacing: **`ms-` / `me-` / `ps-` / `pe-`** (or Tailwind **`start` / `end`** where available) instead of **`ml` / `mr` / `pl` / `pr`** when mirroring matters.
2. Use **`rtl:`** variants only for intentional asymmetry (e.g. one-sided decoration).
3. The shop subtree still sets **`dir`** on the wrapper in [`src/app/[locale]/(shop)/layout.tsx`](../src/app/[locale]/(shop)/layout.tsx); **`DocumentLangDir`** aligns **`<html>`** for a11y and consistency with the URL.

## Navbar / footer

Full **ShopHeader** / **ShopFooter** were **not** implemented; when your design is ready, import **`ShopLocaleToggle`** (or rebuild the control) in those shells. You can remove duplicate toggles from starter pages like **HomeView** once a global bar exists.
