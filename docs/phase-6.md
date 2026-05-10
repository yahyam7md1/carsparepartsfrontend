# Phase 6 — Cart & shop WhatsApp (implementation notes)

This doc tracks what the **storefront** implements for **[Phase F6 in FRONTEND_PHASES.md](./FRONTEND_PHASES.md)** (cart + WhatsApp checkout) and related **support** WhatsApp links.

## Cart

| Area | Location |
|------|----------|
| State + `localStorage` | `src/shop/context/cart-context.tsx`, `src/shop/types/cart.ts`, `src/shop/types/cart-constants.ts` |
| Line shape | `productId`, `sku`, `quantity`, `unitPrice`, `nameEn`, `nameAr`, optional `imageThumbUrl`, `stockQuantity` |
| PLP add-to-cart | `src/shop/components/products/ProductCard.tsx` |
| PDP | `src/shop/views/ProductDetailView.tsx`, route `src/app/[locale]/(shop)/products/[id]/page.tsx` |
| Cart page | `src/app/[locale]/(shop)/cart/page.tsx` |
| `CartLineItem` | `src/shop/components/cart/CartLineItem.tsx` |
| `OrderSummary` + checkout POST | `src/shop/components/cart/OrderSummary.tsx` |
| Quantity control alias | `src/shop/components/cart/quantity-stepper.tsx` (re-exports shared `QuantitySelector`) |
| Header badge (quantity sum) | `src/shop/components/shell/ShopHeader.tsx` → `useCart().itemCount` |

Checkout calls **`POST /api/checkout/whatsapp-intent`** via `src/lib/api/services/checkout.ts` with `locale` from next-intl, cart lines, optional notes, and SAR-style `currencySymbol`.

## Support WhatsApp (banner, FAB, footer)

| Area | Location |
|------|----------|
| `wa.me` URL building | `src/shop/lib/whatsapp-url.ts` — `resolveWhatsappChatUrl()` (API first), `getWhatsappChatUrlFromEnv()`, `buildWhatsappMeUrl()` |
| Public digits API (backend) | `GET /api/shop/support` → merged admin settings + `WHATSAPP_BUSINESS_PHONE` |
| Client fetch | `src/lib/api/services/shopSupport.ts` |
| Banner CTA | `src/shop/components/home/SupportBanner.tsx` |
| Floating button | `src/shop/components/shell/WhatsAppFab.tsx` |
| Footer link | `src/shop/components/shell/ShopFooter.tsx` |

Prefilled chat text lives under **`whatsappPrefillMessage`** in `messages/{en,ar}/home.json`.

Fallback when **no** number is configured anywhere: links point to **`/contact`**.

## Environment (frontend)

- **`NEXT_PUBLIC_WHATSAPP_SUPPORT`** — optional; same digit rules as `wa.me`. Used when `/api/shop/support` returns no number or is unreachable.

## i18n

Cart copy: `messages/{en,ar}/cart.json`. Related home strings: `messages/{en,ar}/home.json`.

## Exit criteria (F6)

- Add from **PLP** or **PDP** → **cart** → **Confirm via WhatsApp** opens (or offers copy / manual link) with message language matching locale.
- Support CTAs use the **configured** business number when the API exposes it.

## Backend coupling

- Checkout intent and merged WhatsApp phone: **CarSparePartsBackend** (`/api/checkout/whatsapp-intent`, `mergeWhatsAppCheckoutEnv`, optional order templates in `ShopSettings`).
