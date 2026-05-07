# Phase F11 — Admin: Inventory (products)

This document describes the **Inventory** admin feature: searchable, paginated **product catalog**; **inline** price/stock edits; **active** toggle; **Add / Edit product** modal (bilingual fields, category picker, vehicle fitment combobox, multi-image upload); and read-only **OEM** / **fitment** list modals.

**Route:** `GET /admin/inventory` — `src/app/(admin)/admin/(protected)/inventory/page.tsx`.

---

## Goals

| Area | Behavior |
|------|----------|
| **List** | **`GET /api/admin/products`** with `page`, `limit`, optional **`q`**, optional **`categoryId`**. Row count and pagination footer driven from **`total`**. |
| **Toolbar** | Debounced **search** (`useDebouncedValue`, ~350ms) + **`CategoryHierarchyCombobox`** filter (hierarchical categories with search; **All categories** clears filter). |
| **Table** | Columns: **Image** (main/thumb), **SKU** + optional **Ref:** OEM line, **Name** (EN + AR), **Category** breadcrumb, **OEM** pill (opens list modal), **Fitment** pill (opens compatible-vehicles modal), **Price** (inline edit), **Stock** (inline edit, plain number display), **Status** compact toggle + label, **Actions** (edit / delete). |
| **Pagination** | Previous / Next + **`PageJumpControl`** when multiple pages exist. |
| **Add product** | **`AddProductModal`**: general + bilingual sections, **`CategoryHierarchyCombobox`** (required leaf/parent selection per validation), vehicle search combobox (`useAdminVehicles`), image file picker with thumbnails. **Save sequence:** `POST /api/admin/products` → optional **`POST .../images`** per file → **`PUT .../fitments`**. |
| **Edit product** | Same modal loads **`GET /api/admin/products/:id`**, **`PUT`** updates; fitments replaced with **`PUT .../fitments`**; new images uploaded after save. |
| **Price / stock** | **Price:** confirm prompts **`PUT /api/admin/products/:id`** with new `price`. **Stock:** **`PATCH /api/admin/products/:id/inventory`** with `stockQuantity`. |
| **Active toggle** | **`PUT`** with `isActive` flipped. |
| **Delete** | Confirm modal, then **`DELETE /api/admin/products/:id`**. |
| **Multipart images** | **`uploadAdminProductImage`** sends **`FormData`** with field **`file`**. The default **`adminApi`** **`Content-Type: application/json`** must not apply to this request — the service uses a per-request override so the runtime sets **`multipart/form-data`** with boundary (see `adminProducts.ts`). |

---

## Backend contract (reference)

| Method | Path | Role |
|--------|------|------|
| `GET` | `/api/admin/products` | Query: `page`, `limit`, `q?`, `categoryId?`, plus other filters as implemented server-side. Response: `{ products, total, page, limit }`. |
| `GET` | `/api/admin/products/:id` | **`ProductDetail`** including **`fitments`** (vehicles). |
| `POST` | `/api/admin/products` | Create body per **`CreateAdminProductBody`**. |
| `PUT` | `/api/admin/products/:id` | Partial/full update per **`UpdateAdminProductBody`**. |
| `DELETE` | `/api/admin/products/:id` | Remove product. |
| `PATCH` | `/api/admin/products/:id/inventory` | Body: `{ stockQuantity }`. |
| `PUT` | `/api/admin/products/:id/fitments` | Body: `{ vehicleIds: number[] }` (full replace). |
| `POST` | `/api/admin/products/:id/images` | **Multipart** field **`file`**; optional `isMain`, `sortOrder`. |
| `GET` | `/api/admin/categories` | Flat list for tree UI + breadcrumbs (`fetchAdminCategoriesFlat`). |
| `GET` | `/api/admin/vehicles` | Vehicle search for fitment combobox (`useAdminVehicles`). |

---

## Architecture (data flow)

```mermaid
flowchart LR
  subgraph ui [Admin UI]
    IV[InventoryView]
    TB[InventoryToolbar]
    PCT[ProductCatalogTable]
    APM[AddProductModal]
    SLM[AdminSimpleListModal]
  end
  subgraph hooks [Hooks]
    UAP[useAdminProducts]
    UDV[useDebouncedValue]
    UAV[useAdminVehicles]
  end
  subgraph api [API layer]
    AP[adminProducts.ts]
    AC[adminCategories.ts]
    AA[adminApi]
  end
  subgraph be [Backend]
    PR[/api/admin/products]
    CT[/api/admin/categories]
    VH[/api/admin/vehicles]
  end

  IV --> UAP
  IV --> TB
  IV --> PCT
  IV --> APM
  IV --> SLM
  TB --> UDV
  APM --> UAV
  UAP --> AP
  APM --> AP
  TB --> AC
  UAV --> AA
  AP --> AA
  AC --> AA
  AA --> PR
  AA --> CT
  AA --> VH
```

---

## File inventory

### Views & routing

| File | Role |
|------|------|
| `src/admin/views/InventoryView.tsx` | Page state: search, category filter, pagination, modals, delete confirm, price/stock confirm flows; loads categories once. |
| `src/app/(admin)/admin/(protected)/inventory/page.tsx` | Renders **`InventoryView`**. |

### Inventory components

| File | Role |
|------|------|
| `src/admin/components/inventory/InventoryToolbar.tsx` | **`SearchField`** + **`CategoryHierarchyCombobox`**. |
| `src/admin/components/inventory/ProductCatalogTable.tsx` | Table, inline editors, pills, toggle, pagination footer. |
| `src/admin/components/inventory/AddProductModal.tsx` | Add/edit form, vehicles, images, submit orchestration. |
| `src/admin/components/inventory/AdminSimpleListModal.tsx` | OEM lines + fitment lines (read-only). |

### Category tree (shared + utils)

| File | Role |
|------|------|
| `src/shared/ui/category-hierarchy-combobox.tsx` | Reusable hierarchical category dropdown with search. |
| `src/admin/utils/categoryHierarchy.ts` | **`buildCategoryTree`**, **`filterCategoryTree`**, **`categoryTriggerLabel`**, **`categoryAncestorTrailEn`**. |
| `src/admin/utils/categoryBreadcrumb.ts` | **`categoryBreadcrumbEn`** for table category column. |
| `src/admin/utils/vehicleFitmentLabel.ts` | Single-line vehicle label for fitment modal lines. |

### API & hooks

| File | Role |
|------|------|
| `src/lib/api/services/adminProducts.ts` | List, detail, CRUD, inventory patch, fitments, image upload/delete, append fitment helper. |
| `src/lib/api/services/adminCategories.ts` | **`fetchAdminCategoriesFlat`**, **`AdminCategoryRow`**. |
| `src/hooks/useAdminProducts.ts` | Product list with **`params`** + **`refetch`**. |
| `src/hooks/useDebouncedValue.ts` | Debounced search string. |
| `src/hooks/useAdminVehicles.ts` | Vehicle search for modal fitment UX. |

### Shared UI (reused)

| File | Role |
|------|------|
| `src/shared/ui/search-field.tsx`, `wide-modal.tsx`, `modal.tsx`, `button.tsx`, `input.tsx`, `label.tsx`, `field-error.tsx`, `page-jump-control.tsx`, `confirm-modal.tsx` | Composed in toolbar, table, and modals. |

---

## UX decisions

1. **Page size:** **`PAGE_SIZE = 10`** in **`InventoryView`**.
2. **Category filter** sends the **selected category id** as `categoryId`. If the backend only matches **exact** `Product.categoryId`, picking a **parent** category in the combobox only shows products assigned to that parent row; expanding the filter to “this node + descendants” is a backend enhancement if you want true subtree filtering.
3. **OEM column** — “No OEM” is a disabled-style pill; with a number, the pill opens the simple list modal.
4. **Images on create** — uploads run **after** `POST` returns an **`id`** (multipart endpoint is per-product).

---

## Verification

- `npm run lint`
- Manual: `/admin/inventory` — search, category filter, pagination, edit price/stock, toggle active, OEM/fitment modals, add product with images and fitments, edit product, delete with confirm.

---

## Future / follow-ups

- Dedicated **`ImageUploadGrid`** with reorder/main flag if the API exposes sort endpoints beyond upload metadata.
- **Chassis / vehicleId** filters in the toolbar when product list query params are finalized.
- Backend **subtree** category filter (one parent id → all descendant category ids) if product rows only use leaf categories.

---

## Related

- Roadmap: **`docs/FRONTEND_PHASES.md`** — § Phase F11.
- Vehicle admin detail: **`docs/phase-f10.md`** (fitment APIs overlap).
