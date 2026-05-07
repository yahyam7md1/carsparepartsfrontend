"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProductListRow } from "@/lib/api/types";
import {
  deleteAdminProduct,
  fetchProductAdmin,
  patchAdminProductInventory,
  updateAdminProduct,
} from "@/lib/api/services/adminProducts";
import {
  fetchAdminCategoriesFlat,
  type AdminCategoryRow,
} from "@/lib/api/services/adminCategories";
import { isApiError } from "@/lib/api/errors";
import { vehicleFitmentLabel } from "@/admin/utils/vehicleFitmentLabel";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Button, ConfirmModal, FieldError } from "@/shared/ui";
import { formatSar } from "@/shared/utils/formatSar";
import { AddProductModal } from "@/admin/components/inventory/AddProductModal";
import { AdminSimpleListModal } from "@/admin/components/inventory/AdminSimpleListModal";
import { InventoryToolbar } from "@/admin/components/inventory/InventoryToolbar";
import {
  ProductCatalogTable,
  type PriceChangeRequest,
  type StockChangeRequest,
} from "@/admin/components/inventory/ProductCatalogTable";

const PAGE_SIZE = 10;

export function InventoryView() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");

  const [categories, setCategories] = useState<AdminCategoryRow[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setCategoriesError(null);
      try {
        const rows = await fetchAdminCategoriesFlat();
        if (!cancelled) setCategories(rows);
      } catch (e) {
        if (!cancelled) {
          setCategoriesError(
            isApiError(e) ? e.message : e instanceof Error ? e.message : "Categories failed",
          );
        }
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const listParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(debouncedSearch.trim() ? { q: debouncedSearch.trim() } : {}),
      ...(categoryFilter !== "" ? { categoryId: categoryFilter } : {}),
    }),
    [page, debouncedSearch, categoryFilter],
  );

  const { data, loading, error, refetch } = useAdminProducts({ params: listParams });

  const products = data?.products ?? [];
  const total = data?.total ?? 0;

  const handleSearchChange = useCallback((v: string) => {
    setSearch(v);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((id: number | "") => {
    setCategoryFilter(id);
    setPage(1);
  }, []);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState<"add" | "edit">("add");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const openAdd = useCallback(() => {
    setProductModalMode("add");
    setEditingProductId(null);
    setProductModalOpen(true);
  }, []);

  const openEdit = useCallback((row: ProductListRow) => {
    setProductModalMode("edit");
    setEditingProductId(row.id);
    setProductModalOpen(true);
  }, []);

  const [oemModalRow, setOemModalRow] = useState<ProductListRow | null>(null);

  const [fitmentModal, setFitmentModal] = useState<{
    row: ProductListRow;
    lines: string[];
  } | null>(null);
  const [fitmentError, setFitmentError] = useState<string | null>(null);
  const [fitmentLoading, setFitmentLoading] = useState(false);

  const openFitments = useCallback(async (row: ProductListRow) => {
    setFitmentError(null);
    setFitmentLoading(true);
    try {
      const p = await fetchProductAdmin(row.id);
      const lines = p.fitments.map((f) => vehicleFitmentLabel(f.vehicle));
      setFitmentModal({ row, lines });
    } catch (e) {
      setFitmentError(
        isApiError(e) ? e.message : e instanceof Error ? e.message : "Could not load fitments",
      );
    } finally {
      setFitmentLoading(false);
    }
  }, []);

  const [deleteTarget, setDeleteTarget] = useState<ProductListRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const runDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAdminProduct(deleteTarget.id);
      setDeleteTarget(null);
      await refetch();
    } catch (e) {
      setDeleteError(
        isApiError(e) ? e.message : e instanceof Error ? e.message : "Delete failed",
      );
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, refetch]);

  const [pricePending, setPricePending] = useState<PriceChangeRequest | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [priceSaving, setPriceSaving] = useState(false);

  const [stockPending, setStockPending] = useState<StockChangeRequest | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);
  const [stockSaving, setStockSaving] = useState(false);

  const applyPrice = useCallback(async () => {
    if (!pricePending) return;
    setPriceSaving(true);
    setPriceError(null);
    try {
      await updateAdminProduct(pricePending.productId, { price: pricePending.next });
      setPricePending(null);
      await refetch();
    } catch (e) {
      setPriceError(
        isApiError(e) ? e.message : e instanceof Error ? e.message : "Update failed",
      );
    } finally {
      setPriceSaving(false);
    }
  }, [pricePending, refetch]);

  const applyStock = useCallback(async () => {
    if (!stockPending) return;
    setStockSaving(true);
    setStockError(null);
    try {
      await patchAdminProductInventory(stockPending.productId, stockPending.next);
      setStockPending(null);
      await refetch();
    } catch (e) {
      setStockError(
        isApiError(e) ? e.message : e instanceof Error ? e.message : "Update failed",
      );
    } finally {
      setStockSaving(false);
    }
  }, [stockPending, refetch]);

  const handleToggleActive = useCallback(
    async (row: ProductListRow, active: boolean) => {
      try {
        await updateAdminProduct(row.id, { isActive: active });
        await refetch();
      } catch {
        /* non-blocking */
        void refetch();
      }
    },
    [refetch],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">Inventory</h1>
          <p className="mt-1 max-w-xl text-sm text-secondary">
            Product catalog, pricing, stock, and vehicle fitment.
          </p>
          <p className="mt-2 text-xs text-secondary">
            {loading ? "Loading…" : `${total} ${total === 1 ? "product" : "products"}`}
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          className="shrink-0 gap-2 self-start"
          onClick={openAdd}
        >
          <Plus className="size-4" strokeWidth={2} />
          Add product
        </Button>
      </header>

      {error ? <FieldError>{error.message}</FieldError> : null}
      {categoriesError ? <FieldError>{categoriesError}</FieldError> : null}
      {fitmentError ? <FieldError>{fitmentError}</FieldError> : null}
      {fitmentLoading ? (
        <p className="text-xs text-secondary">Loading compatible vehicles…</p>
      ) : null}

      <InventoryToolbar
        search={search}
        onSearchChange={handleSearchChange}
        categoryId={categoryFilter}
        onCategoryChange={handleCategoryChange}
        categories={categories}
        categoriesLoading={categoriesLoading}
      />

      <ProductCatalogTable
        products={products}
        categories={categories}
        loading={loading}
        total={total}
        page={page}
        limit={PAGE_SIZE}
        onPageChange={setPage}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onOpenFitments={(row) => void openFitments(row)}
        onOpenOem={setOemModalRow}
        onToggleActive={handleToggleActive}
        onRequestPriceChange={setPricePending}
        onRequestStockChange={setStockPending}
      />

      <AddProductModal
        open={productModalOpen}
        mode={productModalMode}
        productId={editingProductId}
        categories={categories}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProductId(null);
        }}
        onSaved={() => void refetch()}
      />

      <AdminSimpleListModal
        open={oemModalRow !== null}
        onClose={() => setOemModalRow(null)}
        title={oemModalRow ? `OEM — ${oemModalRow.sku}` : "OEM"}
        subtitle="OEM reference numbers on file for this product."
        lines={
          oemModalRow
            ? [...oemModalRow.oems]
                .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id))
                .map((o) => o.value)
                .filter(Boolean)
            : []
        }
        emptyMessage="No OEM numbers on file."
      />

      <AdminSimpleListModal
        open={fitmentModal !== null}
        onClose={() => setFitmentModal(null)}
        title={fitmentModal ? `Compatible vehicles — ${fitmentModal.row.sku}` : "Fitment"}
        subtitle="Vehicles this part is linked to."
        lines={fitmentModal?.lines ?? []}
        emptyMessage="No vehicles linked."
      />

      <ConfirmModal
        open={pricePending !== null}
        onClose={() => {
          setPricePending(null);
          setPriceError(null);
        }}
        title="Update price?"
        loading={priceSaving}
        confirmLabel="Update price"
        onConfirm={() => void applyPrice()}
      >
        {pricePending ? (
          <div className="space-y-2">
            <p>
              Change price for <strong className="text-foreground">{pricePending.sku}</strong> from{" "}
              <strong className="text-foreground">{formatSar(pricePending.previous)}</strong> to{" "}
              <strong className="text-foreground">{formatSar(pricePending.next)}</strong>?
            </p>
            {priceError ? <FieldError>{priceError}</FieldError> : null}
          </div>
        ) : null}
      </ConfirmModal>

      <ConfirmModal
        open={stockPending !== null}
        onClose={() => {
          setStockPending(null);
          setStockError(null);
        }}
        title="Update stock?"
        loading={stockSaving}
        confirmLabel="Update stock"
        onConfirm={() => void applyStock()}
      >
        {stockPending ? (
          <div className="space-y-2">
            <p>
              Change stock for <strong className="text-foreground">{stockPending.sku}</strong> from{" "}
              <strong className="text-foreground">{stockPending.previous}</strong> to{" "}
              <strong className="text-foreground">{stockPending.next}</strong>?
            </p>
            {stockError ? <FieldError>{stockError}</FieldError> : null}
          </div>
        ) : null}
      </ConfirmModal>

      <ConfirmModal
        open={deleteTarget !== null}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        title="Delete product?"
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={() => void runDelete()}
      >
        {deleteTarget ? (
          <div className="space-y-2">
            <p>
              This will permanently remove{" "}
              <strong className="text-foreground">{deleteTarget.sku}</strong> from the catalog.
            </p>
            {deleteError ? <FieldError>{deleteError}</FieldError> : null}
          </div>
        ) : null}
      </ConfirmModal>
    </div>
  );
}
