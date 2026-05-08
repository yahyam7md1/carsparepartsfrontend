# Phase F12 — Admin: Dashboard & polish

This document describes the implemented **Admin Dashboard** frontend work: KPI stat cards, low-stock alert card with inline stock edit and ignore flow, and recently added products table card. It also records the backend contracts this UI depends on and the current UX decisions.

**Route:** `GET /admin/dashboard` — `src/app/(admin)/admin/(protected)/dashboard/page.tsx`.

---

## Goals

| Area | Behavior |
|------|----------|
| **Stat cards** | Top-row KPI cards for **Total Products**, **Out of Stock**, **Low Stock Alert**, **Featured Items**, wired to `GET /api/admin/stats`. |
| **Low stock card** | Dedicated dashboard card listing low-stock rows from `GET /api/admin/stats/low-stock` with **inline stock edit**, **confirmation modal**, and **Ignore** action. |
| **Ignore semantics** | Ignore is permanent (`lowStockIgnored=true`) via `PATCH /api/admin/stats/low-stock/:id/ignore`; ignored rows disappear from list and from stats count. |
| **Auto-clear ignore** | Any stock update clears ignore state server-side, so rows can reappear if still below threshold. |
| **Recent products card** | “Recently Added Products” card showing top recent admin products (`GET /api/admin/products?page=1&limit=5`) with SKU, name, and category breadcrumb. |
| **Layout** | Dashboard top KPI grid + two-column content section below (low-stock card + recent products card). |

---

## Backend contract (reference)

### Dashboard stats

| Method | Path | Role |
|--------|------|------|
| `GET` | `/api/admin/stats` | Returns `{ totalProducts, outOfStockCount, lowStockCount, featuredProductCount }`. |

### Low-stock rows + ignore

| Method | Path | Role |
|--------|------|------|
| `GET` | `/api/admin/stats/low-stock` | Query: `page`, `limit`, optional `q`; response: `{ rows, total, page, limit }`. |
| `PATCH` | `/api/admin/stats/low-stock/:id/ignore` | Marks a currently low-stock product as ignored (`lowStockIgnored=true`). |
| `PATCH` | `/api/admin/products/:id/inventory` | Updates stock and auto-clears ignore state (`lowStockIgnored=false`) on backend write path. |

### Recent products source

| Method | Path | Role |
|--------|------|------|
| `GET` | `/api/admin/products` | Used with `page=1&limit=5` (backend default ordering already favors newest first in admin list). |

---

## Architecture (data flow)

```mermaid
flowchart LR
  subgraph dashboard [Dashboard UI]
    ADV[AdminDashboardView]
    SC[StatCard]
    LSC[LowStockAlertCard]
    RPC[RecentlyAddedProductsCard]
  end
  subgraph hooks [Hooks]
    UAS[useAdminStats]
    UAL[useAdminLowStockRows]
    UAP[useAdminProducts]
  end
  subgraph api [API services]
    AS[adminStats.ts]
    AP[adminProducts.ts]
    AA[adminApi]
  end
  subgraph backend [Backend]
    ST[/api/admin/stats]
    LS[/api/admin/stats/low-stock]
    IG[/api/admin/stats/low-stock/:id/ignore]
    IV[/api/admin/products/:id/inventory]
    PR[/api/admin/products]
  end

  ADV --> SC
  ADV --> LSC
  ADV --> RPC
  ADV --> UAS
  ADV --> UAL
  ADV --> UAP

  UAS --> AS
  UAL --> AS
  UAP --> AP
  LSC --> AP
  LSC --> AS

  AS --> AA
  AP --> AA

  AA --> ST
  AA --> LS
  AA --> IG
  AA --> IV
  AA --> PR
```

---

## File inventory

### Views & routing

| File | Role |
|------|------|
| `src/admin/views/AdminDashboardView.tsx` | Dashboard composition: KPI cards, low-stock card, recently-added products card, and coordinated refetch after row actions. |
| `src/app/(admin)/admin/(protected)/dashboard/page.tsx` | Renders `AdminDashboardView`. |

### Dashboard components

| File | Role |
|------|------|
| `src/admin/components/dashboard/StatCard.tsx` | Reusable KPI card UI (icon tile, value, label, loading state). |
| `src/admin/components/dashboard/LowStockAlertCard.tsx` | Low-stock list, inline stock editing, confirm modal, ignore action modal. |
| `src/admin/components/dashboard/RecentlyAddedProductsCard.tsx` | Recent products table card with accent header and category breadcrumb display. |

### Hooks

| File | Role |
|------|------|
| `src/hooks/useAdminStats.ts` | Loads top KPI stats from `/api/admin/stats`. |
| `src/hooks/useAdminLowStockRows.ts` | Loads low-stock rows list from `/api/admin/stats/low-stock`. |
| `src/hooks/useAdminProducts.ts` | Reused to source recent products (`page=1`, `limit=5`). |
| `src/hooks/index.ts` | Re-exports dashboard hooks for concise imports. |

### API & types

| File | Role |
|------|------|
| `src/lib/api/services/adminStats.ts` | `fetchAdminStats`, `fetchAdminLowStockRows`, `ignoreAdminLowStockRow`. |
| `src/lib/api/services/adminProducts.ts` | Reused `patchAdminProductInventory` for low-stock inline stock updates. |
| `src/lib/api/types.ts` | Adds `AdminStats`, `AdminLowStockRow`, `AdminLowStockRowsResponse`. |

### Utilities

| File | Role |
|------|------|
| `src/admin/utils/categoryBreadcrumb.ts` | Breadcrumb rendering in recently added products category column. |
| `src/lib/api/services/adminCategories.ts` | Flat categories for breadcrumb resolution inside recent products card. |

---

## UX decisions

1. **KPI card styling** uses strong visual parity with admin design: rounded shell, subtle border/shadow, icon tile with border and localized spacing.
2. **Low-stock row density** is compact and supports quick in-place stock correction.
3. **Movement class context** is shown inline with SKU (`SKU · fast-moving`) to reduce vertical space.
4. **Ignore confirmation** is explicit (confirmation modal) to avoid accidental hiding of critical alerts.
5. **Two-column dashboard content** keeps low-stock card from spanning full width and reserves space for additional modules.
6. **Recent products table style** removes heavy outer table borders; keeps clean row separators and a subtle header/data separator line.

---

## Verification

- `npm run lint` on frontend (dashboard changes introduce no lint errors; unrelated pre-existing warnings may remain in vehicle components).
- Manual checks:
  - Dashboard stats render and refresh.
  - Low-stock rows load, ignore removes row and decrements KPI.
  - Stock edit confirms, updates, and triggers refresh.
  - Recently added products card renders latest rows and category breadcrumb path.

---

## Known limitations / follow-ups

1. **Recently added products order** currently depends on existing admin products ordering behavior.
2. **Recently added vehicles card** intentionally deferred.
3. Optional enhancement: extract a shared “dashboard table card shell” for low-stock and recent-products cards to reduce styling duplication.

---

## Related

- Roadmap: `docs/FRONTEND_PHASES.md` — § Phase F12.
- Inventory implementation: `docs/phase-f11.md` (shared stock update flow and confirm modal patterns).
- Vehicles implementation: `docs/phase-f10.md` (shared admin table/modal patterns).
