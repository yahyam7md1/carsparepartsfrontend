"use client";

import { useEffect, useState } from "react";
import { categoryBreadcrumbEn } from "@/admin/utils/categoryBreadcrumb";
import {
  fetchAdminCategoriesFlat,
  type AdminCategoryRow,
} from "@/lib/api/services/adminCategories";
import { isApiError } from "@/lib/api/errors";
import type { ProductListRow } from "@/lib/api/types";
import { FieldError } from "@/shared/ui";

type Props = Readonly<{
  rows: ProductListRow[];
  loading: boolean;
  error: string | null;
}>;

export function RecentlyAddedProductsCard({ rows, loading, error }: Props) {
  const [categories, setCategories] = useState<AdminCategoryRow[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const flat = await fetchAdminCategoriesFlat();
        if (!cancelled) setCategories(flat);
      } catch (e) {
        if (!cancelled) {
          setCategoriesError(
            isApiError(e) ? e.message : e instanceof Error ? e.message : "Failed to load categories",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-2xl border border-secondary/20 bg-white p-4 shadow-[0_6px_14px_rgba(15,23,42,0.08)]">
      <header className="mb-2 border-b border-secondary/10 pb-3">
        <div className="flex items-start gap-3">
          <span className="mt-1 h-10 w-1 rounded-full bg-accent" aria-hidden />
          <div>
            <h3 className="text-lg font-bold leading-tight text-primary">
              Recently Added Products
            </h3>
            <p className="mt-1 text-sm text-secondary">Products added to the system recently.</p>
          </div>
        </div>
      </header>

      {error ? <FieldError>{error}</FieldError> : null}
      {categoriesError ? <FieldError>{categoriesError}</FieldError> : null}
      {loading ? <p className="py-8 text-center text-sm text-secondary">Loading products…</p> : null}
      {!loading && rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-secondary">No products found.</p>
      ) : null}

      {!loading && rows.length > 0 ? (
        <>
          <ul className="md:hidden divide-y divide-secondary/10">
            {rows.map((row) => {
              const path =
                categoryBreadcrumbEn(row.categoryId, categories) || row.category.nameEn;
              return (
                <li key={row.id} className="space-y-1.5 px-1 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
                    {row.sku}
                  </p>
                  <p className="text-sm font-medium text-foreground">{row.nameEn}</p>
                  <p className="text-xs leading-snug text-secondary">{path}</p>
                </li>
              );
            })}
          </ul>
          <div className="hidden overflow-x-auto rounded-xl md:block">
            <table className="w-full min-w-0 text-sm">
            <thead className="bg-white">
              <tr className="border-b border-secondary/10 text-left">
                <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                  SKU
                </th>
                <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                  Product
                </th>
                <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                  Category
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/10">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-2.5 text-[12px] font-medium tabular-nums text-foreground">
                    {row.sku}
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="truncate text-[13px] font-medium text-foreground">{row.nameEn}</p>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-secondary">
                    {categoryBreadcrumbEn(row.categoryId, categories) || row.category.nameEn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      ) : null}
    </section>
  );
}
