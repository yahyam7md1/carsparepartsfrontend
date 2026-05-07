"use client";

import { ChevronDown, Expand, ImageIcon, Plus, Search, Trash2, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  ProductDetail,
  AdminVehicleListRow,
  ProductImagePreview,
  ProductOemRow,
} from "@/lib/api/types";
import type { AdminCategoryRow } from "@/lib/api/services/adminCategories";
import {
  createAdminProduct,
  deleteAdminProductImage,
  fetchProductAdmin,
  replaceAdminProductFitments,
  updateAdminProduct,
  uploadAdminProductImage,
} from "@/lib/api/services/adminProducts";
import { isApiError } from "@/lib/api/errors";
import { vehicleFitmentLabel } from "@/admin/utils/vehicleFitmentLabel";
import { useAdminVehicles } from "@/hooks/useAdminVehicles";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  Button,
  FieldError,
  Input,
  Label,
  SearchField,
  Select,
  WideModal,
} from "@/shared/ui";
import clsx from "clsx";

/** Bordered panel — tight padding to match compact admin mocks. */
const SECTION_CARD =
  "rounded-lg border border-secondary/20 bg-white p-3 shadow-sm ring-1 ring-primary/[0.05] sm:p-3.5";

/** Single-line text/number inputs — fixed height is OK. */
const INPUT_CONTROL = "h-9 min-h-9 py-1.5 text-xs leading-snug";

/** Number fields without spinners — same height/visual weight as other compact inputs. */
const NUMBER_NO_SPINNER =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

/**
 * Native &lt;select&gt; needs extra vertical room; `h-8`+tight padding clips text on Windows.
 */
const SELECT_CONTROL =
  "h-auto min-h-9 py-1.5 pe-9 text-xs leading-normal [line-height:1.35rem]";

/** Bilingual descriptions: grow to fill space below name row (paired column is stretch-aligned). */
const BILINGUAL_DESC_TEXTAREA =
  "w-full min-h-[4.5rem] flex-1 resize-none rounded-lg border border-secondary/25 bg-background px-2.5 py-2 text-xs leading-snug text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/35";

const OEM_LIST_TEXTAREA =
  "w-full min-h-[4rem] resize-y rounded-lg border border-secondary/25 bg-background px-2.5 py-2 text-xs leading-snug text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/35";

/** Vehicle combobox shell — no outer shadow; avoids stacked box with inner input. */
const SEARCH_COMBO_CLASS =
  "min-h-9 rounded-lg shadow-none focus-within:shadow-none";

const SEARCH_INPUT_CLASS =
  "min-h-8 py-1 text-xs leading-snug focus-visible:!ring-0";

/** Default part brand when the admin form no longer collects it (vehicle fitment covers car make). */
const DEFAULT_PART_BRAND = "Aftermarket";

type Props = Readonly<{
  open: boolean;
  mode: "add" | "edit";
  productId: string | null;
  categories: AdminCategoryRow[];
  onClose: () => void;
  onSaved: () => void;
}>;

/** Same ordering as list/detail: main first, then sortOrder, then id. */
function sortProductImages(images: ProductImagePreview[]): ProductImagePreview[] {
  return [...images].sort((a, b) => {
    if (a.isMain !== b.isMain) return a.isMain ? -1 : 1;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.id.localeCompare(b.id);
  });
}

/** Trim, max 200 chars, de-dupe case-insensitively — mirrors backend normalizeOemValues. */
function parseOemListFromText(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[\n,]+/)) {
    const v = part.trim().slice(0, 200);
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

function formatOemsForForm(oems: ProductOemRow[]): string {
  return [...oems]
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id))
    .map((o) => o.value)
    .join("\n");
}

function stockAlertsOrdered(
  fast: number | null,
  medium: number | null,
  slow: number | null,
): boolean {
  if (fast != null && medium != null && fast > medium) return false;
  if (medium != null && slow != null && medium > slow) return false;
  if (fast != null && slow != null && fast > slow) return false;
  return true;
}

function parseOptionalThreshold(raw: string): number | null | "invalid" {
  const t = raw.trim();
  if (!t) return null;
  const n = Number.parseInt(t, 10);
  if (!Number.isFinite(n) || n < 0) return "invalid";
  return n;
}

function applyProductToForm(
  p: ProductDetail,
  setters: {
    setSku: (v: string) => void;
    setOemLines: (v: string) => void;
    setStockAlertFast: (v: string) => void;
    setStockAlertMedium: (v: string) => void;
    setStockAlertSlow: (v: string) => void;
    setReservedPartBrand: (v: string) => void;
    setCategoryId: (v: string) => void;
    setPrice: (v: string) => void;
    setStock: (v: string) => void;
    setNameEn: (v: string) => void;
    setNameAr: (v: string) => void;
    setDescEn: (v: string) => void;
    setDescAr: (v: string) => void;
    setVehicleIds: (v: number[]) => void;
    setVehicleLabels: (v: Record<number, string>) => void;
  },
) {
  setters.setSku(p.sku);
  setters.setOemLines(formatOemsForForm(p.oems ?? []));
  setters.setStockAlertFast(
    p.stockAlertThresholdFast != null ? String(p.stockAlertThresholdFast) : "",
  );
  setters.setStockAlertMedium(
    p.stockAlertThresholdMedium != null ? String(p.stockAlertThresholdMedium) : "",
  );
  setters.setStockAlertSlow(
    p.stockAlertThresholdSlow != null ? String(p.stockAlertThresholdSlow) : "",
  );
  setters.setReservedPartBrand(p.brandName?.trim() ? p.brandName : DEFAULT_PART_BRAND);
  setters.setCategoryId(String(p.categoryId));
  setters.setPrice(p.price);
  setters.setStock(String(p.stockQuantity));
  setters.setNameEn(p.nameEn ?? "");
  setters.setNameAr(p.nameAr ?? "");
  setters.setDescEn(p.descEn ?? "");
  setters.setDescAr(p.descAr ?? "");
  setters.setVehicleIds(p.fitments.map((f) => f.vehicleId));
  const labels: Record<number, string> = {};
  for (const f of p.fitments) {
    labels[f.vehicleId] = vehicleFitmentLabel(f.vehicle);
  }
  setters.setVehicleLabels(labels);
}

function renderVehicleDropdownRows(
  loading: boolean,
  vehicles: AdminVehicleListRow[],
  onPick: (v: AdminVehicleListRow) => void,
): ReactNode {
  if (loading) {
    return <li className="px-2.5 py-2 text-xs text-secondary">Loading…</li>;
  }
  if (vehicles.length === 0) {
    return <li className="px-2.5 py-2 text-xs text-secondary">No vehicles found.</li>;
  }
  return vehicles.map((v) => (
    <li key={v.id}>
      <button
        type="button"
        className="flex w-full flex-col items-start px-2.5 py-1.5 text-left text-xs hover:bg-primary/5"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onPick(v)}
      >
        <span className="font-medium text-foreground">{vehicleFitmentLabel(v)}</span>
        <span className="text-secondary">
          {v.series} · {v.specifics}
        </span>
      </button>
    </li>
  ));
}

export function AddProductModal({
  open,
  mode,
  productId,
  categories,
  onClose,
  onSaved,
}: Props) {
  const fitmentComboId = useId();
  const comboWrapRef = useRef<HTMLDivElement>(null);

  const [sku, setSku] = useState("");
  const [oemLines, setOemLines] = useState("");
  const [stockAlertFast, setStockAlertFast] = useState("");
  const [stockAlertMedium, setStockAlertMedium] = useState("");
  const [stockAlertSlow, setStockAlertSlow] = useState("");
  /** Persisted product `brandName` from API on edit; default for new rows (not shown in UI). */
  const [reservedPartBrand, setReservedPartBrand] = useState(DEFAULT_PART_BRAND);
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");

  const [vehicleSearch, setVehicleSearch] = useState("");
  const [fitmentComboOpen, setFitmentComboOpen] = useState(false);
  const vehQ = useDebouncedValue(vehicleSearch, 300);
  const vehicleList = useAdminVehicles({
    enabled: open,
    params: { q: vehQ.trim() || undefined, limit: 15, page: 1 },
  });
  const [vehicleIds, setVehicleIds] = useState<number[]>([]);
  const [vehicleLabels, setVehicleLabels] = useState<Record<number, string>>({});

  const [files, setFiles] = useState<File[]>([]);
  /** Persisted images (edit mode); updated after loads, deletes, and each upload. */
  const [existingImages, setExistingImages] = useState<ProductImagePreview[]>([]);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const vehicles = vehicleList.data?.vehicles ?? [];

  const imagePreviewUrls = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );

  useEffect(() => {
    const urls = imagePreviewUrls;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  useEffect(() => {
    if (!open) setLightboxSrc(null);
  }, [open]);

  useEffect(() => {
    if (!lightboxSrc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxSrc(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxSrc]);

  const reset = useCallback(() => {
    setSku("");
    setOemLines("");
    setStockAlertFast("");
    setStockAlertMedium("");
    setStockAlertSlow("");
    setReservedPartBrand(DEFAULT_PART_BRAND);
    setCategoryId("");
    setPrice("");
    setStock("0");
    setNameEn("");
    setNameAr("");
    setDescEn("");
    setDescAr("");
    setVehicleSearch("");
    setFitmentComboOpen(false);
    setVehicleIds([]);
    setVehicleLabels({});
    setFiles([]);
    setExistingImages([]);
    setDeletingImageId(null);
    setLightboxSrc(null);
    setError(null);
    setLoadError(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setLoadError(null);
    if (mode === "add") {
      reset();
      return;
    }
    if (!productId) return;
    let cancelled = false;
    void (async () => {
      try {
        const p = await fetchProductAdmin(productId);
        if (cancelled) return;
        applyProductToForm(p, {
          setSku,
          setOemLines,
          setStockAlertFast,
          setStockAlertMedium,
          setStockAlertSlow,
          setReservedPartBrand,
          setCategoryId,
          setPrice,
          setStock,
          setNameEn,
          setNameAr,
          setDescEn,
          setDescAr,
          setVehicleIds,
          setVehicleLabels,
        });
        setExistingImages(sortProductImages(p.images));
        setFiles([]);
        setVehicleSearch("");
        setFitmentComboOpen(false);
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            isApiError(e) ? e.message : e instanceof Error ? e.message : "Load failed",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, mode, productId, reset]);

  useEffect(() => {
    if (!fitmentComboOpen) return;
    const onDoc = (e: MouseEvent) => {
      const el = comboWrapRef.current;
      if (el && !el.contains(e.target as Node)) {
        setFitmentComboOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [fitmentComboOpen]);

  const addVehicleId = useCallback((id: number, label: string) => {
    setVehicleIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setVehicleLabels((prev) => ({ ...prev, [id]: label }));
  }, []);

  const removeVehicleId = useCallback((id: number) => {
    setVehicleIds((prev) => prev.filter((x) => x !== id));
    setVehicleLabels((prev) => {
      const rest = { ...prev };
      delete rest[id];
      return rest;
    });
  }, []);

  const deleteExistingImage = useCallback(
    async (img: ProductImagePreview) => {
      if (mode !== "edit" || !productId) return;
      const ok = window.confirm("Remove this image from the product?");
      if (!ok) return;
      setError(null);
      setDeletingImageId(img.id);
      try {
        await deleteAdminProductImage(productId, img.id);
        setExistingImages((prev) => prev.filter((i) => i.id !== img.id));
        onSaved();
      } catch (e) {
        setError(isApiError(e) ? e.message : e instanceof Error ? e.message : "Delete failed");
      } finally {
        setDeletingImageId(null);
      }
    },
    [mode, productId, onSaved],
  );

  const handleSubmit = useCallback(async () => {
    setError(null);
    const skuT = sku.trim();
    const nameEnT = nameEn.trim();
    const nameArT = nameAr.trim();
    const cat = Number.parseInt(String(categoryId).trim(), 10);
    const priceN = Number.parseFloat(price.trim());
    const stockN = Number.parseInt(stock.trim(), 10);
    if (!skuT) {
      setError("SKU is required.");
      return;
    }
    if (!Number.isFinite(cat) || cat < 1) {
      setError("Category is required.");
      return;
    }
    if (!nameEnT || !nameArT) {
      setError("Product name in English and Arabic is required.");
      return;
    }
    if (!Number.isFinite(priceN) || priceN < 0) {
      setError("Price must be a valid non-negative number.");
      return;
    }
    if (!Number.isFinite(stockN) || stockN < 0) {
      setError("Stock must be a valid non-negative integer.");
      return;
    }
    const oemNumbers = parseOemListFromText(oemLines);
    if (oemNumbers.length > 50) {
      setError("At most 50 OEM numbers are allowed.");
      return;
    }
    const tFast = parseOptionalThreshold(stockAlertFast);
    const tMed = parseOptionalThreshold(stockAlertMedium);
    const tSlow = parseOptionalThreshold(stockAlertSlow);
    if (tFast === "invalid" || tMed === "invalid" || tSlow === "invalid") {
      setError("Stock alert thresholds must be non-negative integers.");
      return;
    }
    if (!stockAlertsOrdered(tFast, tMed, tSlow)) {
      setError(
        "Stock alert thresholds must satisfy fast ≤ medium ≤ slow (when each tier is set).",
      );
      return;
    }
    const brandT = reservedPartBrand.trim() || DEFAULT_PART_BRAND;

    setSubmitting(true);
    try {
      let id: string;
      if (mode === "add") {
        const created = await createAdminProduct({
          sku: skuT,
          oemNumbers,
          categoryId: cat,
          brandName: brandT,
          nameEn: nameEnT,
          nameAr: nameArT,
          descEn: descEn.trim() || null,
          descAr: descAr.trim() || null,
          price: priceN,
          stockQuantity: stockN,
          isActive: true,
          isFeatured: false,
          stockAlertThresholdFast: tFast,
          stockAlertThresholdMedium: tMed,
          stockAlertThresholdSlow: tSlow,
        });
        id = created.id;
      } else {
        if (!productId) return;
        await updateAdminProduct(productId, {
          sku: skuT,
          oemNumbers,
          categoryId: cat,
          brandName: brandT,
          nameEn: nameEnT,
          nameAr: nameArT,
          descEn: descEn.trim() || null,
          descAr: descAr.trim() || null,
          price: priceN,
          stockQuantity: stockN,
          stockAlertThresholdFast: tFast,
          stockAlertThresholdMedium: tMed,
          stockAlertThresholdSlow: tSlow,
        });
        id = productId;
      }

      for (let i = 0; i < files.length; i += 1) {
        const f = files[i]!;
        const detail = await uploadAdminProductImage(id, f, {
          isMain: i === 0 && mode === "add",
        });
        setExistingImages(sortProductImages(detail.images));
      }

      await replaceAdminProductFitments(id, vehicleIds);

      onSaved();
      onClose();
      reset();
    } catch (e) {
      setError(isApiError(e) ? e.message : e instanceof Error ? e.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }, [
    sku,
    oemLines,
    stockAlertFast,
    stockAlertMedium,
    stockAlertSlow,
    reservedPartBrand,
    categoryId,
    price,
    stock,
    nameEn,
    nameAr,
    descEn,
    descAr,
    mode,
    productId,
    vehicleIds,
    files,
    onSaved,
    onClose,
    reset,
  ]);

  return (
    <>
    <WideModal
      open={open}
      onClose={onClose}
      title={mode === "add" ? "Add new product" : "Edit product"}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={submitting}
            className="gap-1.5"
            onClick={() => void handleSubmit()}
          >
            <Plus className="size-3.5" strokeWidth={2} />
            {mode === "add" ? "Save product" : "Save changes"}
          </Button>
          <Button type="button" variant="secondary" size="sm" disabled={submitting} onClick={onClose}>
            Cancel
          </Button>
        </div>
      }
    >
      <div className="space-y-2">
        {loadError ? <FieldError>{loadError}</FieldError> : null}
        {error ? <FieldError>{error}</FieldError> : null}

        <div className="grid gap-3 lg:grid-cols-2 lg:gap-4 lg:items-stretch">
          <section className={clsx(SECTION_CARD, "flex h-full flex-col")}>
            <h3 className="shrink-0 text-[0.7rem] font-bold uppercase tracking-wide text-primary">
              General
            </h3>
            <div className="mt-2 grid gap-2">
              <Field label="SKU">
                <Input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  disabled={mode === "edit"}
                  className={INPUT_CONTROL}
                />
              </Field>
              <Field label="OEM numbers">
                <textarea
                  value={oemLines}
                  onChange={(e) => setOemLines(e.target.value)}
                  placeholder="One per line or comma-separated — optional reference numbers"
                  className={OEM_LIST_TEXTAREA}
                  rows={3}
                />
              </Field>
              <Field label="Category">
                <Select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className={SELECT_CONTROL}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Price (SAR)">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={INPUT_CONTROL}
                  />
                </Field>
                <Field label="Stock">
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className={INPUT_CONTROL}
                  />
                </Field>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <Field label="Fast" className="min-w-0" labelClassName="whitespace-nowrap">
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={stockAlertFast}
                    onChange={(e) => setStockAlertFast(e.target.value)}
                    inputMode="numeric"
                    className={clsx(INPUT_CONTROL, NUMBER_NO_SPINNER)}
                  />
                </Field>
                <Field label="Medium" className="min-w-0" labelClassName="whitespace-nowrap">
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={stockAlertMedium}
                    onChange={(e) => setStockAlertMedium(e.target.value)}
                    inputMode="numeric"
                    className={clsx(INPUT_CONTROL, NUMBER_NO_SPINNER)}
                  />
                </Field>
                <Field label="Slow" className="min-w-0" labelClassName="whitespace-nowrap">
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={stockAlertSlow}
                    onChange={(e) => setStockAlertSlow(e.target.value)}
                    inputMode="numeric"
                    className={clsx(INPUT_CONTROL, NUMBER_NO_SPINNER)}
                  />
                </Field>
              </div>
              <p className="text-[0.65rem] leading-snug text-secondary">
                Optional stock alert tiers (fast → medium → slow): warn when quantity is at or below
                each threshold. Leave blank to disable. When set, use fast ≤ medium ≤ slow.
              </p>
            </div>
          </section>

          <section className={clsx(SECTION_CARD, "flex h-full flex-col")}>
            <h3 className="shrink-0 text-[0.7rem] font-bold uppercase tracking-wide text-primary">
              Bilingual content
            </h3>
            <div className="mt-2 flex min-h-0 flex-1 flex-col gap-2">
              <div className="grid shrink-0 gap-2 sm:grid-cols-2">
                <Field label="English">
                  <Input
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="Product name"
                    autoComplete="off"
                    className={INPUT_CONTROL}
                  />
                </Field>
                <Field label="العربية">
                  <Input
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="اسم المنتج"
                    dir="rtl"
                    autoComplete="off"
                    className={INPUT_CONTROL}
                  />
                </Field>
              </div>
              <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                <Field
                  label="Description (EN)"
                  className="flex min-h-0 flex-col lg:h-full"
                  contentClassName="flex min-h-0 flex-1 flex-col"
                >
                  <textarea
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    className={BILINGUAL_DESC_TEXTAREA}
                    placeholder="Long description (EN)"
                  />
                </Field>
                <Field
                  label="الوصف"
                  className="flex min-h-0 flex-col lg:h-full"
                  contentClassName="flex min-h-0 flex-1 flex-col"
                >
                  <textarea
                    value={descAr}
                    onChange={(e) => setDescAr(e.target.value)}
                    dir="rtl"
                    className={BILINGUAL_DESC_TEXTAREA}
                    placeholder="الوصف الكامل"
                  />
                </Field>
              </div>
            </div>
            <p className="mt-1.5 mb-0 shrink-0 text-[0.65rem] leading-snug text-secondary">
              English and Arabic fields are aligned in pairs for translation QA — layout uses
              logical spacing for RTL.
            </p>
          </section>
        </div>

        <section className={SECTION_CARD}>
          <div className="flex flex-wrap items-baseline justify-between gap-1.5">
            <h3 className="text-[0.7rem] font-bold uppercase tracking-wide text-primary">
              Vehicle fitment
            </h3>
            <p className="text-[0.65rem] text-secondary">Brand → Series → Chassis</p>
          </div>

          <div className="mt-2 space-y-2">
          <div ref={comboWrapRef} className="relative">
            <Label
              htmlFor={fitmentComboId}
              className="sr-only"
            >
              Search vehicles
            </Label>
            <SearchField
              id={fitmentComboId}
              className={SEARCH_COMBO_CLASS}
              inputClassName={SEARCH_INPUT_CLASS}
              value={vehicleSearch}
              onChange={(e) => {
                setVehicleSearch(e.target.value);
                setFitmentComboOpen(true);
              }}
              onFocus={() => setFitmentComboOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setFitmentComboOpen(false);
              }}
              placeholder="Type brand, series, or chassis (e.g. F30, BMW)…"
              leftAdornment={<Search className="size-3.5" strokeWidth={2} />}
              rightAdornment={
                <ChevronDown
                  className={clsx(
                    "size-3.5 text-secondary transition-transform",
                    fitmentComboOpen && "rotate-180",
                  )}
                  strokeWidth={2}
                  aria-hidden
                />
              }
              autoComplete="off"
            />
            {fitmentComboOpen ? (
              <ul
                className="absolute left-0 right-0 z-50 mt-1 max-h-44 overflow-y-auto rounded-lg border border-secondary/20 bg-white py-0.5 shadow-lg ring-1 ring-primary/5"
              >
                {renderVehicleDropdownRows(
                  vehicleList.loading,
                  vehicles,
                  (v) => {
                    addVehicleId(v.id, vehicleFitmentLabel(v));
                    setVehicleSearch("");
                    setFitmentComboOpen(false);
                  },
                )}
              </ul>
            ) : null}
          </div>

          <div className="rounded-lg border border-secondary/10 bg-background/40 px-2.5 py-2">
            {vehicleIds.length === 0 ? (
              <p className="text-[0.65rem] leading-tight text-secondary">No vehicles selected.</p>
            ) : (
              <ul className="space-y-1">
                {vehicleIds.map((id) => {
                  const label = vehicleLabels[id] ?? `Vehicle #${id}`;
                  return (
                    <li
                      key={id}
                      className="flex items-center justify-between gap-2 text-[0.65rem] text-foreground"
                    >
                      <span>{label}</span>
                      <button
                        type="button"
                        className="shrink-0 text-red-700 hover:underline"
                        onClick={() => removeVehicleId(id)}
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        </section>

        <section className={SECTION_CARD}>
          <h3 className="text-[0.7rem] font-bold uppercase tracking-wide text-primary">
            Product images
          </h3>
          <div className="mt-2 space-y-3">
            {mode === "edit" && existingImages.length > 0 ? (
              <div>
                <p className="mb-2 text-[0.65rem] leading-snug text-secondary">
                  Saved images — click a thumbnail to view full size. Trash removes it immediately.
                  The badge marks the catalog main image.
                </p>
                <div className="flex flex-wrap gap-2">
                  {existingImages.map((img) => {
                    const busy = submitting || deletingImageId !== null;
                    return (
                      <div
                        key={img.id}
                        className="group/saved relative"
                      >
                        <button
                          type="button"
                          className="relative size-14 overflow-hidden rounded-md border border-secondary/25 bg-secondary/5 ring-offset-2 transition hover:ring-2 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50"
                          disabled={busy}
                          onClick={() => setLightboxSrc(img.urlLarge)}
                          aria-label={img.isMain ? "View main image large" : "View image large"}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- API upload URLs */}
                          <img
                            src={img.urlThumb}
                            alt=""
                            className="size-full object-cover"
                          />
                          {img.isMain ? (
                            <span className="absolute left-0.5 top-0.5 rounded bg-primary px-1 py-px text-[0.5rem] font-bold uppercase leading-none text-white">
                              Main
                            </span>
                          ) : null}
                          <span className="absolute bottom-0.5 right-0.5 rounded bg-black/55 p-0.5 text-white opacity-0 transition group-hover/saved:opacity-100">
                            <Expand className="size-3" aria-hidden />
                          </span>
                        </button>
                        <button
                          type="button"
                          className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full border border-secondary/30 bg-white text-secondary shadow-sm hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                          aria-label="Delete image"
                          disabled={busy}
                          onClick={() => void deleteExistingImage(img)}
                        >
                          <Trash2 className="size-3" strokeWidth={2.5} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
            {mode === "edit" && existingImages.length === 0 && !loadError ? (
              <p className="text-[0.65rem] text-secondary">No saved images yet — add files below.</p>
            ) : null}

            <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-secondary/30 bg-background/50 px-4 py-4 text-center text-xs text-secondary">
              <ImageIcon className="size-7 stroke-1 text-secondary" aria-hidden />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                disabled={submitting}
                onChange={(e) => {
                  const list = Array.from(e.target.files ?? []);
                  setFiles((prev) => [...prev, ...list]);
                  e.target.value = "";
                }}
              />
              <span className="max-w-sm leading-snug">
                Drag &amp; drop images here or click to browse · JPEG / PNG / WebP · On{" "}
                <strong>create</strong>, the first file becomes main. On <strong>edit</strong>, new
                files append; main is unchanged unless you delete the main image.
              </span>
            </label>
            {files.length > 0 ? (
              <div>
                <p className="mb-1.5 text-[0.65rem] font-medium text-foreground">
                  New files (added when you save)
                </p>
                <div className="flex flex-wrap gap-2">
                  {files.map((f, ui) => (
                    <div
                      key={`${f.name}-${f.size}-${f.lastModified}-${ui}`}
                      className="group/thumb relative"
                    >
                      <div className="size-12 overflow-hidden rounded-md border border-secondary/20 bg-secondary/5">
                        {imagePreviewUrls[ui] ? (
                          // eslint-disable-next-line @next/next/no-img-element -- local object URLs from file picker
                          <img
                            src={imagePreviewUrls[ui]}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full border border-secondary/30 bg-white text-secondary shadow-sm hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                        aria-label={`Remove ${f.name}`}
                        disabled={submitting}
                        onClick={() => setFiles((prev) => prev.filter((_, j) => j !== ui))}
                      >
                        <X className="size-3" strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </WideModal>

    {lightboxSrc ? (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Image preview"
        onClick={() => setLightboxSrc(null)}
      >
        <button
          type="button"
          className="absolute right-4 top-4 z-10 rounded-lg bg-white/95 p-2 text-foreground shadow-md hover:bg-white"
          aria-label="Close preview"
          onClick={() => setLightboxSrc(null)}
        >
          <X className="size-5" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element -- full-size preview from API */}
        <img
          src={lightboxSrc}
          alt=""
          className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    ) : null}
    </>
  );
}

function Field({
  label,
  className,
  contentClassName,
  labelClassName,
  children,
}: Readonly<{
  label: string;
  className?: string;
  contentClassName?: string;
  labelClassName?: string;
  children: ReactNode;
}>) {
  return (
    <div className={className}>
      <Label
        className={clsx(
          "text-[0.6rem] font-semibold uppercase tracking-wide text-primary",
          labelClassName,
        )}
      >
        {label}
      </Label>
      <div className={clsx("mt-1", contentClassName)}>{children}</div>
    </div>
  );
}
