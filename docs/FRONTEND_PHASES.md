# Frontend implementation phases — Genuine German Parts

This document is the **single source of truth** for building **`carsparepartsfrontend`** (Next.js 15 App Router) against **`CarSparePartsBackend`**. It merges **admin console** mockups (dashboard, inventory, vehicles, categories, modals) and **customer shop** mockups (home hero, PLP, cart, WhatsApp checkout).

**Prerequisites (already in repo):**

- `NEXT_PUBLIC_API_BASE_URL` → see `.env.local.example`
- `src/lib/api/` — Axios client, services, types, `ApiError`
- `src/hooks/` — `useCategoriesTree`, `usePublicProducts`, `useFeaturedProducts`, `useProduct`, `useProductFitments`, `useAdminVehicles`

---

## Global conventions

| Topic | Decision |
|-------|----------|
| **Stack** | Next.js 15 App Router, React 19, TypeScript, Tailwind v4, **next-intl** (`en` / `ar`), Axios |
| **Shop routes** | Prefer `src/app/(shop)/…` |
| **Admin routes** | Prefer `src/app/(admin)/admin/…` |
| **Asset URLs** | API returns paths like `/uploads/...` — prefix with `NEXT_PUBLIC_API_BASE_URL` (no trailing slash mishmash) |
| **Money** | API exposes `price` as **string** on products — parse for display; WhatsApp checkout uses numeric `unitPrice` in POST body |
| **Errors** | Use `ApiError` + `isApiError`; show user-safe `message`; dev-only log `details` |

---

## Master component registry

Build reusable pieces before or during the phase that first needs them. Names are suggestions; colocate under `src/shared/ui/` or `src/shop/components/` / `src/admin/components/` as you prefer.

### Layout & shell

| Component | Used by | Notes |
|-----------|---------|-------|
| `ShopShell` | Shop pages | Wraps header + main + footer |
| `AdminShell` | Admin pages | Sidebar + main content area |
| `ShopHeader` | Shop | Logo, nav (Home, Products, Contact), search input, cart icon + badge, **language switch** (EN / عربي) |
| `ShopFooter` | Shop | Dark blue footer: brand blurb, SHOP / HELP / LEGAL columns |
| `AdminSidebar` | Admin | Logo “ADMIN CONSOLE”, nav items (Dashboard, Inventory, Vehicle Library, Categories, Settings), **Log out** |
| `PageHeader` | Both | Title, subtitle, optional row count, primary action button (+ Add …) |
| `AdminPageHeader` | Admin | Thin wrapper if you need admin-specific toolbar slots |

### Navigation & actions

| Component | Notes |
|-----------|--------|
| `NavLink` | Active state for shop + admin |
| `IconButton` | Edit / delete / close |
| `LanguageSwitch` | Toggles next-intl locale; persists preference (`cookie` strategy in next-intl) |
| `WhatsAppFab` | Fixed green circle — deep link or pre-filled message later |
| `WhatsAppCtaButton` | Full-width green button + icon (“Chat with specialist”, “Confirm order via WhatsApp”) |

### Data display

| Component | Notes |
|-----------|--------|
| `DataTable` | Columns, optional sort; mobile: cards or horizontal scroll |
| `StatCard` | KPI: icon, value, label (dashboard top row) |
| `Badge` / `Pill` | Chassis codes, status, tags |
| `Timeline` | Activity log (when backend exists) |
| `EmptyState` | Illustration/text + CTA |
| `ErrorState` | `message` + Retry |
| `Skeleton` / `Spinner` | Loading |

### Forms

| Component | Notes |
|-----------|--------|
| `Input`, `Textarea` | Labels, errors, RTL-aware |
| `Select`, `NativeSelect` | Category, brand dropdowns |
| `Combobox` | Searchable parent category, vehicle search (ARIA) |
| `SearchField` | Leading icon, debounced `onChange` |
| `Toggle` / `Switch` | Product active/hidden |
| `Checkbox` | Category filters (PLP accordion) |
| `FileDropzone` | Multi image; `FormData` for admin upload |
| `Modal` | Add product, add category, add vehicle |
| `Tabs` | Hero “By vehicle” / “By part · OEM”; optional modal sections |
| `FormSection` | Titled block (“General”, “Bilingual”, “Fitment”, “Media”) |

### Shop-specific

| Component | Notes |
|-----------|--------|
| `Hero` | Background image, headline, subcopy |
| `VehicleSearchPanel` | Tabs + Make / Series / Chassis selects + “Find parts” — **depends on vehicle UX API** (see gaps) |
| `OemSearchPanel` | Single search → products `q` or `oem` |
| `BrandGrid` / `BrandCard` | Shop-by-brand; logo + label → link to filtered PLP |
| `ProductCard` | Image, brand line, title, short desc, price (optional strikethrough later), `QuantityStepper`, “+ Add” |
| `QuantityStepper` | − / + / numeric display |
| `FilterSidebar` | Brand row, category accordion + checkboxes, price range slider |
| `ProductGrid` | Responsive columns |
| `CategoryAccordion` | PLP left rail |
| `PriceRangeSlider` | Min/max — **needs API support** or client-only filter |
| `CartLineItem` | Thumb, brand, title, desc snippet, stepper, line subtotal, remove |
| `OrderSummary` | Subtotal, shipping note, total, WhatsApp CTA |
| `SupportBanner` | Navy CTA strip + WhatsApp button |
| `StatsStrip` | Icons + numbers + labels (marketing; can be static) |

### Admin-specific

| Component | Notes |
|-----------|--------|
| `InventoryToolbar` | Search, category select, chassis field, “+ Add product” |
| `ProductCatalogTable` | IMG, SKU/REF, NAME (en/ar), CATEGORY breadcrumb, FITMENT link, PRICE, STOCK, STATUS toggle, actions |
| `CategoryTreeTable` | Parent / sub rows, product counts, actions |
| `VehicleLibraryTable` | Brand/series, chassis pill, years, parts count link, actions |
| `FitmentPicker` | Search vehicles + selected chips; drives `PUT /api/admin/products/:id/fitments` |
| `LinkedProductsPicker` | Add vehicle modal: search SKUs, merge catalog — **may need backend** |
| `ImageUploadGrid` | Preview + reorder + primary image |
| `RowCountLabel` | “8 / 8 rows” pattern |

### State & cross-cutting

| Concern | Approach |
|---------|----------|
| **Cart** | React Context or Zustand; persist `localStorage` optional |
| **Admin JWT** | httpOnly cookie (ideal) or memory + `sessionStorage` (MVP); attach `Authorization` on admin Axios calls (extend `apiClient` or `adminApi` instance) |
| **Forms** | React Hook Form optional later; start controlled or RHF in modals only |

---

## Backend ↔ UI mapping (reference)

### Public (shop)

| UI need | Endpoint |
|---------|----------|
| Category tree (nav / filters) | `GET /api/categories` |
| Product list | `GET /api/products` (`page`, `limit`, `categoryId`, `categorySlug`, `vehicleId`, `oem`, `q`) |
| Featured / best sellers | `GET /api/products/featured` |
| Product detail | `GET /api/products/:id` |
| Fitments only | `GET /api/products/:id/fitments` |
| WhatsApp message + URL | `POST /api/checkout/whatsapp-intent` |

### Admin (JWT)

| UI need | Endpoint |
|---------|----------|
| Login | `POST /api/auth/login` |
| Me | `GET /api/admin/me` |
| Categories CRUD | `GET/POST/PUT/DELETE /api/admin/categories` |
| Vehicles CRUD | `GET/POST/PUT/DELETE /api/admin/vehicles` |
| Products CRUD | `GET/POST/PUT/DELETE /api/admin/products` |
| Images | `POST /api/admin/products/:id/images` (multipart `file`), `DELETE .../images/:imageId` |
| Fitments | `PUT /api/admin/products/:id/fitments` |
| Inventory | `PATCH .../inventory`, `PATCH .../inventory/bulk` |

### Known backend gaps vs mockups (schedule backend follow-ups or simplify UI)

| Mockup feature | Gap |
|----------------|-----|
| **Dashboard KPIs** (total products, OOS, low stock &lt;5, featured count) | No aggregate admin endpoint — add e.g. `GET /api/admin/stats` or compute (avoid loading entire catalog client-side) |
| **Activity log** | No audit API — add logging table + `GET /api/admin/activity` or hide widget in v1 |
| **Admin inventory “chassis” filter** | Align with `vehicleId` or new query param on admin product list |
| **PLP price min/max + sort** | Public list lacks `minPrice` / `maxPrice` / `sort` — add or fake sort client-side on current page only |
| **Strike-through “was” price** | No `compareAtPrice` in schema — add fields or remove from UI v1 |
| **Hero cascading Make → Series → Chassis** | Vehicles list has `brand` filter only — add **facets** endpoints or hierarchical options |
| **Vehicle modal “merge catalog”** | Copy all fitments from vehicle A → B across products — best as **one backend mutation** |
| **“Parts catalog” count per vehicle** | Needs **count** endpoint or Prisma `_count` in list |
| **Admin vehicle search combobox** | May need `GET /api/admin/vehicles?q=` |

---

## Phase F0 — Foundation & design tokens

**Goal:** Repeatable visual language and route shells without business data.

### Deliverables

- CSS variables or Tailwind theme: **navy** backgrounds, **white** surfaces, **green** WhatsApp CTA, radii, spacing scale.
- Typography scale (headings, body, mono for SKUs).
- `ShopShell` + `AdminShell` as layout wrappers (children only).
- Placeholder pages: `/`, `/admin/dashboard` with “Phase F0” stub.

### Components to introduce

- None mandatory beyond layout wrappers; optional `Container`, `Stack`.

### Exit criteria

- `npm run build` passes; locales compile; shells render on stub routes.

---

## Phase F1 — Internationalization & API smoke

**Goal:** **next-intl** wired for `en` / `ar`, RTL for Arabic, one page proves API connectivity.

### Deliverables

- next-intl: `[locale]` routing **or** middleware-based locale prefix — pick one pattern and document in README.
- Messages files: `messages/en.json`, `messages/ar.json` (navigation labels, common buttons).
- **RTL:** `dir="rtl"` on `<html>` when locale is `ar`.
- Smoke page: e.g. `/[locale]` or shop home calling **one** hook (`useCategoriesTree` or `useFeaturedProducts`) and rendering JSON or simple list.

### Components

- `LanguageSwitch` (minimal).

### Services / hooks

- Use existing hooks; add **`getImageUrl(path: string)`** helper if not present (`baseURL + path`).

### Exit criteria

- Toggle language; layout mirrors; API returns data in dev with `.env.local`.

---

## Phase F2 — Shop global chrome

**Goal:** Real **header + footer + FAB** matching customer mockups (structure, not all data).

### Deliverables

- `ShopHeader`: logo “Genuine German Parts”, links Home / Products / Contact, search **UI** (can navigate to `/products?q=…` later), cart icon + **badge** from cart context (start with Context + `0`), `LanguageSwitch`.
- `ShopFooter`: 4 columns SHOP / HELP / LEGAL + brand blurb.
- `WhatsAppFab`: fixed position at the bottom right of screen use react icons whatsapp icon; `href` to `https://wa.me/...` from `NEXT_PUBLIC_WHATSAPP_SUPPORT` optional env or static.

### Components

- `ShopHeader`, `ShopFooter`, `WhatsAppFab`, `NavLink`.

### Exit criteria

- Any shop route wrapped in `ShopShell` shows consistent chrome.

---

## Phase F3 — Marketing home

**Goal:** Landing experience: hero, vehicle/OEM widget (**UI + wiring** as APIs allow), shop-by-brand, best sellers, CTA strip, stats strip.

### Deliverables

- **Hero** with background asset and headline/subcopy (copy from design).
- **Tabs:** `VehicleSearchPanel` + `OemSearchPanel`.
  - **MVP:** OEM tab submits to `/products?oem=` or `?q=`.
  - **Vehicle tab:** Until backend facets exist, use **degraded UX**: single “Search vehicles” combobox hitting admin list is wrong for public — prefer **stub** makes or hardcoded BMW/Audi/VW/Mini linking to `brandName` / `vehicleId` **once** API is ready.
- **Shop by brand:** `BrandGrid` — static 4 cards or config array; links to `/products?…`.
- **Best sellers:** `useFeaturedProducts` → `ProductGrid` of `ProductCard` **read-only** (Add works if cart from Phase F5 — can show cards without cart first).
- **SupportBanner** + **StatsStrip** (static numbers OK).

### Components

- `Hero`, `VehicleSearchPanel`, `OemSearchPanel`, `BrandGrid`, `BrandCard`, `ProductGrid`, `ProductCard` (v1 without cart), `SupportBanner`, `StatsStrip`.

### Exit criteria

- Home is close to design; featured products are live from API.

---

## Phase F4 — Product listing (PLP)

**Goal:** Filterable grid like mockup: search, category, brands, price UI, sort UI.

### Deliverables

- Route: `/products` (or `/[locale]/products`).
- `FilterSidebar`:
  - **Brand tiles** — map to product `brandName` filter or future vehicle filter (document decision).
  - **Category accordion** — data from `useCategoriesTree`; leaf selection sets `categorySlug` or `categoryId`.
  - **Price slider** — if no API: filter **current result client-side** only (document limitation) or hide until backend adds `minPrice`/`maxPrice`.
- **Sort** — if no API: sort client-side on page (`price`, `nameEn`).
- **Search bar** — `q` debounced → `usePublicProducts`.
- **Pagination** — use `page` / `limit` / `total` from API.

### Components

- `FilterSidebar`, `CategoryAccordion`, `PriceRangeSlider` (optional), `ProductGrid`, enhanced `ProductCard`.

### Hooks

- `usePublicProducts` with memoized params object from filter state.

### Exit criteria

- Combined filters + search produce coherent results; mobile layout stacks sidebar (drawer optional).

---

## Phase F5 — Product detail (PDP) & image URLs

**Goal:** Full product page + fitments section.

### Deliverables

- Route: `/products/[id]`.
- `useProduct(id)`; build absolute image URLs for gallery.
- Sections: title (locale-aware name), SKU, OEM, brand, category breadcrumb, price, stock messaging, bilingual description, **fitments** table or “compatible vehicles” list (from detail or `useProductFitments`).
- SEO: `generateMetadata` with title/description.

### Components

- `ProductGallery`, `Breadcrumb`, `FitmentList` / table.

### Exit criteria

- PDP matches core design; inactive product shows 404 from API.

---

## Phase F6 — Cart & WhatsApp checkout

**Goal:** Cart page + integration with **`POST /api/checkout/whatsapp-intent`**.

### Deliverables

- **Cart context** (or Zustand): lines with `sku`, `quantity`, `unitPrice` (number), `nameEn`, `nameAr` (from product when added).
- **Cart page:** line items, `OrderSummary`, “Confirm order via WhatsApp” → build payload with **`locale`** from next-intl, POST intent, `window.open(waUrl)` or clipboard fallback.
- Header cart **badge** = line count or quantity sum.

### Components

- `CartLineItem`, `OrderSummary`, `QuantityStepper` (shared with PLP cards).

### Exit criteria

- End-to-end: add from PLP/PDP → cart → WhatsApp opens with correct language message.

---

## Phase F7 — Hero vehicle flow (hardening)

**Goal:** Make **By vehicle** tab match design when backend ready.

### Deliverables

- Replace stubs with **cascading selects** fed by new APIs (coordinate with backend).
- “Find parts” navigates to `/products?vehicleId=<id>`.

### Dependencies

- Backend: vehicle facets or hierarchical endpoints.

### Exit criteria

- Vehicle path works without hacks; deep-links shareable.

---

## Phase F8 — Admin authentication & shell

**Implementation detail:** see **[phase-f8.md](./phase-f8.md)**.

**Goal:** Secure admin area; sidebar matches design.

### Deliverables

- Login page: `POST /api/auth/login`, store token (choose strategy).
- Axios: **admin** requests attach `Authorization: Bearer …` (interceptor reading from secure store).
- Protect `(admin)` routes: redirect to login if 401 from `/me`.
- `AdminShell` + `AdminSidebar` + logout clears token.

### Components

- `AdminSidebar`, login `Form` (email/username + password per backend).

### Hooks

- `useAuth` / `useSession` (token + `me` + logout).

### Exit criteria

- Cannot access admin routes unauthenticated; refresh keeps session per chosen strategy.

---

## Phase F9 — Admin: Categories

**Goal:** Categories table + Add category modal per design.

### Deliverables

- List: `GET /api/admin/categories` (flat) — **build tree in client** for parent/child display OR show flat with indent by `parentId`.
- Search filter client-side (English/Arabic).
- Add/Edit modal: parent + sub names EN/AR, optional slug (if UI exposes it).
- Delete with confirmation; surface **409** errors from API.

### Components

- `CategoryTreeTable` or grouped table, `AddCategoryModal`.

### Services

- Extend `src/lib/api/services/categories.ts` (admin CRUD).

### Exit criteria

- Parity with category mockup excluding icons (optional asset pass).

---

## Phase F10 — Admin: Vehicle library

**Goal:** Vehicle table + Add/Edit vehicle + optional fitment linking UX.

**Implementation detail:** see **[phase-f10.md](./phase-f10.md)**.

### Deliverables

- Table: `useAdminVehicles` with pagination + search (`q`).
- Add vehicle: **brand** (preset dropdown + legacy on edit), **series**, **specifics**, **chassis**, **year range** (no name fields in UI).
- Edit/Delete.
- **Parts catalog** count from API (`fitmentCount`); badge opens catalog modal (`GET /api/admin/products?vehicleId=`).
- **Add/Edit modal:** merge fitments (`POST .../merge-fitments`) + link products via fitments API (see `phase-f10.md`). Optional **Phase 10b**: bulk fitment mutation to reduce many round-trips.

### Components

- `VehicleLibraryView`, `VehicleLibraryTable`, `VehicleFormModal`, `VehicleCatalogModal`; shared `SearchField`, `Modal`, `Select`.

### Exit criteria

- CRUD matches Vehicle Library screen; search works.

---

## Phase F11 — Admin: Inventory (products)

**Implementation detail:** see **[phase-f11.md](./phase-f11.md)**.

**Goal:** Product catalog table + status toggles + navigation to edit + **Add product** modal.

### Deliverables

- Table data: `GET /api/admin/products` with `q`, filters.
- Columns: thumbnail (main image URL), SKU/OEM, bilingual name, category path (from `category`), fitment **count** (from `detail` expensive — prefer backend `include: { _count: { fitments: true } }` **future**), price, stock, **active** toggle → `PATCH` or `PUT` product `isActive`.
- Row actions: edit (modal or `/admin/products/[id]`), delete.
- **Add product modal:** general fields, bilingual, **FitmentPicker**, **FileDropzone** (POST images after create), Save sequence: create → upload images → PUT fitments.

### Components

- `InventoryToolbar`, `ProductCatalogTable`, `AddProductModal`, `FitmentPicker`, `ImageUploadGrid`, `Toggle`.

### Services

- `src/lib/api/services/admin-products.ts` (all admin product endpoints, multipart helper).

### Exit criteria

- Single admin can run inventory without Postman for core flows.

---

## Phase F12 — Admin: Dashboard & polish

**Implementation detail:** see **[phase-f12.md](./phase-f12.md)**.

**Goal:** Dashboard widgets; production hardening.

### Deliverables

- **StatCard** row: wire to **new stats API** or placeholder with “Coming soon”.
- **Low stock table:** `GET /api/admin/products?stockQuantity_max=4` **only if backend supports** — else dedicated endpoint.
- **Activity timeline:** real data or remove.
- **Recent tables:** `GET` products and vehicles with `sort=createdAt desc` **if added** or client-side on last page of list.
- Responsive pass, focus rings, reduced motion, **eslint a11y** spot fixes.

### Exit criteria

- Admin + shop acceptable for pilot users; documented known limitations.

---

## Summary phase table

| Phase | Name |
|-------|------|
| F0 | Foundation & tokens |
| F1 | i18n + API smoke |
| F2 | Shop chrome |
| F3 | Home marketing |
| F4 | PLP |
| F5 | PDP |
| F6 | Cart + WhatsApp |
| F7 | Hero vehicle (API-dependent) |
| F8 | Admin auth & shell |
| F9 | Admin categories |
| F10 | Admin vehicles |
| F11 | Admin inventory / products |
| F12 | Dashboard & polish |

---

## Appendix — Suggested folder structure (evolve as you go)

```text
src/
  app/
    (shop)/[locale]/...
    (admin)/admin/...
  lib/api/          # existing
  hooks/            # existing + useAuth, useCart later
  shared/ui/        # design-system primitives
  shop/components/  # ProductCard, Hero, ...
  admin/components/ # ProductCatalogTable, ...
  cart/             # CartProvider, types
```

---

*Last updated: added F8 / F11 / F12 implementation docs (`phase-f8.md`, `phase-f11.md`, `phase-f12.md`). Adjust phase numbers if you merge F7 into F3 or split F11.*
