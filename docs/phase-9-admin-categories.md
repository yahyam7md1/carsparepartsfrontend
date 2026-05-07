# Phase 9 — Admin categories

This document describes the **admin categories** feature delivered in Phase 9: flat list from the backend, grouped parent/sub table in the UI, CRUD via modal, search, and **product counts** aligned with the API.

---

## Goals

- Admin users can **view**, **search**, **add**, **edit**, and **delete** categories (parents and one level of sub-categories in the table UX).
- The list is driven by **`GET /api/admin/categories`** (authenticated admin API), including **`productCount`** per category row.
- The table stays **readable in light admin styling** (contrast-friendly; avoids dim translucent dark surfaces on this screen).

---

## Route and entry

| Item | Location |
|------|----------|
| Next.js page | `src/app/(admin)/admin/(protected)/categories/page.tsx` |
| View (state + wiring) | `src/admin/views/AdminCategoriesView.tsx` |

The page renders `AdminCategoriesView`, which loads categories, owns search state, opens the modal, and handles delete confirmations.

---

## Types and API client (frontend)

| Item | Location |
|------|----------|
| `AdminCategory` type | `src/lib/api/types.ts` — `id`, `parentId`, `nameEn`, `nameAr`, `slug`, `productCount` |
| Admin category HTTP helpers | `src/lib/api/services/categories.ts` |
| Barrel exports | `src/lib/api/index.ts` |

### Endpoints used

| Method | Path | Purpose |
|--------|------|--------|
| `GET` | `/api/admin/categories` | Flat list with `productCount` |
| `POST` | `/api/admin/categories` | Create parent or child |
| `PUT` | `/api/admin/categories/:id` | Update category (names; parent context in edit UI) |
| `DELETE` | `/api/admin/categories/:id` | Delete category |

All admin calls use **`adminApi`** (`src/lib/api/adminClient.ts`) so cookies / auth match the rest of the admin app.

### Response normalization

`fetchAdminCategories()` parses each row with **`tryNormalizeAdminCategory`**, which:

- Validates `id` and optional `parentId`.
- Coerces **`productCount`** with **`toNonNegativeInt`** (handles missing or string-like numbers).
- In development, logs when the payload is not an array or rows are dropped.

Create/update responses use **`AdminCategoryPayload`** (`Omit<AdminCategory, "productCount">`) because single-resource responses may not include counts.

---

## Backend contract (reference)

The frontend expects the admin list to return **direct** product counts per category: products whose **`categoryId`** equals that category’s id (**not** summed from children). The companion backend builds counts via **`product.groupBy`** and merges into each category row (`listCategoriesForAdmin` in `CarSparePartsBackend`).

---

## Table grouping and search

Logic lives in **`src/admin/lib/category-table-rows.ts`**.

### `getVisibleCategoryIds(flat, query)`

- If the query is non-empty, includes categories whose English or Arabic name matches (case-insensitive substring).
- Includes **ancestors** of any match so child rows stay under their parent.
- If a **root** matches, includes **all its children** so the subtree is visible.

### `buildCategoryTableRows(flat, visible)`

- Sorts roots by `nameEn` (then `id`).
- For each visible root: emits one row per **visible child**, or a single **parent-only** row if there are no visible children but the root is visible.
- Row shape: **`CategoryTableRowModel`**: `{ parent, child | null, isFirstInGroup }`.

### Header stats

`AdminCategoriesView` shows filtered row count, total categories, and distinct parent count via **`countDistinctParents`**.

---

## Product count in the UI (important)

**Backend** `productCount` is per category id (direct assignments only).

**Table rule:** The **Products** column always shows **`row.parent.productCount`** — the **parent (main) category** count for that visual group.

- **Edit / Delete** still target **`row.child ?? row.parent`** (the row’s own category: sub-category when present, otherwise the parent).

**Why:** For a row like “Parent: Keko → Sub: koke”, using the child’s count showed **0** even when products were attached to the **parent** id and the API correctly returned `productCount: 2` for the parent.

**Trade-off:** If products exist **only** on a sub-category and the parent has **0** direct products, the pill still shows the **parent** count (0). Showing both “parent + child” counts would be a separate UX decision.

---

## Components

### `CategoryGroupedTable`

**File:** `src/admin/components/categories/CategoryGroupedTable.tsx`

- Search input (English/Arabic placeholder).
- Table columns: **Parent**, **Sub-category**, **Products** (pill), **Actions** (edit/delete).
- Internal helpers: **`BilingualCell`**, **`partCountDisplay`** (Part vs Parts for copy).

### `CategoryFormModal`

**File:** `src/admin/components/categories/CategoryFormModal.tsx`

- **`add` mode**
  - **New parent:** Optional inline sub-category; if both sub names provided, creates parent then child (two `POST`s); if sub empty, single parent `POST`.
  - **Existing parent:** Select root parent, required sub EN/AR, one `POST` with `parentId`.
- **`edit` mode:** `PUT` with `nameEn` / `nameAr`; shows parent context for sub-categories (read-only parent block).
- Overlay: light **white/slate** panel; dismiss with close button; errors surfaced in-form.

---

## Error handling

- **Load:** `AdminCategoriesView` uses **`isApiError`** to show API messages or a generic load failure.
- **Delete:** `window.confirm` before delete; failures shown with **`window.alert`** (including API message when available). Backend may return **409** when a category cannot be deleted (e.g. has products or children — exact rules are server-side).

---

## Styling notes

- Categories table and modal favor **solid light backgrounds** (`bg-white`, slate borders/text) so labels and inputs stay legible.
- Primary accent uses CSS variable **`var(--primary)`** for focus rings and headings where applicable.

---

## Public store API (unchanged contract)

`fetchCategoryTree` in `src/lib/api/services/categories.ts` still targets **`GET /api/categories`** for the storefront tree (`CategoryTreeNode[]`). Phase 9 admin work is separate from that path.

---

## File checklist (Phase 9)

| Area | Files |
|------|--------|
| Page | `src/app/(admin)/admin/(protected)/categories/page.tsx` |
| View | `src/admin/views/AdminCategoriesView.tsx` |
| Table | `src/admin/components/categories/CategoryGroupedTable.tsx` |
| Modal | `src/admin/components/categories/CategoryFormModal.tsx` |
| Row logic | `src/admin/lib/category-table-rows.ts` |
| API | `src/lib/api/services/categories.ts`, `src/lib/api/types.ts`, `src/lib/api/index.ts` |

---

## Possible follow-ups (not in scope of Phase 9)

- Extract shared admin primitives (search field, icon buttons, count badge) when a **second** admin list reuses them.
- Optional column or tooltip for **direct** sub-category count if product mix spans parent vs child often.
- Replace `alert` / `confirm` with accessible in-app dialogs for consistency with the rest of the admin shell.
