"use client";

import { Pencil } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { isApiError } from "@/lib/api/errors";
import { patchAdminProductInventory } from "@/lib/api/services/adminProducts";
import { ignoreAdminLowStockRow } from "@/lib/api/services/adminStats";
import type { AdminLowStockRow } from "@/lib/api/types";
import { Button, ConfirmModal, FieldError, Input } from "@/shared/ui";

type StockChangeRequest = {
  productId: string;
  sku: string;
  previous: number;
  next: number;
};

type Props = Readonly<{
  rows: AdminLowStockRow[];
  loading: boolean;
  error: string | null;
  onChanged: () => Promise<void> | void;
}>;

function movementLabel(row: AdminLowStockRow): string {
  if (row.movementClass === "slow") return "slow-moving";
  if (row.movementClass === "medium") return "medium-moving";
  return "fast-moving";
}

export function LowStockAlertCard({ rows, loading, error, onChanged }: Props) {
  const [stockEditId, setStockEditId] = useState<string | null>(null);
  const [stockDraft, setStockDraft] = useState("");
  const [stockPending, setStockPending] = useState<StockChangeRequest | null>(null);
  const [stockSaving, setStockSaving] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  const [ignorePending, setIgnorePending] = useState<AdminLowStockRow | null>(null);
  const [ignoreSaving, setIgnoreSaving] = useState(false);
  const [ignoreError, setIgnoreError] = useState<string | null>(null);

  const beginStockEdit = useCallback((row: AdminLowStockRow) => {
    setStockEditId(row.id);
    setStockDraft(String(row.stockQuantity));
  }, []);

  const commitStock = useCallback(
    (row: AdminLowStockRow) => {
      const next = Number.parseInt(stockDraft.trim(), 10);
      if (!Number.isFinite(next) || next < 0) {
        setStockEditId(null);
        return;
      }
      if (next !== row.stockQuantity) {
        setStockPending({
          productId: row.id,
          sku: row.sku,
          previous: row.stockQuantity,
          next,
        });
      }
      setStockEditId(null);
    },
    [stockDraft],
  );

  const applyStock = useCallback(async () => {
    if (!stockPending) return;
    setStockSaving(true);
    setStockError(null);
    try {
      await patchAdminProductInventory(stockPending.productId, stockPending.next);
      setStockPending(null);
      await onChanged();
    } catch (e) {
      setStockError(isApiError(e) ? e.message : e instanceof Error ? e.message : "Update failed");
    } finally {
      setStockSaving(false);
    }
  }, [onChanged, stockPending]);

  const applyIgnore = useCallback(async () => {
    if (!ignorePending) return;
    setIgnoreSaving(true);
    setIgnoreError(null);
    try {
      await ignoreAdminLowStockRow(ignorePending.id);
      setIgnorePending(null);
      await onChanged();
    } catch (e) {
      setIgnoreError(isApiError(e) ? e.message : e instanceof Error ? e.message : "Ignore failed");
    } finally {
      setIgnoreSaving(false);
    }
  }, [ignorePending, onChanged]);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => a.stockQuantity - b.stockQuantity || a.sku.localeCompare(b.sku)),
    [rows],
  );

  return (
    <section className="rounded-2xl border border-secondary/20 bg-white p-4 shadow-[0_6px_14px_rgba(15,23,42,0.08)]">
      <header className="mb-2 border-b border-secondary/10 pb-3">
        <div className="flex items-start gap-3">
          <span className="mt-1 h-10 w-1 rounded-full bg-accent" aria-hidden />
          <div>
            <h3 className="text-lg font-bold leading-tight text-primary">Low Stock Items</h3>
            <p className="mt-1 text-sm text-secondary">
              Items with stock below threshold are highlighted, edit stock directly to update.
            </p>
          </div>
        </div>
      </header>

      {error ? <FieldError>{error}</FieldError> : null}
      {loading ? <p className="py-8 text-center text-sm text-secondary">Loading low stock items…</p> : null}
      {!loading && sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-secondary">No low-stock alerts right now.</p>
      ) : null}

      {!loading && sorted.length > 0 ? (
        <ul className="group divide-y divide-secondary/10">
          {sorted.map((row) => (
            <li key={row.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-2">
              <div className="min-w-0">
                <p className="text-[11px] text-secondary tabular-nums">
                  {row.sku} · {movementLabel(row)}
                </p>
                <p className="truncate text-base font-semibold text-foreground">{row.nameEn}</p>
              </div>
              <div className="flex items-center gap-1">
                {stockEditId === row.id ? (
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    className="h-8 !w-[5rem] max-w-[5rem] shrink-0 px-2 py-1 text-xs tabular-nums"
                    value={stockDraft}
                    onChange={(e) => setStockDraft(e.target.value)}
                    onBlur={() => commitStock(row)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitStock(row);
                      }
                      if (e.key === "Escape") setStockEditId(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    className="inline-flex min-w-[2.2rem] items-center justify-center rounded-md border border-secondary/20 bg-background px-2 py-0.5 text-base font-semibold tabular-nums text-foreground hover:bg-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                    aria-label={`Edit stock for ${row.sku}`}
                    onClick={() => beginStockEdit(row)}
                  >
                    {row.stockQuantity}
                  </button>
                )}
                <button
                  type="button"
                  className="rounded p-1 text-secondary opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary"
                  aria-label={`Edit stock for ${row.sku}`}
                  onClick={() => beginStockEdit(row)}
                >
                  <Pencil className="size-3.5" strokeWidth={2} />
                </button>
              </div>
              <div className="flex items-center justify-end">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIgnorePending(row)}>
                  Ignore
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

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
        open={ignorePending !== null}
        onClose={() => {
          setIgnorePending(null);
          setIgnoreError(null);
        }}
        title="Ignore low stock alert?"
        loading={ignoreSaving}
        confirmLabel="Ignore alert"
        onConfirm={() => void applyIgnore()}
      >
        {ignorePending ? (
          <div className="space-y-2">
            <p>
              Ignore low-stock alert for <strong className="text-foreground">{ignorePending.sku}</strong>?
              It will be hidden from this card and count until stock is updated.
            </p>
            {ignoreError ? <FieldError>{ignoreError}</FieldError> : null}
          </div>
        ) : null}
      </ConfirmModal>
    </section>
  );
}
