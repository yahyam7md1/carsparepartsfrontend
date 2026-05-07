# Phase F10 — Admin: Vehicle library

This document describes the **implemented** Vehicle Library admin feature: table with search and pagination, **Add / Edit** vehicle modal with fitment linking, **parts catalog** modal, and backend integration via **`adminApi`** (JWT `Authorization` header, same-origin proxy in dev).

**Route:** `GET /admin/vehicles` — `src/app/(admin)/admin/(protected)/vehicles/page.tsx`.

---

## Goals

| Area | Behavior |
|------|----------|
| **List** | Paginated vehicles from `GET /api/admin/vehicles` with optional `q` (debounced full-text style search), `page`, `limit` (20 per page). |
| **Table** | Columns: **Brand**, **Series**, **Specifics**, **Chassis**, **Years**, **Parts catalog** (count badge), **Actions** (edit / delete). |
| **Pagination** | Previous / Next; when **more than one** page exists, the current page is a **numeric input** (blur or **Enter** applies; value clamped to `1…pages`). |
| **Add / Edit** | Modal with required fields aligned to backend `createVehicleBodySchema`: **brand**, **series**, **specifics**, **chassisCode**, **yearRange**. **No name EN/AR** fields in the UI (not required for this product flow). |
| **Brand** | Dropdown presets: **BMW**, **Volkswagen**, **Mini Cooper**, **Audi**. On **edit**, if the existing DB brand is not in the list, it appears as an extra option so legacy rows stay editable. |
| **Parts count** | Each row shows **`fitmentCount`** from the admin list API (`AdminVehicleListRow`). |
| **Catalog badge** | Opens read-only **parts catalog** modal: `GET /api/admin/products` with `vehicleId` (+ optional in-modal `q`, pagination). |
| **Fitment UX** | **Copy from another vehicle:** search vehicles; **Add** applies merge on save after create; **Edit** can run **Merge catalog** immediately (`POST /api/admin/vehicles/merge-fitments`). **Add from inventory:** search products; linked list; on save, `appendVehicleToProductFitments` per product; **Remove** on edit calls `replaceAdminProductFitments` after loading current fitments. |
| **Delete** | Confirm modal, then `DELETE /api/admin/vehicles/:id`. |

---

## Backend contract (reference)

| Method | Path | Role |
|--------|------|------|
| `GET` | `/api/admin/vehicles` | Query: `page`, `limit`, `brand?`, `q?`. Response: `{ vehicles, total, page, limit }`. Vehicles include **`fitmentCount`**. |
| `GET` | `/api/admin/vehicles/:id` | Single vehicle (used by services if needed). |
| `POST` | `/api/admin/vehicles` | Create body: `brand`, `series`, `specifics`, `chassisCode`, `yearRange`, optional `nameEn` / `nameAr` (not sent from current UI). |
| `PUT` | `/api/admin/vehicles/:id` | Partial update; at least one field required by backend refine. |
| `DELETE` | `/api/admin/vehicles/:id` | `204` on success. |
| `POST` | `/api/admin/vehicles/merge-fitments` | Body: `{ sourceVehicleId, targetVehicleId }`. |
| `GET` | `/api/admin/products` | For inventory search and catalog modal: `q`, `vehicleId`, `page`, `limit`, etc. |
| `GET` | `/api/admin/products/:id` | Product detail including **`fitments`** (for append/unlink). |
| `PUT` | `/api/admin/products/:id/fitments` | Body: `{ vehicleIds: number[] }` (full replace). |

All admin calls use **`adminApi`** (Bearer token from `sessionStorage`, request interceptor).

---

## Architecture (data flow)

```mermaid
flowchart LR
  subgraph ui [Admin UI]
    VLV[VehicleLibraryView]
    VLT[VehicleLibraryTable]
    VFM[VehicleFormModal]
    VCM[VehicleCatalogModal]
  end
  subgraph hooks [Hooks]
    UAV[useAdminVehicles]
    UDV[useDebouncedValue]
  end
  subgraph api [API layer]
    VS[vehicles.ts service]
    AP[adminProducts.ts service]
    AA[adminApi]
  end
  subgraph be [Backend]
    AV[/api/admin/vehicles]
    PR[/api/admin/products]
  end

  VLV --> UAV
  VLV --> VLT
  VLV --> VFM
  VLV --> VCM
  UAV --> VS
  VFM --> VS
  VFM --> AP
  VCM --> AP
  VS --> AA
  AP --> AA
  AA --> AV
  AA --> PR
```

---

## File inventory

### Views & routing

| File | Role |
|------|------|
| `src/admin/views/VehicleLibraryView.tsx` | Page shell: title, row count, search, table, wires modals, delete confirm. |
| `src/app/(admin)/admin/(protected)/vehicles/page.tsx` | Renders `VehicleLibraryView`. |

### Vehicle library components

| File | Role |
|------|------|
| `src/admin/components/vehicle-library/VehicleLibraryTable.tsx` | Table + footer pagination + **`PageJumpControl`** (editable page when `pages > 1`). |
| `src/admin/components/vehicle-library/VehicleFormModal.tsx` | Add/Edit form, merge-from-vehicle, inventory search, linked products. |
| `src/admin/components/vehicle-library/VehicleCatalogModal.tsx` | Modal listing products for a vehicle (`vehicleId` + search). |

### Constants

| File | Role |
|------|------|
| `src/admin/constants/vehicleBrands.ts` | `VEHICLE_LIBRARY_BRAND_OPTIONS` for the make `<Select>`. |

### API & types

| File | Role |
|------|------|
| `src/lib/api/services/vehicles.ts` | `fetchAdminVehicles`, `fetchAdminVehicle`, `createAdminVehicle`, `updateAdminVehicle`, `deleteAdminVehicle`, `mergeVehicleFitmentsApi`. Uses **`adminApi`**. |
| `src/lib/api/services/adminProducts.ts` | `fetchAdminProducts`, `fetchProductAdmin`, `replaceAdminProductFitments`, `appendVehicleToProductFitments`. |
| `src/lib/api/types.ts` | `AdminVehicleListRow` extends `VehicleDto` with optional **`fitmentCount?`**. |

### Hooks

| File | Role |
|------|------|
| `src/hooks/useAdminVehicles.ts` | Loads list; **`enabled`** + **`params`**; **`refetch`**. No separate access-token argument (auth on `adminApi`). |
| `src/hooks/useDebouncedValue.ts` | Debounced value for search fields and list `q`. |

### Shared UI (reused)

| File | Role |
|------|------|
| `src/shared/ui/search-field.tsx` | Composed search input with optional leading/trailing adornments. |
| `src/shared/ui/modal.tsx` | Accessible dialog (backdrop, **Escape**, focus-friendly container). |
| `src/shared/ui/select.tsx` | Styled `<select>` aligned with `Input`. |
| `src/shared/ui/button.tsx`, `input.tsx`, `label.tsx`, `field-error.tsx` | Form controls inside modals. |

### Exports

| File | Role |
|------|------|
| `src/lib/api/index.ts` | Re-exports vehicle + admin product helpers and `AdminVehicleListRow`. |

---

## UX decisions

1. **Series vs specifics:** Two separate **table** columns; in the modal they remain separate inputs (both required by the API).
2. **20 rows per page** — set in `VehicleLibraryView` (`PAGE_SIZE`).
3. **Merge behavior:** **New vehicle:** selecting a merge source copies fitments **when the user saves** (after `POST` create). **Existing vehicle:** **Merge catalog** runs immediately against the current `vehicleId`.
4. **Light mode / theme:** Admin UI uses semantic Tailwind tokens (`primary`, `secondary`, `background`, etc.) from `globals.css`.

---

## Verification

- `npm run lint`
- Manual: `/admin/vehicles` — search, pagination (including **page jump**), add/edit/delete, catalog badge, merge and linked products against a running API.

---

## Future / follow-ups

- **Phase F10b** (if needed): dedicated backend bulk-fitment mutation to reduce **N** `PUT` fitment calls when linking many SKUs at once.
- **Filter** funnel on the main search bar is visual-only (“coming soon”) until filter params are defined.

---

## Related

- High-level roadmap: **`docs/FRONTEND_PHASES.md`** — § Phase F10.
