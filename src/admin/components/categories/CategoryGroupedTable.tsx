"use client";

import type { CategoryTableRowModel } from "@/admin/lib/category-table-rows";
import type { AdminCategory } from "@/lib/api/types";
import { clsx } from "clsx";
import { CornerDownRight, Pencil, Search, Tag, Trash2 } from "lucide-react";

type CategoryGroupedTableProps = {
  rows: CategoryTableRowModel[];
  searchValue: string;
  onSearchChange: (v: string) => void;
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

function partCountDisplay(productCount: number | undefined): {
  count: number;
  label: string;
} {
  const n =
    typeof productCount === "number" &&
    Number.isFinite(productCount) &&
    productCount >= 0
      ? Math.floor(productCount)
      : 0;
  return { count: n, label: n === 1 ? "Part" : "Parts" };
}

export function CategoryGroupedTable({
  rows,
  searchValue,
  onSearchChange,
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
      <div className="overflow-x-auto">
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
                /** Row actions target the leaf row (sub-category or parent-only). */
                const productRow = row.child ?? row.parent;
                /**
                 * Parts badge = products on the **parent** only (API `productCount` for main category).
                 * Sub-category rows still edit/delete the sub; counts ignore child-only totals per product brief.
                 */
                const { count: partCount, label: partLabel } = partCountDisplay(
                  row.parent.productCount,
                );
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
                      <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-900">
                        {partCount} {partLabel}
                      </span>
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
