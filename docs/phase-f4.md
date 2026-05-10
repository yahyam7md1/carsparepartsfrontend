# Phase F4 — Products Listing Page (PLP)

This document is the **single source of truth** for the customer-facing products listing page (`/[locale]/products`). It covers the page composition, every component, URL-driven filter state, backend contract, i18n keys, shared UI used, and design decisions made during implementation.

---

## Page entry point

| File | Type | Purpose |
|------|------|---------|
| `src/app/[locale]/(shop)/products/page.tsx` | Server Component (Route) | Awaits locale, calls `setRequestLocale`, renders `<ProductsView />` |
| `src/shop/views/ProductsView.tsx` | Client Component | Composes the entire PLP layout |

### Layout

```
ProductsView (max-w-7xl, px-4, py-8)
└─ flex gap-8
   ├─ ProductsFilterSidebar  (desktop, sticky, w-64) ──┐
   │                                                    │ top-aligned
   └─ main (flex-1)                                     │
      ├─ Search bar row  ◄──────────────────────────────┘
      │  ├─ ProductsSearchBar (flex-1)
      │  └─ MobileFilterPopover (lg:hidden trigger)
      ├─ Meta row  (mt-4)
      │  ├─ "{total} products"
      │  └─ ProductsSortDropdown
      └─ ProductsResults  (mt-5)
         ├─ ProductsSkeletonGrid (loading)
         ├─ Empty / error states
         └─ ProductGrid cols="plp"
            └─ ProductCard × N
         + "Load more" Button (when hasMore)
```

**Layout rules:**
- Sidebar and main column are siblings inside one `flex` — sidebar's top edge is aligned with the search bar's top edge.
- Sidebar is desktop-only (`hidden lg:block`). On mobile it's replaced by a `MobileFilterPopover` that drops down from its trigger button.
- Main column owns the search bar, meta row, and results grid — sort dropdown stays in the meta row at every breakpoint (no desktop/mobile duplication).

---

## 1. URL-driven filter state — `useProductFilters`

**File:** `src/shop/hooks/useProductFilters.ts`

All filter state lives in the URL. The hook reads from `useSearchParams()` and writes back via `router.replace(...)` so the URL is the single source of truth and PLP is fully shareable.

### Schema

```ts
type ProductFilters = {
  q: string;              // free-text search
  brand: string[];        // brandName values (BMW, Mini, Audi, Volkswagen)
  categoryIds: number[];  // multi-select category IDs (incl. parents from cascade)
  vehicleId: number | null;
  oem: string;
  sort: ProductSort;      // "relevance" | "priceAsc" | "priceDesc" | "newest"
};
```

### URL serialization

| Filter | URL param | Format |
|--------|-----------|--------|
| `q` | `?q=brakes` | string |
| `brand` | `?brand=BMW,Mini` | CSV |
| `categoryIds` | `?categoryIds=1,2,5` | CSV of integers |
| `vehicleId` | `?vehicleId=123` | integer |
| `oem` | `?oem=34116777479` | string |
| `sort` | `?sort=priceAsc` | UI key (omitted when `relevance`) |

- Default values (`""`, `[]`, `null`, `"relevance"`) are stripped from the URL.
- URL parsing is defensive: `parseCsvNumeric` filters `NaN`; `parseSort` validates against `SORT_VALUES`; `vehicleId` only stays if `Number.isFinite`.

### Exposed API

| Function | Behaviour |
|----------|-----------|
| `filters` | Memoized derived `ProductFilters` |
| `updateFilters(patch)` | Merge patch + rewrite URL (`router.replace`, `scroll: false`) |
| `toggleBrand(brand)` | Add/remove single brand |
| `toggleCategory(id)` | Add/remove single category ID |
| `setCategoryBranch(ids, select)` | **Bulk** select/deselect (used for parent → descendant cascade) |
| `resetFilters()` | Clears all params |
| `isAnyFilterActive` | Boolean — any non-default filter set |

---

## 2. ProductsSearchBar

**File:** `src/shop/components/products/ProductsSearchBar.tsx`

- Wraps shared `SearchField` from `src/shared/ui/search-field.tsx`.
- Local controlled state + 350ms `useDebouncedValue` → writes to URL.
- Two-way sync: if URL changes externally (e.g. reset filters), `local` is updated, but only when the input isn't focused — avoids clobbering mid-typing.
- Sized to match the filter card visually: `h-12 min-h-12 rounded-xl`.
- Left adornment: `<Search />` (Lucide).

**i18n key:** `searchPlaceholder`

---

## 3. ProductsSortDropdown

**File:** `src/shop/components/products/ProductsSortDropdown.tsx`

Radix `DropdownMenu` opened from a text-only trigger:
`[icon] Sort by **Relevance** [chevron]`

### Sort options

| UI key | API key (sent to backend) | i18n key |
|--------|---------------------------|----------|
| `relevance` | *(omitted)* | `sortRelevance` |
| `priceAsc` | `price_asc` | `sortPriceAsc` |
| `priceDesc` | `price_desc` | `sortPriceDesc` |
| `newest` | `newest` | `sortNewest` |

- Active option is highlighted (`bg-primary/5`, bold) with a trailing `Check` icon.
- Selecting an option calls `updateFilters({ sort: key })`.

---

## 4. MobileFilterPopover

**File:** `src/shop/components/products/MobileFilterPopover.tsx`

Radix `Popover` — **not a full-screen drawer**. The popover anchors directly under its trigger button (`align="end"`, `sideOffset={8}`).

- Trigger: square `h-12 w-12 rounded-xl` button with `SlidersHorizontal` icon. Hidden on `lg+` (`lg:hidden`).
- Content: `w-[min(92vw,22rem)] max-h-[70vh] overflow-y-auto rounded-xl border bg-white p-5 shadow-xl`.
- Renders the shared `ProductsFilterSidebarContent` inside, with the same heading + full-bleed divider treatment as the desktop sidebar.

---

## 5. ProductsFilterSidebar

**File:** `src/shop/components/products/filters/ProductsFilterSidebar.tsx`

Two exports:

| Export | Purpose |
|--------|---------|
| `ProductsFilterSidebarContent` | Brand + Category groups — used by **both** desktop sidebar and mobile popover (single source of truth) |
| `ProductsFilterSidebar` | Outer shell — `variant="desktop"` (sticky aside) or `variant="mobile"` |

### Desktop shell

- `sticky top-24 hidden w-64 shrink-0 lg:block`
- Inner card: `max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border bg-white p-5 shadow-sm`
- **Hugs content**: uses `max-h-` (not `h-`) so the card is only as tall as its filters but caps + scrolls when overflowing.

### Auto-hiding scrollbar

```
[scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:transparent_transparent]
[&::-webkit-scrollbar]:w-1.5
[&::-webkit-scrollbar-track]:bg-transparent
[&::-webkit-scrollbar-thumb]:bg-transparent
hover:[&::-webkit-scrollbar-thumb]:bg-neutral-300/80
hover:[scrollbar-color:rgba(212,212,216,0.8)_transparent]
```

Track stays reserved so layout doesn't shift; thumb is transparent until hover.

### Dividers

| Position | Style | Purpose |
|----------|-------|---------|
| Under "Filters" heading | `-mx-5 my-4 border-t border-neutral-200/80` (full-bleed) | Visual anchor below page title |
| Between Brand and Category | `mx-2 border-t border-neutral-200/70` (inset) | Subtle group separator |

### Sections (`ProductsFilterSidebarContent`)

1. **Car Manufacturer** → `BrandFilterCards`
2. **Part Category** → `CategoryFilterTree` (rendered only if `useCategoriesTree()` returns a non-empty tree)

Each section is wrapped in `<FilterGroup title="...">` which renders a `text-xs font-bold uppercase tracking-widest text-secondary` heading.

---

## 6. BrandFilterCards

**File:** `src/shop/components/products/filters/BrandFilterCards.tsx`

> **Standalone component — NOT reusing home's `BrandCard`.** Home tiles use per-brand icon size hacks for visual weight which look out of proportion in the small filter context.

### Config (local, inside the component)

```ts
const FILTER_BRANDS = [
  { slug: "bmw",  query: "BMW",        Icon: SiBmw },
  { slug: "mini", query: "Mini",       Icon: SiMini },
  { slug: "audi", query: "Audi",       Icon: SiAudi },
  { slug: "vw",   query: "Volkswagen", Icon: SiVolkswagen },
];
```

- 2×2 grid: `grid grid-cols-2 gap-2`
- Each card: `h-[74px] rounded-xl border bg-white p-2 shadow-sm` + uniform icon `h-6 w-6` and label `text-xs font-medium`.
- **All four cards are identical in size and visual weight** (no per-brand overrides).

### Toggle state

- Unselected: `border-neutral-200/90 hover:border-primary/25 hover:shadow-md`, icon `text-secondary`, hover `text-primary`
- Selected: `border-primary border-2 bg-primary/[0.04]`, icon `text-primary`
- `cursor-pointer` explicitly applied (buttons don't get it by default).

Labels are pulled from the `home` namespace's `brandTile_{slug}` keys (same source the home grid uses, so Arabic labels stay in sync).

---

## 7. CategoryFilterTree

**File:** `src/shop/components/products/filters/CategoryFilterTree.tsx`

Recursive collapsible category tree built on Radix `Collapsible` + `Checkbox`. Data comes from `useCategoriesTree()` (returns the full nested tree).

### Behaviour

- **Every node is a checkbox row** — leaves and parents alike.
- Parents also have an expand/collapse chevron to their start (`size-5` button, separate click target).
- A parent's state is computed from its branch (self + every descendant):
  - `"all"` — all branch IDs selected → `Check` indicator
  - `"some"` — some descendants selected → `Minus` indicator (`checked="indeterminate"`)
  - `"none"` — nothing selected
- **Cascade:** clicking a parent toggles every descendant ID in **one** URL update via `setCategoryBranch(ids, select)`:
  - `state !== "all"` → select all
  - `state === "all"` → deselect all

### Auto-expand

`expandedDefaults` walks the tree once and pre-expands any branch containing a currently-selected ID (so deep filters from the URL are visible on first paint).

### Subcategory guide line

Children list:
```
ms-[14px] mt-1.5 space-y-1.5 border-s border-neutral-200/80 ps-3
```
The vertical line sits under the parent's chevron column and uses `border-s` so it stays on the correct side in both LTR and RTL.

### Row styles

- Checkbox: `size-[18px] rounded border` — fills with primary when checked / indeterminate.
- Label: `text-sm text-primary truncate`, **parents are `font-semibold`** to distinguish from leaves.
- Label `<label htmlFor={...}>` makes the text clickable.

---

## 8. ProductsResults

**File:** `src/shop/components/products/ProductsResults.tsx`

Owns fetching, pagination, and the empty/error/loading states.

### Fetch flow

```ts
fetchProductsPublic({
  q: params.q || undefined,
  brand: params.brand.length ? params.brand : undefined,
  categoryIds: params.categoryIds.length ? params.categoryIds : undefined,
  vehicleId: params.vehicleId ?? undefined,
  oem: params.oem || undefined,
  sort: PRODUCT_SORT_API_KEY[params.sort],   // ← maps UI → API; "relevance" → undefined
  page: pageToLoad,
  limit: 12,
});
```

- Filter dependencies are tracked via `JSON.stringify(filters)` (`filtersKey`) so any filter change re-runs the effect.
- Page 1 fetch on every filter change → resets the accumulator.
- "Load more" button calls `loadPage(page + 1, true)` → appends to existing list (no scroll jump).

### State machine

| State | Render |
|-------|--------|
| `loading && products.length === 0` | `<ProductsSkeletonGrid />` (8 placeholders) |
| `error` | Red banner with `t("loadError")` |
| `products.length === 0` | Centered empty-state card with `noResults` + `noResultsHint` |
| Has products | `<ProductGrid cols="plp">` + (optional) Load More button |

### Load More button

- Shown when `products.length < total`.
- Uses shared `Button variant="secondary" size="md"` with `min-w-[12rem]`.
- Disabled while `loadingMore`; label swaps between `loadMore` and `loadingMore`.

### Total propagation

Component accepts `onTotalChange?: (total: number) => void`. `ProductsView` uses this to drive the "{total} products" pill in the meta row.

---

## 9. ProductGrid (PLP variant)

**File:** `src/shop/components/products/ProductGrid.tsx`

Single shared grid wrapper with a `cols` prop:

| `cols` | Class | Used by |
|--------|-------|---------|
| `"home"` | `grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` | Best Sellers on home page |
| `"plp"` | `grid-cols-2 lg:grid-cols-3` | PLP (3 cols because of the sidebar) |

Gap: `gap-5` on both variants.

---

## 10. ProductsSkeletonGrid

**File:** `src/shop/components/products/ProductsSkeletonGrid.tsx`

Renders 8 placeholder cards using `ProductGrid cols="plp"`. Each placeholder mimics the real `ProductCard` skeleton:
- `aspect-[4/3]` image area
- Brand line + 2-line title + price block
- Bordered footer with quantity + button slabs

All bars use `animate-pulse bg-neutral-200/60`.

---

## 11. ProductCard (shared with home Best Sellers)

**File:** `src/shop/components/products/ProductCard.tsx`

Covered in detail in [phase-f3.md](./phase-f3.md#4-best-sellers--homefeaturedsection). PLP-relevant behaviour:

- **Add to Cart hover:** `hover:bg-accent hover:opacity-100 transition-colors` — overrides the base primary's `hover:opacity-95` so on hover the button cleanly swaps navy fill for accent sky-blue.
- The card is reused **as-is** on PLP (no extra wrapper) — `ProductGrid cols="plp"` is the only difference.

---

## Backend contract — `/api/products`

**Service:** `src/lib/api/services/products.ts`

### Query parameters supported

| Param | Type | Notes |
|-------|------|-------|
| `q` | `string` | Free-text search |
| `brand` | `string[]` | Repeated param: `?brand=BMW&brand=Mini` |
| `categoryIds` | `number[]` | Repeated param: `?categoryIds=1&categoryIds=2` |
| `categoryId` | `number` | Single — kept for backward compat with hero/links |
| `categorySlug` | `string` | (unused on PLP, available for slug-based links) |
| `vehicleId` | `number` | Vehicle fitment filter |
| `oem` | `string` | OEM number |
| `sort` | `"price_asc" \| "price_desc" \| "newest"` | **Omit param for relevance** |
| `page`, `limit` | `number` | Pagination (PLP uses `limit=12`) |

### Array serialization

Axios is configured with `paramsSerializer: { indexes: null }` so arrays serialize as repeated keys (`?brand=BMW&brand=Mini`) — Express-friendly, no `[]` bracket suffix.

### Sort key translation

`ProductSort` (UI) ≠ `ProductSortApi` (backend). The map enforces this:

```ts
export const PRODUCT_SORT_API_KEY: Partial<Record<ProductSort, ProductSortApi>> = {
  priceAsc: "price_asc",
  priceDesc: "price_desc",
  newest: "newest",
  // relevance intentionally absent — omit `sort` entirely so backend returns its default order
};
```

`PublicProductListParams.sort` is typed as `ProductSortApi`, not `ProductSort`, so misuse is caught at compile time.

---

## Shared UI components used on this page

| Component | File | Used by |
|-----------|------|---------|
| `SearchField` | `src/shared/ui/search-field.tsx` | `ProductsSearchBar` |
| `Button` | `src/shared/ui/button.tsx` | `ProductsResults` (Load More), `ProductCard` (Add to Cart) |
| `QuantitySelector` | `src/shared/ui/quantity-selector.tsx` | `ProductCard` |

Radix UI primitives:

| Primitive | Component | Used in |
|-----------|-----------|---------|
| `@radix-ui/react-popover` | `MobileFilterPopover` |
| `@radix-ui/react-dropdown-menu` | `ProductsSortDropdown` |
| `@radix-ui/react-collapsible` | `CategoryFilterTree` |
| `@radix-ui/react-checkbox` | `CategoryFilterTree` |

---

## i18n

### Files added/changed

| File | Notes |
|------|-------|
| `messages/en/products.json` | **New** namespace |
| `messages/ar/products.json` | **New** namespace |
| `src/i18n/loadMessages.ts` + `src/i18n/messages.ts` | Registered `products` namespace |

### Keys (namespace `products`)

| Key | Surface |
|-----|---------|
| `title` | (reserved, page heading if needed) |
| `searchPlaceholder` | Search bar placeholder + aria-label |
| `productsCount` | "{n} **products**" suffix in meta row |
| `filtersTitle` | Sidebar heading |
| `filtersOpen` | Mobile filter trigger aria-label |
| `filtersClose` / `filtersReset` / `filtersShowResults` | (reserved for future reset UX) |
| `filtersCarManufacturer` | Brand section heading |
| `filtersPartCategory` | Category section heading |
| `sortBy` | "Sort by" label in dropdown trigger |
| `sortRelevance` / `sortPriceAsc` / `sortPriceDesc` / `sortNewest` | Sort option labels |
| `loadMore` / `loadingMore` | Pagination button label |
| `noResults` / `noResultsHint` | Empty state |
| `loadError` | Error banner text |

Brand labels are reused from `home` namespace (`brandTile_bmw`, `brandTile_mini`, `brandTile_audi`, `brandTile_vw`) so they stay in sync with the home grid.

---

## Design tokens used (consistent with phase F3)

| Token | Where |
|-------|-------|
| `border-neutral-200/90` | All card borders (default) |
| `hover:border-primary/25` | Brand filter card hover, sidebar card borders are static |
| `border-primary` + `bg-primary/[0.04]` | Selected brand filter card |
| `bg-accent` | Add-to-Cart hover (PLP cards) |
| `text-primary` / `text-secondary` | Text hierarchy throughout |
| `text-xs uppercase tracking-widest text-secondary` | All filter group headings |

---

## Known follow-ups (not in this phase)

- Active-filter chips above the grid (with × to remove individual filters).
- Reset-all button surfaced visibly (`isAnyFilterActive` is already exposed by the hook).
- Brand counts / disabled brands when zero products match.
- Price range filter (explicitly out of scope this phase).
- Server-side rendered initial page (PLP is fully CSR right now to keep filter logic colocated; SSR would require migrating URL parsing to the server).
