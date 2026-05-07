"use client";

import { Package, Pencil, Trash2 } from "lucide-react";
import clsx from "clsx";
import { useCallback, useState } from "react";
import type { ProductListRow } from "@/lib/api/types";
import { categoryBreadcrumbEn } from "@/admin/utils/categoryBreadcrumb";
import type { AdminCategoryRow } from "@/lib/api/services/adminCategories";
import { formatSar } from "@/shared/utils/formatSar";
import { Button, Input, PageJumpControl } from "@/shared/ui";

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

  return (
    <div className="overflow-hidden rounded-2xl border border-secondary/20 bg-white shadow-sm ring-1 ring-primary/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1060px] border-collapse text-left text-sm">
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
                OEM
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-secondary">
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
                <td colSpan={10} className="px-4 py-12 text-center text-secondary">
                  Loading…
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-secondary">
                  No products match this search.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const thumb = mainThumb(p);
                const oemCount = p.oemNumber?.trim() ? 1 : 0;
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
                    <td className="px-3 py-2 align-top">
                      <button
                        type="button"
                        onClick={() => onOpenOem(p)}
                        disabled={oemCount === 0}
                        className={clsx(
                          "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                          oemCount === 0
                            ? "cursor-not-allowed border-secondary/15 bg-secondary/5 text-secondary"
                            : "border-secondary/20 bg-secondary/10 text-foreground hover:border-accent/40 hover:bg-accent/10",
                        )}
                      >
                        {oemCount === 0
                          ? "No OEM"
                          : `View ${oemCount} OEM`}
                      </button>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <button
                        type="button"
                        onClick={() => onOpenFitments(p)}
                        className="inline-flex rounded-full border border-secondary/20 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-primary transition-colors hover:border-accent/40 hover:bg-accent/15"
                      >
                        View {fitCount} {fitCount === 1 ? "car" : "cars"}
                      </button>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="flex items-center gap-1">
                        {priceEditId === p.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            className="h-9 w-24 px-2 py-1 text-xs"
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
                          <span className="text-foreground">{formatSar(p.price)}</span>
                        )}
                        <button
                          type="button"
                          className="rounded p-1 text-secondary opacity-0 transition-opacity group-hover/row:opacity-100 hover:text-primary"
                          aria-label={`Edit price for ${p.sku}`}
                          onClick={() => {
                            setPriceEditId(p.id);
                            setPriceDraft(parsePriceString(p.price).toFixed(2));
                          }}
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
                            className="h-9 w-16 px-2 py-1 text-xs"
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
                          <span className="inline-flex min-w-[2rem] rounded-md border border-secondary/20 bg-background px-2 py-0.5 text-foreground">
                            {p.stockQuantity}
                          </span>
                        )}
                        <button
                          type="button"
                          className="rounded p-1 text-secondary opacity-0 transition-opacity group-hover/row:opacity-100 hover:text-primary"
                          aria-label={`Edit stock for ${p.sku}`}
                          onClick={() => {
                            setStockEditId(p.id);
                            setStockDraft(String(p.stockQuantity));
                          }}
                        >
                          <Pencil className="size-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={p.isActive}
                        onClick={() => onToggleActive(p, !p.isActive)}
                        className={clsx(
                          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-secondary/25 transition-colors",
                          p.isActive ? "bg-emerald-500/90" : "bg-secondary/20",
                        )}
                      >
                        <span
                          className={clsx(
                            "inline-block size-5 translate-x-1 transform rounded-full bg-white shadow transition-transform",
                            p.isActive ? "translate-x-5" : "translate-x-0.5",
                          )}
                        />
                      </button>
                      <span
                        className={clsx(
                          "ms-2 inline-flex items-center gap-1 text-xs",
                          p.isActive ? "text-emerald-700" : "text-secondary",
                        )}
                      >
                        <span
                          className={clsx(
                            "size-1.5 rounded-full",
                            p.isActive ? "bg-emerald-500" : "bg-secondary",
                          )}
                        />
                        {p.isActive ? "Active" : "Hidden"}
                      </span>
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
