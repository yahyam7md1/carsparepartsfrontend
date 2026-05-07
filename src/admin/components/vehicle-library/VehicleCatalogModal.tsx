"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { AdminVehicleListRow } from "@/lib/api/types";
import { fetchAdminProducts } from "@/lib/api/services/adminProducts";
import { isApiError } from "@/lib/api/errors";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Button, FieldError, Input, Label, Modal, SearchField } from "@/shared/ui";

export type VehicleCatalogModalProps = Readonly<{
  open: boolean;
  vehicle: AdminVehicleListRow | null;
  onClose: () => void;
}>;

export function VehicleCatalogModal({ open, vehicle, onClose }: VehicleCatalogModalProps) {
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 300);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<
    Array<{ id: string; sku: string; nameEn: string; brandName: string }>
  >([]);

  const limit = 15;

  const load = useCallback(async () => {
    if (!vehicle) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminProducts({
        vehicleId: vehicle.id,
        page,
        limit,
        ...(debouncedQ.trim() ? { q: debouncedQ.trim() } : {}),
      });
      setRows(
        res.products.map((p) => ({
          id: p.id,
          sku: p.sku,
          nameEn: p.nameEn,
          brandName: p.brandName,
        })),
      );
      setTotal(res.total);
    } catch (e) {
      const message = isApiError(e)
        ? e.message
        : e instanceof Error
          ? e.message
          : "Failed to load catalog";
      setError(message);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [vehicle, page, limit, debouncedQ]);

  useEffect(() => {
    if (!open || !vehicle) return;
    void load();
  }, [open, vehicle, load]);

  useEffect(() => {
    if (!open) return;
    setPage(1);
  }, [open, debouncedQ, vehicle?.id]);

  useEffect(() => {
    if (open) {
      setQ("");
      setError(null);
    }
  }, [open, vehicle?.id]);

  if (!vehicle) return null;

  const title = `Parts catalog — ${vehicle.brand} ${vehicle.chassisCode}`;
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      panelClassName="max-w-2xl"
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <SearchField
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="SKU, name, or brand…"
          leftAdornment={<Search className="size-4" strokeWidth={2} />}
          autoComplete="off"
        />
        {error ? <FieldError>{error}</FieldError> : null}
        <div className="rounded-xl border border-secondary/15 bg-background/50">
          {loading ? (
            <p className="px-4 py-8 text-center text-sm text-secondary">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-secondary">
              No linked products for this vehicle.
            </p>
          ) : (
            <ul className="max-h-[min(50vh,360px)] divide-y divide-secondary/10 overflow-y-auto">
              {rows.map((p) => (
                <li key={p.id} className="px-4 py-3 text-sm">
                  <div className="font-mono text-xs text-secondary">{p.sku}</div>
                  <div className="mt-0.5 font-medium text-foreground">{p.nameEn}</div>
                  <div className="mt-0.5 text-xs text-secondary">{p.brandName}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {total > limit ? (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-secondary">
            <span>
              {total} product{total === 1 ? "" : "s"} linked
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-foreground">
                {page} / {pages}
              </span>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={page >= pages || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-secondary">
            {total} item{total === 1 ? "" : "s"} linked
          </p>
        )}
      </div>
    </Modal>
  );
}
