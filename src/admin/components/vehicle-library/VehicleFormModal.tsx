"use client";

import { Copy, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminVehicleListRow } from "@/lib/api/types";
import { VEHICLE_LIBRARY_BRAND_OPTIONS } from "@/admin/constants/vehicleBrands";
import {
  appendVehicleToProductFitments,
  fetchAdminProducts,
  fetchProductAdmin,
  replaceAdminProductFitments,
} from "@/lib/api/services/adminProducts";
import {
  createAdminVehicle,
  mergeVehicleFitmentsApi,
  updateAdminVehicle,
} from "@/lib/api/services/vehicles";
import { isApiError } from "@/lib/api/errors";
import { useAdminVehicles } from "@/hooks/useAdminVehicles";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  Button,
  FieldError,
  Input,
  Label,
  Modal,
  SearchField,
  Select,
} from "@/shared/ui";

type LinkedRow = { id: string; sku: string; nameEn: string; brandName: string };

export type VehicleFormModalProps = Readonly<{
  mode: "add" | "edit";
  vehicle: AdminVehicleListRow | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}>;

export function VehicleFormModal({
  mode,
  vehicle,
  open,
  onClose,
  onSaved,
}: VehicleFormModalProps) {
  const [brand, setBrand] = useState("");
  const [series, setSeries] = useState("");
  const [specifics, setSpecifics] = useState("");
  const [chassisCode, setChassisCode] = useState("");
  const [yearRange, setYearRange] = useState("");

  const [mergeSearch, setMergeSearch] = useState("");
  const debouncedMergeSearch = useDebouncedValue(mergeSearch, 300);
  const [mergeSource, setMergeSource] = useState<AdminVehicleListRow | null>(null);

  const [inventorySearch, setInventorySearch] = useState("");
  const debouncedInventorySearch = useDebouncedValue(inventorySearch, 300);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryHits, setInventoryHits] = useState<LinkedRow[]>([]);

  const [linkedProducts, setLinkedProducts] = useState<LinkedRow[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mergeList = useAdminVehicles({
    enabled: open,
    params: {
      q: debouncedMergeSearch.trim() || undefined,
      limit: 15,
      page: 1,
    },
  });

  const resetForm = useCallback(() => {
    setBrand("");
    setSeries("");
    setSpecifics("");
    setChassisCode("");
    setYearRange("");
    setMergeSearch("");
    setMergeSource(null);
    setInventorySearch("");
    setInventoryHits([]);
    setLinkedProducts([]);
    setError(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (mode === "edit" && vehicle) {
      setBrand(vehicle.brand);
      setSeries(vehicle.series);
      setSpecifics(vehicle.specifics);
      setChassisCode(vehicle.chassisCode);
      setYearRange(vehicle.yearRange);
      setMergeSource(null);
      setMergeSearch("");
      setInventorySearch("");
      setInventoryHits([]);
    } else if (mode === "add") {
      resetForm();
    }
  }, [open, mode, vehicle, resetForm]);

  const brandSelectOptions = useMemo(() => {
    const preset = [...VEHICLE_LIBRARY_BRAND_OPTIONS];
    if (mode === "edit" && vehicle) {
      const current = vehicle.brand.trim();
      if (
        current &&
        !(VEHICLE_LIBRARY_BRAND_OPTIONS as readonly string[]).includes(current)
      ) {
        return [current, ...preset];
      }
    }
    return preset;
  }, [mode, vehicle]);

  useEffect(() => {
    if (!open || mode !== "edit" || !vehicle) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetchAdminProducts({
          vehicleId: vehicle.id,
          limit: 200,
          page: 1,
        });
        if (cancelled) return;
        setLinkedProducts(
          res.products.map((p) => ({
            id: p.id,
            sku: p.sku,
            nameEn: p.nameEn,
            brandName: p.brandName,
          })),
        );
      } catch {
        if (!cancelled) setLinkedProducts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, mode, vehicle?.id]);

  useEffect(() => {
    if (!open) return;
    const q = debouncedInventorySearch.trim();
    if (q.length < 1) {
      setInventoryHits([]);
      return;
    }
    let cancelled = false;
    setInventoryLoading(true);
    void (async () => {
      try {
        const res = await fetchAdminProducts({ q, limit: 12, page: 1 });
        if (cancelled) return;
        setInventoryHits(
          res.products.map((p) => ({
            id: p.id,
            sku: p.sku,
            nameEn: p.nameEn,
            brandName: p.brandName,
          })),
        );
      } catch {
        if (!cancelled) setInventoryHits([]);
      } finally {
        if (!cancelled) setInventoryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, debouncedInventorySearch]);

  const addLinked = useCallback((row: LinkedRow) => {
    setLinkedProducts((prev) =>
      prev.some((p) => p.id === row.id) ? prev : [...prev, row],
    );
  }, []);

  const removeLinked = useCallback(
    async (productId: string) => {
      if (mode === "edit" && vehicle) {
        try {
          const product = await fetchProductAdmin(productId);
          const newIds = product.fitments
            .map((f) => f.vehicleId)
            .filter((vid) => vid !== vehicle.id);
          await replaceAdminProductFitments(productId, newIds);
          onSaved();
        } catch (e) {
          const message = isApiError(e)
            ? e.message
            : e instanceof Error
              ? e.message
              : "Could not unlink product";
          setError(message);
          return;
        }
      }
      setLinkedProducts((prev) => prev.filter((p) => p.id !== productId));
    },
    [mode, vehicle, onSaved],
  );

  const runImmediateMerge = useCallback(async () => {
    if (mode !== "edit" || !vehicle || !mergeSource) return;
    if (mergeSource.id === vehicle.id) {
      setError("Pick a different vehicle as the source.");
      return;
    }
    setMerging(true);
    setError(null);
    try {
      await mergeVehicleFitmentsApi({
        sourceVehicleId: mergeSource.id,
        targetVehicleId: vehicle.id,
      });
      setMergeSource(null);
      onSaved();
    } catch (e) {
      const message = isApiError(e)
        ? e.message
        : e instanceof Error
          ? e.message
          : "Merge failed";
      setError(message);
    } finally {
      setMerging(false);
    }
  }, [mode, vehicle, mergeSource, onSaved]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    const b = brand.trim();
    const s = series.trim();
    const sp = specifics.trim();
    const c = chassisCode.trim();
    const y = yearRange.trim();
    if (!b || !s || !sp || !c || !y) {
      setError("Select a make and fill series, specifics, chassis, and year range.");
      return;
    }
    setSubmitting(true);
    try {
      let vehicleId: number;
      if (mode === "add") {
        const created = await createAdminVehicle({
          brand: b,
          series: s,
          specifics: sp,
          chassisCode: c,
          yearRange: y,
        });
        vehicleId = created.id;
        if (
          mergeSource &&
          mergeSource.id !== vehicleId
        ) {
          await mergeVehicleFitmentsApi({
            sourceVehicleId: mergeSource.id,
            targetVehicleId: vehicleId,
          });
        }
      } else {
        if (!vehicle) return;
        await updateAdminVehicle(vehicle.id, {
          brand: b,
          series: s,
          specifics: sp,
          chassisCode: c,
          yearRange: y,
        });
        vehicleId = vehicle.id;
      }

      for (const p of linkedProducts) {
        await appendVehicleToProductFitments(p.id, vehicleId);
      }

      onSaved();
      onClose();
      resetForm();
    } catch (e) {
      const message = isApiError(e)
        ? e.message
        : e instanceof Error
          ? e.message
          : "Save failed";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [
    brand,
    series,
    specifics,
    chassisCode,
    yearRange,
    mode,
    vehicle,
    mergeSource,
    linkedProducts,
    onSaved,
    onClose,
    resetForm,
  ]);

  const mergeCandidates =
    mergeList.data?.vehicles.filter(
      (v) => !vehicle || v.id !== vehicle.id,
    ) ?? [];

  const canMergeNow =
    mode === "edit" &&
    Boolean(vehicle && mergeSource && mergeSource.id !== vehicle.id);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "add" ? "Add vehicle" : "Edit vehicle"}
      panelClassName="max-w-2xl"
      footer={
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="primary"
            disabled={submitting}
            className="gap-2"
            onClick={() => void handleSubmit()}
          >
            <Plus className="size-4" strokeWidth={2} />
            {mode === "add" ? "Add vehicle" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {error ? <FieldError>{error}</FieldError> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Make">
            <Select
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              <option value="">Select make</option>
              {brandSelectOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Series">
            <Input
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              placeholder="e.g. 3 Series"
              autoComplete="off"
            />
          </Field>
          <Field label="Specifics">
            <Input
              value={specifics}
              onChange={(e) => setSpecifics(e.target.value)}
              placeholder="e.g. 330i"
              autoComplete="off"
            />
          </Field>
          <Field label="Chassis code">
            <Input
              value={chassisCode}
              onChange={(e) => setChassisCode(e.target.value)}
              placeholder="F30 · W205 · 5G"
              autoComplete="off"
            />
          </Field>
          <Field label="Year range" className="sm:col-span-2">
            <Input
              value={yearRange}
              onChange={(e) => setYearRange(e.target.value)}
              placeholder="2012–2019"
              autoComplete="off"
            />
          </Field>
        </div>

        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-primary">
              Products that fit this vehicle
            </h3>
            <p className="mt-1 text-xs text-secondary">
              Search inventory and add SKUs. Shown in the parts catalog for this chassis.
            </p>
          </div>

          <div className="rounded-xl border border-secondary/15 bg-background/40 p-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-primary">
              Copy fitment from another vehicle
            </p>
            <p className="mt-1 text-xs text-secondary">
              Import every product linked to a chassis you already maintain. Existing SKUs in
              this list are skipped.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start">
              <SearchField
                value={mergeSearch}
                onChange={(e) => setMergeSearch(e.target.value)}
                placeholder="Type to filter by brand, series, or chassis…"
                leftAdornment={<Search className="size-4" strokeWidth={2} />}
                className="min-w-0 flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="shrink-0 gap-1.5"
                disabled={!canMergeNow || merging}
                onClick={() => void runImmediateMerge()}
              >
                <Copy className="size-3.5" strokeWidth={2} />
                Merge catalog
              </Button>
            </div>
            {mergeSource ? (
              <p className="mt-2 text-xs text-foreground">
                Source:{" "}
                <strong>
                  {mergeSource.brand} {mergeSource.chassisCode}
                </strong>{" "}
                ({mergeSource.fitmentCount ?? 0} items)
              </p>
            ) : (
              <p className="mt-2 text-xs text-secondary">
                {mode === "add"
                  ? "Select a source below; fitments copy when you save the new vehicle."
                  : "Select a source, then click Merge catalog to copy immediately."}
              </p>
            )}
            <ul className="mt-2 max-h-36 overflow-y-auto rounded-lg border border-secondary/10 bg-white">
              {mergeList.loading ? (
                <li className="px-3 py-3 text-xs text-secondary">Loading…</li>
              ) : mergeCandidates.length === 0 ? (
                <li className="px-3 py-3 text-xs text-secondary">No vehicles found.</li>
              ) : (
                mergeCandidates.map((v) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => setMergeSource(v)}
                      className={`flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-xs transition-colors hover:bg-primary/5 ${
                        mergeSource?.id === v.id ? "bg-accent/10" : ""
                      }`}
                    >
                      <span className="font-medium text-foreground">
                        {v.brand} · {v.chassisCode}
                      </span>
                      <span className="text-secondary">
                        {v.series} · {v.specifics} · {v.fitmentCount ?? 0} items
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-primary">
              Add from inventory
            </p>
            <SearchField
              value={inventorySearch}
              onChange={(e) => setInventorySearch(e.target.value)}
              placeholder="SKU, name, or brand…"
              leftAdornment={<Search className="size-4" strokeWidth={2} />}
              className="mt-2"
            />
            <ul className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-secondary/10 bg-white">
              {inventoryLoading ? (
                <li className="px-3 py-3 text-xs text-secondary">Searching…</li>
              ) : debouncedInventorySearch.trim().length < 1 ? (
                <li className="px-3 py-3 text-xs text-secondary">
                  Type at least one character to search.
                </li>
              ) : inventoryHits.length === 0 ? (
                <li className="px-3 py-3 text-xs text-secondary">No products found.</li>
              ) : (
                inventoryHits.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => addLinked(p)}
                      className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-xs transition-colors hover:bg-primary/5"
                    >
                      <span className="font-mono text-secondary">{p.sku}</span>
                      <span className="font-medium text-foreground">{p.nameEn}</span>
                      <span className="text-secondary">{p.brandName}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-primary">
              Linked products ({linkedProducts.length})
            </p>
            {linkedProducts.length === 0 ? (
              <div className="mt-2 rounded-xl border border-dashed border-secondary/30 bg-background/50 px-4 py-8 text-center text-sm text-secondary">
                None yet — add from inventory above.
              </div>
            ) : (
              <ul className="mt-2 divide-y divide-secondary/10 rounded-xl border border-secondary/15 bg-white">
                {linkedProducts.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-xs"
                  >
                    <div>
                      <div className="font-mono text-secondary">{p.sku}</div>
                      <div className="font-medium text-foreground">{p.nameEn}</div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-red-700"
                      onClick={() => void removeLinked(p.id)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
}

function Field({
  label,
  optional,
  className,
  children,
}: Readonly<{
  label: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}>) {
  return (
    <div className={className}>
      <Label className="text-[0.65rem] font-semibold uppercase tracking-wide text-primary">
        {label}
        {optional ? <span className="ms-1 font-normal normal-case text-secondary">(optional)</span> : null}
      </Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
