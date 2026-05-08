"use client";

import { Package, Pencil, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import type { ProductListRow } from "@/lib/api/types";
import { categoryBreadcrumbEn } from "@/admin/utils/categoryBreadcrumb";
import type { AdminCategoryRow } from "@/lib/api/services/adminCategories";
import { formatSar } from "@/shared/utils/formatSar";
import {
  Button,
  Input,
  LabeledSwitch,
  PageJumpControl,
  PillBadgeButton,
} from "@/shared/ui";

export type PriceChangeRequest = {
  productId: string;
  sku: string;
  previous: number;
  next: number;
};

export type StockChangeRequest = {
  productId: string;
  sku: string;
  previous: number;
  next: number;
};

export type ProductCatalogTableProps = Readonly<{
  products: ProductListRow[];
  categories: AdminCategoryRow[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onEdit: (row: ProductListRow) => void;
  onDelete: (row: ProductListRow) => void;
  onOpenFitments: (row: ProductListRow) => void;
  onOpenOem: (row: ProductListRow) => void;
  onToggleActive: (row: ProductListRow, active: boolean) => void;
  onRequestPriceChange: (req: PriceChangeRequest) => void;
  onRequestStockChange: (req: StockChangeRequest) => void;
}>;

function mainThumb(product: ProductListRow): string | null {
  const main = product.images.find((i) => i.isMain) ?? product.images[0];
  return main?.urlThumb ?? null;
}

function parsePriceString(price: string): number {
  return Number.parseFloat(price);
}

export function ProductCatalogTable({
  products,
  categories,
  loading,
  total,
  page,
  limit,
  onPageChange,
  onEdit,
  onDelete,
  onOpenFitments,
  onOpenOem,
  onToggleActive,
  onRequestPriceChange,
  onRequestStockChange,
}: ProductCatalogTableProps) {
  const [priceEditId, setPriceEditId] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState("");
  const [stockEditId, setStockEditId] = useState<string | null>(null);
  const [stockDraft, setStockDraft] = useState("");

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pages = Math.max(1, Math.ceil(total / limit));

  const commitPrice = useCallback(
    (row: ProductListRow) => {
      const prev = parsePriceString(row.price);
      const next = Number.parseFloat(priceDraft.trim());
      if (!Number.isFinite(next) || next < 0) {
        setPriceEditId(null);
        return;
      }
      if (next !== prev) {
        onRequestPriceChange({
          productId: row.id,
          sku: row.sku,
          previous: prev,
          next,
        });
      }
      setPriceEditId(null);
    },
    [priceDraft, onRequestPriceChange],
  );

  const commitStock = useCallback(
    (row: ProductListRow) => {
      const prev = row.stockQuantity;
      const next = Number.parseInt(stockDraft.trim(), 10);
      if (!Number.isFinite(next) || next < 0) {
        setStockEditId(null);
        return;
      }
      if (next !== prev) {
        onRequestStockChange({
          productId: row.id,
          sku: row.sku,
          previous: prev,
          next,
        });
      }
      setStockEditId(null);
    },
    [stockDraft, onRequestStockChange],
  );

  const beginPriceEdit = useCallback((row: ProductListRow) => {
    setPriceEditId(row.id);
    setPriceDraft(parsePriceString(row.price).toFixed(2));
  }, []);

  const beginStockEdit = useCallback((row: ProductListRow) => {
    setStockEditId(row.id);
    setStockDraft(String(row.stockQuantity));
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-secondary/20 bg-white shadow-sm ring-1 ring-primary/5">
      <ul className="md:hidden divide-y divide-secondary/10">
        {loading ? (
          <li className="px-4 py-12 text-center text-sm text-secondary">Loading…</li>
        ) : products.length === 0 ? (
          <li className="px-4 py-12 text-center text-sm text-secondary">
            No products match this search.
          </li>
        ) : (
          products.map((p) => {
            const thumb = mainThumb(p);
            const oemCount = p.oems?.length ?? 0;
            const fitCount = p.fitmentCount ?? 0;
            const path = categoryBreadcrumbEn(p.categoryId, categories);

            return (
              <li key={p.id} className="group/row space-y-3 px-3 py-4">
                <div className="flex gap-3">
                  <div
                    className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-secondary/15 bg-background"
                    title={
                      p.images.length === 0
                        ? "No images"
                        : `${p.images.length} image(s) — main shown`
                    }
                  >
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element -- admin URLs from API / uploads, any host
                      <img src={thumb} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-secondary">
                        <Package className="size-5" strokeWidth={1.5} />
                      </div>
                    )}
                    {p.images.length > 1 ? (
                      <span className="absolute bottom-0.5 right-0.5 min-w-[1rem] rounded bg-black/65 px-1 text-center text-[0.55rem] font-semibold leading-none text-white tabular-nums">
                        {p.images.length}
                      </span>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="font-semibold text-primary">{p.sku}</div>
                    <div className="font-semibold text-foreground">{p.nameEn}</div>
                    <div className="text-xs text-secondary" dir="rtl">
                      {p.nameAr}
                    </div>
                    <p className="line-clamp-2 text-xs leading-snug text-secondary">{path}</p>
                    <p className="text-xs font-medium text-foreground">{p.brandName}</p>
                  </div>
                  <div className="flex shrink-0 gap-1 self-start">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="min-h-9 min-w-9 p-0 text-secondary hover:text-primary"
                      onClick={() => onEdit(p)}
                      aria-label={`Edit ${p.sku}`}
                    >
                      <Pencil className="size-4" strokeWidth={2} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="min-h-9 min-w-9 p-0 text-secondary hover:text-red-700"
                      onClick={() => onDelete(p)}
                      aria-label={`Delete ${p.sku}`}
                    >
                      <Trash2 className="size-4" strokeWidth={2} />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <PillBadgeButton
                    type="button"
                    onClick={() => onOpenOem(p)}
                    disabled={oemCount === 0}
                  >
                    {oemCount === 0 ? "No OEM" : `View ${oemCount} OEM`}
                  </PillBadgeButton>
                  <PillBadgeButton type="button" onClick={() => onOpenFitments(p)}>
                    View {fitCount} {fitCount === 1 ? "car" : "cars"}
                  </PillBadgeButton>
                </div>
                <div className="flex flex-col gap-3 border-t border-secondary/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium uppercase tracking-wide text-secondary">
                        Price
                      </span>
                      {priceEditId === p.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          className="h-8 !w-[5rem] max-w-[5rem] shrink-0 px-2 py-1 text-xs tabular-nums"
                          value={priceDraft}
                          onChange={(e) => setPriceDraft(e.target.value)}
                          onBlur={() => commitPrice(p)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              commitPrice(p);
                            }
                            if (e.key === "Escape") {
                              setPriceEditId(null);
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <button
                          type="button"
                          className="rounded px-1 py-0.5 text-left text-foreground tabular-nums hover:bg-primary/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                          aria-label={`Edit price for ${p.sku}`}
                          onClick={() => beginPriceEdit(p)}
                        >
                          {formatSar(p.price)}
                        </button>
                      )}
                      <button
                        type="button"
                        className="rounded p-1 text-secondary opacity-100 transition-opacity hover:text-primary md:opacity-0 md:group-hover/row:opacity-100"
                        aria-label={`Edit price for ${p.sku}`}
                        onClick={() => beginPriceEdit(p)}
                      >
                        <Pencil className="size-3.5" strokeWidth={2} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium uppercase tracking-wide text-secondary">
                        Stock
                      </span>
                      {stockEditId === p.id ? (
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          className="h-8 !w-[5rem] max-w-[5rem] shrink-0 px-2 py-1 text-xs tabular-nums"
                          value={stockDraft}
                          onChange={(e) => setStockDraft(e.target.value)}
                          onBlur={() => commitStock(p)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              commitStock(p);
                            }
                            if (e.key === "Escape") {
                              setStockEditId(null);
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <button
                          type="button"
                          className="inline-flex min-w-[1.75rem] shrink-0 items-center justify-center rounded-md border border-secondary/20 bg-background px-1.5 py-0.5 text-foreground tabular-nums hover:bg-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                          aria-label={`Edit stock for ${p.sku}`}
                          onClick={() => beginStockEdit(p)}
                        >
                          {p.stockQuantity}
                        </button>
                      )}
                      <button
                        type="button"
                        className="rounded p-1 text-secondary opacity-100 transition-opacity hover:text-primary md:opacity-0 md:group-hover/row:opacity-100"
                        aria-label={`Edit stock for ${p.sku}`}
                        onClick={() => beginStockEdit(p)}
                      >
                        <Pencil className="size-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                  <LabeledSwitch
                    checked={p.isActive}
                    onCheckedChange={(active) => onToggleActive(p, active)}
                  />
                </div>
              </li>
            );
          })
        )}
      </ul>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-secondary/15 bg-background/80">
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-secondary">
                Image
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-secondary">
                SKU
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-secondary">
                Name
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-secondary">
                Category
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-secondary">
                Brand
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-secondary">
                OEM
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-secondary">
                Fitment
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-secondary">
                Price
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-secondary">
                Stock
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-secondary">
                Status
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary/10">
            {loading ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-secondary">
                  Loading…
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-secondary">
                  No products match this search.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const thumb = mainThumb(p);
                const oemCount = p.oems?.length ?? 0;
                const fitCount = p.fitmentCount ?? 0;
                const path = categoryBreadcrumbEn(p.categoryId, categories);

                return (
                  <tr
                    key={p.id}
                    className="group/row hover:bg-primary/[0.02]"
                  >
                    <td className="px-3 py-2 align-middle">
                      <div
                        className="relative size-11 overflow-hidden rounded-lg border border-secondary/15 bg-background"
                        title={
                          p.images.length === 0
                            ? "No images"
                            : `${p.images.length} image(s) — main shown`
                        }
                      >
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element -- admin URLs from API / uploads, any host
                          <img
                            src={thumb}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-secondary">
                            <Package className="size-5" strokeWidth={1.5} />
                          </div>
                        )}
                        {p.images.length > 1 ? (
                          <span className="absolute bottom-0.5 right-0.5 min-w-[1rem] rounded bg-black/65 px-1 text-center text-[0.55rem] font-semibold leading-none text-white tabular-nums">
                            {p.images.length}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="font-semibold text-primary">{p.sku}</div>
                    </td>
                    <td className="max-w-[200px] px-3 py-2 align-top">
                      <div className="truncate font-semibold text-foreground">
                        {p.nameEn}
                      </div>
                      <div className="truncate text-xs text-secondary" dir="rtl">
                        {p.nameAr}
                      </div>
                    </td>
                    <td className="max-w-[160px] px-3 py-2 align-top text-foreground">
                      <span className="line-clamp-2 text-xs leading-snug">{path}</span>
                    </td>
                    <td className="max-w-[120px] px-3 py-2 align-top">
                      <span className="line-clamp-2 text-xs font-medium text-foreground">
                        {p.brandName}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-middle text-center">
                      <div className="flex justify-center">
                        <PillBadgeButton
                          type="button"
                          onClick={() => onOpenOem(p)}
                          disabled={oemCount === 0}
                        >
                          {oemCount === 0
                            ? "No OEM"
                            : `View ${oemCount} OEM`}
                        </PillBadgeButton>
                      </div>
                    </td>
                    <td className="px-3 py-2 align-middle text-center">
                      <div className="flex justify-center">
                        <PillBadgeButton
                          type="button"
                          onClick={() => onOpenFitments(p)}
                        >
                          View {fitCount}{" "}
                          {fitCount === 1 ? "car" : "cars"}
                        </PillBadgeButton>
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="flex items-center gap-1">
                        {priceEditId === p.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            className="h-8 !w-[5rem] max-w-[5rem] shrink-0 px-2 py-1 text-xs tabular-nums"
                            value={priceDraft}
                            onChange={(e) => setPriceDraft(e.target.value)}
                            onBlur={() => commitPrice(p)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                commitPrice(p);
                              }
                              if (e.key === "Escape") {
                                setPriceEditId(null);
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <button
                            type="button"
                            className="rounded px-1 py-0.5 text-left text-foreground tabular-nums hover:bg-primary/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                            aria-label={`Edit price for ${p.sku}`}
                            onClick={() => beginPriceEdit(p)}
                          >
                            {formatSar(p.price)}
                          </button>
                        )}
                        <button
                          type="button"
                          className="rounded p-1 text-secondary opacity-100 transition-opacity hover:text-primary md:opacity-0 md:group-hover/row:opacity-100"
                          aria-label={`Edit price for ${p.sku}`}
                          onClick={() => beginPriceEdit(p)}
                        >
                          <Pencil className="size-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="flex items-center gap-1">
                        {stockEditId === p.id ? (
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            className="h-8 !w-[5rem] max-w-[5rem] shrink-0 px-2 py-1 text-xs tabular-nums"
                            value={stockDraft}
                            onChange={(e) => setStockDraft(e.target.value)}
                            onBlur={() => commitStock(p)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                commitStock(p);
                              }
                              if (e.key === "Escape") {
                                setStockEditId(null);
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <button
                            type="button"
                            className="inline-flex min-w-[1.75rem] shrink-0 items-center justify-center rounded-md border border-secondary/20 bg-background px-1.5 py-0.5 text-foreground tabular-nums hover:bg-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                            aria-label={`Edit stock for ${p.sku}`}
                            onClick={() => beginStockEdit(p)}
                          >
                            {p.stockQuantity}
                          </button>
                        )}
                        <button
                          type="button"
                          className="rounded p-1 text-secondary opacity-100 transition-opacity hover:text-primary md:opacity-0 md:group-hover/row:opacity-100"
                          aria-label={`Edit stock for ${p.sku}`}
                          onClick={() => beginStockEdit(p)}
                        >
                          <Pencil className="size-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <LabeledSwitch
                        checked={p.isActive}
                        onCheckedChange={(active) =>
                          onToggleActive(p, active)
                        }
                      />
                    </td>
                    <td className="px-3 py-2 align-top text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="min-h-9 min-w-9 p-0 text-secondary hover:text-primary"
                          onClick={() => onEdit(p)}
                          aria-label={`Edit ${p.sku}`}
                        >
                          <Pencil className="size-4" strokeWidth={2} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="min-h-9 min-w-9 p-0 text-secondary hover:text-red-700"
                          onClick={() => onDelete(p)}
                          aria-label={`Delete ${p.sku}`}
                        >
                          <Trash2 className="size-4" strokeWidth={2} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-secondary/15 px-4 py-3 text-xs text-secondary">
          <span>
            {from}–{to} of {total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <PageJumpControl
              page={page}
              pages={pages}
              loading={loading}
              onPageChange={onPageChange}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page >= pages || loading}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
