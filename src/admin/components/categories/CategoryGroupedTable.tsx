"use client";

import type { CategoryTableRowModel } from "@/admin/lib/category-table-rows";
import {
  getProductBadgeForCategoryRow,
} from "@/admin/lib/category-table-rows";
import type { AdminCategory } from "@/lib/api/types";
import { clsx } from "clsx";
import { CornerDownRight, Pencil, Search, Tag, Trash2 } from "lucide-react";

type CategoryGroupedTableProps = {
  rows: CategoryTableRowModel[];
  /** Full flat list — used for rolled-up parent product totals */
  allCategories: AdminCategory[];
  searchValue: string;
  onSearchChange: (v: string) => void;
  onOpenProducts: (category: AdminCategory) => void;
  onEdit: (category: AdminCategory) => void;
  onDelete: (category: AdminCategory) => void;
};

function BilingualCell({
  nameEn,
  nameAr,
  alignAr = false,
}: {
  nameEn: string;
  nameAr: string;
  alignAr?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="truncate font-medium text-slate-900">{nameEn}</div>
      <div
        className={clsx(
          "truncate text-sm text-slate-600",
          alignAr && "text-end",
        )}
        dir="auto"
      >
        {nameAr}
      </div>
    </div>
  );
}

function ProductsBadge({
  row,
  flat,
  onOpenProducts,
}: {
  row: CategoryTableRowModel;
  flat: AdminCategory[];
  onOpenProducts: (category: AdminCategory) => void;
}) {
  const badge = getProductBadgeForCategoryRow(row, flat);
  const targetCategory = row.child ?? row.parent;
  const n = badge.displayCount;
  const label = n === 1 ? "Part" : "Parts";
  if (badge.kind === "sub") {
    return (
      <button
        type="button"
        onClick={() => onOpenProducts(targetCategory)}
        className="group inline-flex cursor-pointer flex-col gap-0.5 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-900"
        title="Products assigned directly to this subcategory"
      >
        <span className="group-hover:underline">
          {n} {label}
        </span>
        <span className="text-[0.65rem] font-normal text-sky-800/90">Subcategory</span>
      </button>
    );
  }
  const direct = badge.directOnRow;
  const total = badge.totalIncludingDescendants;
  const hasSplit = total !== direct;
  return (
    <button
      type="button"
      onClick={() => onOpenProducts(targetCategory)}
      className="group inline-flex cursor-pointer flex-col gap-0.5 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-900"
      title={
        hasSplit
          ? `${total} products under this category tree (${direct} on parent only, ${total - direct} in subcategories)`
          : `${total} products (parent category only)`
      }
    >
      <span className="group-hover:underline">
        {total} {total === 1 ? "Part" : "Parts"}{" "}
        <span className="font-normal text-[0.7rem] text-sky-800/85">total</span>
      </span>
      {hasSplit ? (
        <span className="text-[0.65rem] font-normal text-sky-800/90">
          {direct} on parent · {total - direct} in subs
        </span>
      ) : (
        <span className="text-[0.65rem] font-normal text-sky-800/90">Parent</span>
      )}
    </button>
  );
}

export function CategoryGroupedTable({
  rows,
  allCategories,
  searchValue,
  onSearchChange,
  onOpenProducts,
  onEdit,
  onDelete,
}: CategoryGroupedTableProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="relative border-b border-slate-200 px-4 py-3">
        <Search
          className="pointer-events-none absolute left-7 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search English or Arabic…"
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25"
        />
      </div>
      <div className="md:hidden divide-y divide-slate-100">
        {rows.length === 0 ? (
          <div className="px-4 py-12 text-center text-slate-600">
            No categories match your search.
          </div>
        ) : (
          rows.map((row, i) => {
            const productRow = row.child ?? row.parent;
            const key = row.child ? `c-${row.child.id}` : `p-${row.parent.id}-${i}`;
            return (
              <div key={key} className="space-y-3 px-4 py-4">
                {row.child ? (
                  <div className="space-y-2">
                    <div className="flex gap-3">
                      <Tag
                        className="mt-0.5 size-4 shrink-0 text-[var(--primary)]"
                        aria-hidden
                      />
                      <BilingualCell
                        nameEn={row.parent.nameEn}
                        nameAr={row.parent.nameAr}
                      />
                    </div>
                    <div className="flex gap-2 border-s-2 border-slate-100 ps-3">
                      <CornerDownRight
                        className="mt-1 size-4 shrink-0 text-slate-400"
                        aria-hidden
                      />
                      <BilingualCell
                        nameEn={row.child.nameEn}
                        nameAr={row.child.nameAr}
                        alignAr
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Tag
                      className="mt-0.5 size-4 shrink-0 text-[var(--primary)]"
                      aria-hidden
                    />
                    <BilingualCell
                      nameEn={row.parent.nameEn}
                      nameAr={row.parent.nameAr}
                    />
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <ProductsBadge row={row} flat={allCategories} onOpenProducts={onOpenProducts} />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(productRow)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      aria-label={`Edit ${productRow.nameEn}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(productRow)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${productRow.nameEn}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Parent
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Sub-category
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Products
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-slate-600"
                >
                  No categories match your search.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => {
                const productRow = row.child ?? row.parent;
                const key = row.child
                  ? `c-${row.child.id}`
                  : `p-${row.parent.id}-${i}`;
                return (
                  <tr
                    key={key}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="max-w-[220px] px-4 py-3 align-top">
                      {row.isFirstInGroup ? (
                        <div className="flex gap-3">
                          <Tag
                            className="mt-0.5 size-4 shrink-0 text-[var(--primary)]"
                            aria-hidden
                          />
                          <BilingualCell
                            nameEn={row.parent.nameEn}
                            nameAr={row.parent.nameAr}
                          />
                        </div>
                      ) : (
                        <span className="text-slate-400">&nbsp;</span>
                      )}
                    </td>
                    <td className="max-w-[220px] px-4 py-3 align-top">
                      {row.child ? (
                        <div className="flex gap-2 pl-1">
                          <CornerDownRight
                            className="mt-1 size-4 shrink-0 text-slate-400"
                            aria-hidden
                          />
                          <BilingualCell
                            nameEn={row.child.nameEn}
                            nameAr={row.child.nameAr}
                            alignAr
                          />
                        </div>
                      ) : (
                        <span className="pl-7 text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <ProductsBadge row={row} flat={allCategories} onOpenProducts={onOpenProducts} />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(productRow)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          aria-label={`Edit ${productRow.nameEn}`}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(productRow)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${productRow.nameEn}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
