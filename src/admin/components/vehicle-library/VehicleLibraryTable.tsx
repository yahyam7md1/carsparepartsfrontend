"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { AdminVehicleListRow } from "@/lib/api/types";
import { Button, PageJumpControl } from "@/shared/ui";

export type VehicleLibraryTableProps = Readonly<{
  vehicles: AdminVehicleListRow[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onEdit: (row: AdminVehicleListRow) => void;
  onDelete: (row: AdminVehicleListRow) => void;
  onOpenCatalog: (row: AdminVehicleListRow) => void;
}>;

export function VehicleLibraryTable({
  vehicles,
  loading,
  total,
  page,
  limit,
  onPageChange,
  onEdit,
  onDelete,
  onOpenCatalog,
}: VehicleLibraryTableProps) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="overflow-hidden rounded-2xl border border-secondary/20 bg-white shadow-sm ring-1 ring-primary/5">
      <ul className="md:hidden divide-y divide-secondary/10">
        {loading ? (
          <li className="px-4 py-12 text-center text-sm text-secondary">Loading…</li>
        ) : vehicles.length === 0 ? (
          <li className="px-4 py-12 text-center text-sm text-secondary">
            No vehicles match this search.
          </li>
        ) : (
          vehicles.map((v) => (
            <li key={v.id} className="space-y-3 px-3 py-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 space-y-1">
                  <p className="text-base font-semibold text-foreground">{v.brand}</p>
                  <p className="text-sm text-foreground">{v.series}</p>
                  <p className="text-xs text-secondary">{v.specifics}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {v.chassisCode}
                    </span>
                    <span className="text-sm text-foreground">{v.yearRange}</span>
                  </div>
                  <p className="text-xs text-secondary">
                    Generation:{" "}
                    {v.generation?.trim() ? (
                      <span className="text-foreground">{v.generation}</span>
                    ) : (
                      <span className="text-secondary/70">—</span>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="min-h-9 min-w-9 p-0 text-secondary hover:text-primary"
                    onClick={() => onEdit(v)}
                    aria-label={`Edit ${v.brand} ${v.chassisCode}`}
                  >
                    <Pencil className="size-4" strokeWidth={2} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="min-h-9 min-w-9 p-0 text-secondary hover:text-red-700"
                    onClick={() => onDelete(v)}
                    aria-label={`Delete ${v.brand} ${v.chassisCode}`}
                  >
                    <Trash2 className="size-4" strokeWidth={2} />
                  </Button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenCatalog(v)}
                className="inline-flex w-full justify-center rounded-full border border-secondary/20 bg-secondary/10 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-accent/40 hover:bg-accent/10 sm:w-auto sm:justify-start"
              >
                {v.fitmentCount ?? 0} {(v.fitmentCount ?? 0) === 1 ? "item" : "items"} in parts catalog
              </button>
            </li>
          ))
        )}
      </ul>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[920px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-secondary/15 bg-background/80">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-secondary">
                Brand
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-secondary">
                Series
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-secondary">
                Specifics
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-secondary">
                Chassis
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-secondary">
                Generation
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-secondary">
                Years
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-secondary">
                Parts catalog
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary/10">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-secondary">
                  Loading…
                </td>
              </tr>
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-secondary">
                  No vehicles match this search.
                </td>
              </tr>
            ) : (
              vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-primary/[0.02]">
                  <td className="px-4 py-3 align-top font-semibold text-foreground">
                    {v.brand}
                  </td>
                  <td className="px-4 py-3 align-top text-foreground">{v.series}</td>
                  <td className="px-4 py-3 align-top text-secondary">{v.specifics}</td>
                  <td className="px-4 py-3 align-top">
                    <span className="inline-flex rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {v.chassisCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-secondary">
                    {v.generation?.trim() ? (
                      <span className="text-foreground">{v.generation}</span>
                    ) : (
                      <span className="text-secondary/70">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top text-foreground">{v.yearRange}</td>
                  <td className="px-4 py-3 align-top">
                    <button
                      type="button"
                      onClick={() => onOpenCatalog(v)}
                      className="inline-flex rounded-full border border-secondary/20 bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-foreground transition-colors hover:border-accent/40 hover:bg-accent/10"
                    >
                      {v.fitmentCount ?? 0}{" "}
                      {(v.fitmentCount ?? 0) === 1 ? "item" : "items"}
                    </button>
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="min-h-9 min-w-9 p-0 text-secondary hover:text-primary"
                        onClick={() => onEdit(v)}
                        aria-label={`Edit ${v.brand} ${v.chassisCode}`}
                      >
                        <Pencil className="size-4" strokeWidth={2} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="min-h-9 min-w-9 p-0 text-secondary hover:text-red-700"
                        onClick={() => onDelete(v)}
                        aria-label={`Delete ${v.brand} ${v.chassisCode}`}
                      >
                        <Trash2 className="size-4" strokeWidth={2} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
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
