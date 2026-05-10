# Phase F3 — Shop Home Page

This document is the **single source of truth** for the customer-facing shop home page (`/[locale]`). It covers every section, component, data flow, i18n keys, shared UI used, and design decisions made during implementation.

---

## Page entry point

| File | Type | Purpose |
|------|------|---------|
| `src/shop/views/HomeView.tsx` | Server Component | Composes all home sections in order |
| `src/app/[locale]/(shop)/page.tsx` | Route | Renders `<HomeView />` |

**Section render order:**
```
Hero
└─ BrandGrid
└─ BrowseByCategorySection
└─ HomeFeaturedSection  (Best Sellers)
└─ SupportBanner
└─ StatsStrip
```

All sections are wrapped in `mx-auto max-w-7xl space-y-16 px-4 py-16`.

---

## 1. Hero

**File:** `src/shop/components/home/hero/Hero.tsx`  
**Type:** Server Component (uses `getTranslations`)  
**Sub-components:**

| File | Purpose |
|------|---------|
| `hero/GlassPanel.tsx` | Frosted glass container wrapping the search panels |
| `hero/HeroSearchModeTabs.tsx` | "By Vehicle / By Part" segmented pill control |
| `hero/VehicleHeroPanel.tsx` | Search form — vehicle make → series → model flow |
| `hero/OemHeroPanel.tsx` | Search form — OEM/part number + category picker |

### Layout & Styling

- **Height:** `min-h-[max(34rem,84vh)] md:min-h-[max(42rem,88vh)]`
- **Background image:** `next/image` with `fill` + `object-cover`, dark gradient overlay `from-primary/78 via-primary/72 to-primary/80`
- **Vignette:** `shadow-[inset_0_0_80px_rgba(0,0,0,0.55),inset_0_0_180px_rgba(0,0,0,0.45)]`
- **Content:** `items-center text-center` — centered headline and subtitle
- **Title:** `text-4xl sm:text-5xl md:text-6xl lg:text-[3.75rem]` with `leading-[1.05]`

### GlassPanel

- `backdrop-blur-2xl backdrop-saturate-150`
- `bg-gradient-to-b from-black/45 via-black/35 to-black/40`
- Border: `ring-[0.5px] ring-white/12 ring-inset` — intentionally very thin, no thicker border
- Accepts `className` prop for additional styles

### HeroSearchModeTabs

- Full-width segmented control
- Track: `bg-black/60 rounded-full p-1.5 backdrop-blur-sm` — no explicit border, relies on contrast
- **Active tab:** `bg-primary text-white shadow-[0_2px_12px_rgba(0,0,0,0.35)]`
- **Inactive tab:** `text-white/65 hover:text-white` — text brightens on hover, no background change
- i18n keys: `heroModeVehicle`, `heroModePart`

### VehicleHeroPanel — Search Logic

| State | Button enabled? | Navigation target |
|-------|----------------|-------------------|
| Nothing selected | ✅ | `/products` (browse all) |
| Make only | ✅ | `/products?q=BMW` |
| Make + Series | ✅ | `/products?q=BMW 3-Series` |
| Make + Series + Model (vehicleId resolved) | ✅ | `/products?vehicleId=123` |

- Arrow icon flips for Arabic: `locale === "ar" && "rotate-180"` on the `ArrowRight` icon

### OemHeroPanel — Search Logic

| State | Button enabled? | Navigation target |
|-------|----------------|-------------------|
| Nothing entered | ✅ | `/products` |
| OEM only | ✅ | `/products?oem=34116777479` |
| Category only | ✅ | `/products?categoryId=5` |
| Both | ✅ | `/products?oem=...&categoryId=...` |

### i18n namespace: `hero`

Keys: `heroTitle`, `heroSubtitle`, `heroModeVehicle`, `heroModePart`, `heroBrandLabel`, `heroSeriesLabel`, `heroModelLabel`, `heroOemLabel`, `heroCategoryLabel`, `heroFindParts`

---

## 2. Shop by Brand — BrandGrid

**File:** `src/shop/components/home/BrandGrid.tsx`  
**Type:** Server Component  
**Supporting files:**

| File | Purpose |
|------|---------|
| `src/shop/components/home/BrandCard.tsx` | Single brand tile component |
| `src/shop/lib/brand-tiles-config.ts` | Array of `{ slug, searchQuery }` configs |
| `src/shop/lib/brand-tile-icons.ts` | Maps slug → react-icons/si component + Tailwind size classes |

### BrandCard design

- `rounded-xl border border-neutral-200/90 bg-white shadow-sm`
- **Hover:** `hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg` (lifts card — same pattern used across the whole home page)
- Icon: `text-secondary` → `group-hover:text-primary` color transition
- Grid: `grid-cols-2 lg:grid-cols-4`

### Icon visual weight balancing

| Brand | Size class |
|-------|-----------|
| BMW | `h-10 w-10` |
| VW | `h-10 w-10` |
| Audi | `h-[3.75rem] w-[5.75rem]` |
| Mini | `h-[4.75rem] w-[4.75rem]` |

### i18n namespace: `home`

Keys: `shopByBrandTitle`, `shopByBrandSubtitle`, `brandTile_bmw`, `brandTile_mini`, `brandTile_vw`, `brandTile_audi`

---

## 3. Browse by Category — BrowseByCategorySection

**File:** `src/shop/components/home/BrowseByCategorySection.tsx`  
**Type:** Client Component (`"use client"`)  
**Data:** `useCategoriesTree()` hook — fetches full category tree from backend  
**Sub-component:** `CategoryChip` (internal, not exported)

### Behaviour

- Fetches all categories; renders top 6 (`tree.slice(0, 6)`)
- If loading → shows heading + loading text
- If error or empty → renders `null` (section disappears silently)
- Grid: `grid-cols-2 lg:grid-cols-3`

### CategoryChip

Each chip is one of two things depending on whether the category has children:

| Has children? | Renders as |
|--------------|-----------|
| No | `<Link href="/products?categoryId=...">` wrapping chip content |
| Yes | Radix UI `<Popover.Root>` with chip as trigger |

**Chip layout:** Folder icon → category name + subcategory count → ChevronDown  
**Hover effect:** `hover:border-primary/25 hover:shadow-md` (no background change, matching brand cards)

### Popover (subcategory menu)

- Opens on **hover** using a 100ms delayed close (`useRef<NodeJS.Timeout>`) to bridge the gap between trigger and content
- Both the trigger button and `Popover.Content` share the same `handleMouseEnter`/`handleMouseLeave` — hovering over either keeps the popover open
- Width: `w-[min(90vw,36rem)]`
- **Header:** "Subcategories of [Category Name]" — i18n key `subcategoriesOf`
- **Subcategory grid:** `grid-cols-3 gap-2`
- Each subcategory is a pill `<Link>` → `/products?categoryId=childId`
- Clicking a pill clears timeout + closes popover immediately

### i18n namespace: `home`

Keys: `browseCategoriesTitle`, `browseCategoriesSubtitle`, `categoriesLoading`, `categoriesSubcategories`, `subcategoriesOf`

---

## 4. Best Sellers — HomeFeaturedSection

**File:** `src/shop/components/home/HomeFeaturedSection.tsx`  
**Type:** Client Component  
**Data:** `useFeaturedProducts({ limit: 8 })` hook  
**Sub-components:**

| File | Purpose |
|------|---------|
| `src/shop/components/products/ProductCard.tsx` | Individual product card |
| `src/shop/components/products/ProductGrid.tsx` | Responsive grid wrapper |

### ProductGrid layout

```
Mobile:  grid-cols-2   (2×2 on home)
Large:   grid-cols-3
XL:      grid-cols-4
```

### ProductCard design

**Structure (top to bottom):**
1. Product image (`aspect-[4/3]`, `object-cover`, subtle zoom on hover `group-hover:scale-[1.02]`)
2. Out-of-stock overlay (when `stockQuantity < 1`) — `bg-black/60 backdrop-blur-sm` + red badge
3. Brand name — `text-xs uppercase tracking-wide text-secondary`
4. Product name — `line-clamp-2 text-sm font-semibold text-primary` (no `min-h` — no forced gap)
5. Description — `hidden line-clamp-2 text-sm text-secondary md:block` (desktop only, max 2 lines)
6. Price — `formatSar(product.price)` → `⃁124.99`, `font-bold text-foreground`
7. Divider + actions section (outside the `<Link>`)
8. `QuantitySelector` — full-width integrated control
9. Add to Cart `Button` — full width, primary variant, disabled when out of stock

**Card hover:** `hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg transition-all duration-200 ease-out` — identical to BrandCard

**Add to cart:** Calls `useCart().addLine(...)`, uses `e.preventDefault()` + `e.stopPropagation()` to prevent navigation

### QuantitySelector (`src/shared/ui/quantity-selector.tsx`)

Fully reusable shared component:

- **Layout:** Integrated single-unit — `[−] [input] [+]` with no gaps
- Left button: `rounded-l-lg` only; right button: `rounded-r-lg` only; input: `border-y` only (no left/right border, no border-radius)
- `flex-1` input fills remaining width; container is `w-full`
- Sizes: `"md"` (h-10) and `"sm"` (h-8)
- Validates input on change; respects `min`/`max` props; `max` is set to `product.stockQuantity`
- i18n namespace: `product` — keys: `quantity`, `decreaseQuantity`, `increaseQuantity`

### Price formatting

Uses `formatSar` from `src/shared/utils/formatSar.ts`:
- Displays the Saudi Riyal glyph `⃁` prefix
- Formats with `en-SA` locale (comma thousands separator, 2 decimal places)
- Same utility used in admin panel

### i18n namespace: `home`

Keys: `bestSellersTitle`, `bestSellersSubtitle`, `featuredLoading`, `featuredError`, `featuredEmpty`, `productCardNoImage`, `outOfStock`, `addToCart`, `addToCartShort`

---

## 5. Support Banner — SupportBanner

**File:** `src/shop/components/home/SupportBanner.tsx`  
**Type:** Server Component  

### Design

- Background: `bg-primary` (primary navy) with subtle white grid pattern overlay (`opacity-[0.03]`, `backgroundSize: "40px 40px"`)
- Layout: stacked on mobile, `flex-row justify-between` on desktop
- Left: title (`text-2xl md:text-3xl font-extrabold`) + subtitle (`text-base md:text-lg text-white/70`, `max-w-lg` to encourage wrapping to 2 lines)
- Right: WhatsApp CTA button

### Button behaviour

- If `NEXT_PUBLIC_WHATSAPP_SUPPORT` env var is set → opens `https://wa.me/{number}` in new tab
- If **not** set → links to `/contact` (same fallback as `WhatsAppFab`)
- Button styling: `bg-[#25D366]` (WhatsApp green), `hover:bg-[#22c55e]`, `w-full md:w-auto`, icon `FaWhatsapp` from `react-icons/fa`

### i18n namespace: `home`

Keys: `supportBannerAria`, `whatsappHelpTitle`, `whatsappHelpSubtitle`, `whatsappHelpCta`

---

## 6. Stats Strip — StatsStrip + StatsStripClient

**Files:**

| File | Type | Purpose |
|------|------|---------|
| `src/shop/components/home/StatsStrip.tsx` | Server Component | Fetches translations, passes labels to client |
| `src/shop/components/home/StatsStripClient.tsx` | Client Component | Animations, countup, icons |

**Dependencies added:** `framer-motion`, `react-countup`

### Stats config (hardcoded in `StatsStripClient`)

| Icon (Lucide) | End value | Suffix | Label key |
|---------------|-----------|--------|-----------|
| `Package` | 5,000 | `+` | `statsStripLabelParts` |
| `Users` | 10 | `k+` | `statsStripLabelClients` |
| `Headphones` | 24 | `/7` | `statsStripLabelSupport` |
| `Award` | 15 | `+` | `statsStripLabelYears` |

Icons use `strokeWidth={1.5}` for thin surgical look, colored `text-accent`.

### Animations

- `useInView` ref with `{ once: true, margin: "-80px" }` — triggers once when section scrolls 80px into viewport
- Framer Motion `staggerChildren: 0.12` — each stat reveals 120ms after the previous
- Each item: `opacity: 0, y: 24` → `opacity: 1, y: 0` over 500ms `easeOut`
- `CountUp` starts from 0 when `inView` becomes true (`enableScrollSpy: false`, controlled by `inView` instead)

### Dividers

- No outer border, no horizontal lines
- Short vertical divider between each stat: absolutely positioned `<span>` — `h-12 w-px bg-neutral-200/80`, vertically centred with `top-1/2 -translate-y-1/2`
- Only visible on desktop (`hidden md:block`), placed at `end-0` of each cell except the last

### i18n namespace: `home`

Keys: `statsStripAria`, `statsStripLabelParts`, `statsStripLabelClients`, `statsStripLabelSupport`, `statsStripLabelYears`

> **Note:** Value keys (`statsStripValueParts` etc.) remain in the JSON files but are no longer used — numbers are hardcoded in the component config for animation purposes.

---

## Shared UI components used on this page

| Component | File | Used by |
|-----------|------|---------|
| `Button` | `src/shared/ui/button.tsx` | `ProductCard` (Add to Cart) |
| `QuantitySelector` | `src/shared/ui/quantity-selector.tsx` | `ProductCard` |
| `Select` | `src/shared/ui/select.tsx` | `VehicleHeroPanel`, `OemHeroPanel` |
| `Label` | `src/shared/ui/label.tsx` | `VehicleHeroPanel`, `OemHeroPanel` |
| `CategoryHierarchyPicker` | `src/shared/ui/category-hierarchy-picker.tsx` | `OemHeroPanel` |

---

## Global design tokens used

| Token | Value | Usage |
|-------|-------|-------|
| `text-primary` | Primary navy | Headings, product names, icon hover |
| `text-secondary` | Muted grey | Subtitles, brand names, counts |
| `text-accent` | Sky blue | Stats icons |
| `text-foreground` | Black | Product prices |
| `border-neutral-200/90` | Light grey | Card borders (default state) |
| `hover:border-primary/25` | Navy 25% opacity | Card borders (hover state) — used consistently across BrandCard, CategoryChip, ProductCard |
| `hover:-translate-y-1` | 4px lift | Hover animation — used on BrandCard and ProductCard |

---

## i18n files modified in this phase

| File | Keys added/changed |
|------|--------------------|
| `messages/en/home.json` | `browseCategoriesTitle`, `browseCategoriesSubtitle`, `categoriesLoading`, `categoriesSubcategories`, `subcategoriesOf`, `outOfStock` |
| `messages/ar/home.json` | Same keys in Arabic |
| `messages/en/product.json` | Created — `quantity`, `decreaseQuantity`, `increaseQuantity` |
| `messages/ar/product.json` | Created — same keys in Arabic |

---

## WhatsApp FAB

**File:** `src/shop/components/shell/WhatsAppFab.tsx`  
Fixed-position button bottom-right (`bottom-6 right-6 z-[100]`).  
- If `NEXT_PUBLIC_WHATSAPP_SUPPORT` is set → external WhatsApp link (`target="_blank"`)
- If not set → falls back to `<Link href="/contact">` (always visible)
- Icon: `FaWhatsapp` size-8, `bg-[#25D366]`, `shadow-[0_8px_24px_rgba(0,0,0,0.35)]`
