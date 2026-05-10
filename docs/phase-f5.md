# Phase F5 — Product detail (PDP) implementation notes

This document tracks what is implemented for **Phase F5** in [`docs/FRONTEND_PHASES.md`](./FRONTEND_PHASES.md): a full storefront product detail experience with reusable PDP components, image gallery interactions, localized technical specs, and cart/WhatsApp actions.

**Route:** `GET /[locale]/products/[id]` → `src/app/[locale]/(shop)/products/[id]/page.tsx`.

---

## Scope delivered

| Area | Behavior |
|------|----------|
| **Routing** | Product cards deep-link to `/products/{id}`. Route wrapper resolves locale and renders `ProductDetailView`. |
| **Data** | PDP fetches `GET /api/products/:id` via `useProduct(productId)`. Category tree is fetched to build category breadcrumb labels. |
| **Gallery** | Main image with left/right arrows, thumbnail strip, selected-image state, and no-image fallback. |
| **Purchase card** | Brand/title/SKU, stock state, price + optional compare-at strike-through, quantity selector, add-to-cart button, WhatsApp specialist CTA. |
| **Mobile CTA** | Sticky bottom purchase bar on mobile with thumb, price, compare-at, and Add button. |
| **Description** | Dedicated description card with locale-aware content (`name/desc` selection by locale). |
| **Technical specs** | Dedicated specs card for manufacturer (`manufacturedIn`), dimensions, weight, category (breadcrumb when available), condition, and multi-OEM list. |
| **Specs fallback behavior** | Rows with missing data are hidden (no “Not available” row noise); OEM block renders only when values exist. |
| **Styling polish** | Reusable PDP card shell for softer elevation, light borders, and consistent spacing in right-column cards. |
| **i18n** | Added PDP-specific `product` namespace strings in both `en` and `ar` for labels, gallery controls, stock text, and WhatsApp prefill. |

---

## File inventory

### Route + view

| File | Role |
|------|------|
| `src/app/[locale]/(shop)/products/[id]/page.tsx` | Thin locale wrapper for PDP route. |
| `src/shop/views/ProductDetailView.tsx` | PDP orchestration: data fetching, locale mapping, category breadcrumb resolution, cart action, WhatsApp action, and section composition. |

### PDP components

| File | Role |
|------|------|
| `src/shop/components/pdp/ProductGallery.tsx` | Main image, arrows, thumbnail strip, selected image state callbacks. |
| `src/shop/components/pdp/ProductPurchaseCard.tsx` | Price card with stock, compare-at, quantity, add-to-cart, WhatsApp CTA. |
| `src/shop/components/pdp/ProductDescriptionCard.tsx` | Description section card. |
| `src/shop/components/pdp/ProductSpecsCard.tsx` | Technical specs + OEM list (multi-value) with hidden-empty-row behavior. |
| `src/shop/components/pdp/MobileStickyPurchaseBar.tsx` | Mobile sticky bottom purchase CTA. |
| `src/shop/components/pdp/cardShell.ts` | Shared style token for consistent PDP card look. |

### Shared/helpers used by PDP

| File | Role |
|------|------|
| `src/hooks/useProductDetail.ts` | Product detail fetch hook (`useProduct`). |
| `src/hooks/useCategoriesTree.ts` | Category tree fetch used for breadcrumb resolution. |
| `src/shared/utils/categoryBreadcrumb.ts` | Locale-aware breadcrumb construction from category tree and category id. |
| `src/shop/lib/media-url.ts` | Normalizes image paths for Next Image usage. |
| `src/shop/lib/whatsapp-url.ts` | Builds/fallbacks WhatsApp URL for specialist CTA. |
| `src/lib/api/services/shopSupport.ts` | Fetches support phone digits from `/api/shop/support`. |

### Type + i18n updates

| File | Change |
|------|--------|
| `src/lib/api/types.ts` | Added `compareAtPrice: string \| null` to product row type. |
| `messages/en/product.json` | Added PDP labels, gallery strings, stock copy, and WhatsApp prefill. |
| `messages/ar/product.json` | Arabic equivalents for PDP labels and prefill. |

---

## Data/UX details

1. **Locale fields**
   - Title/description use `nameAr/descAr` when locale is `ar`; otherwise `nameEn/descEn`.

2. **Compare-at price**
   - Displayed only when `compareAtPrice > price`.

3. **Add-to-cart payload**
   - Includes `brandName`, `descEn`, `descAr`, selected thumb URL, quantity, and stock cap.
   - Supports richer cart row rendering downstream.

4. **Category breadcrumb**
   - Uses category tree + `categoryId`.
   - Falls back to direct category label if tree data is unavailable.

5. **Specs row visibility**
   - Only rows with concrete values are rendered.
   - OEM section appears only when at least one OEM exists.

6. **Mobile sticky bar**
   - Hidden on desktop (`md:hidden`), fixed bottom on mobile, mirrors primary add action.

---

## Notes / deviations from original F5 brief

- The current PDP implementation focuses on **core purchase and specification UX**.
- `useProductFitments` exists in hooks, but fitment list/table rendering is not currently shown in PDP UI.
- If fitments need to be surfaced in Phase F5 scope, add a dedicated section card reusing existing hook and vehicle label utilities.

---

## Verification checklist

- Open `/en/products/{id}` and `/ar/products/{id}`.
- Confirm:
  - gallery arrows and thumbnail selection
  - compare-at strike-through behavior
  - add-to-cart updates cart lines correctly
  - mobile sticky purchase bar appears on small screens
  - specs hide empty rows and OEM renders multiple values
  - category breadcrumb appears for nested categories when tree is available
  - WhatsApp specialist button opens configured support link (or falls back safely)

---

## Related docs

- Roadmap entry: `docs/FRONTEND_PHASES.md` — Phase F5
- Cart/checkout follow-up: `docs/phase-6.md`
