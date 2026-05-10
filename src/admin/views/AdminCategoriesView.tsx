"use client";

import { CategoryFormModal } from "@/admin/components/categories/CategoryFormModal";
import { CategoryGroupedTable } from "@/admin/components/categories/CategoryGroupedTable";
import {
  buildCategoryTableRows,
  countDistinctParents,
  getVisibleCategoryIds,
} from "@/admin/lib/category-table-rows";
import { isApiError } from "@/lib/api/errors";
import {
  deleteAdminCategory,
  fetchAdminCategories,
} from "@/lib/api/services/categories";
import type { AdminCategory } from "@/lib/api/types";
import { useCallback, useEffect, useMemo, useState } from "react";

export function AdminCategoriesView() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editing, setEditing] = useState<AdminCategory | null>(null);

  const refresh = useCallback(async () => {
    setLoadError(null);
    try {
      const rows = await fetchAdminCategories();
      setCategories(rows);
    } catch (e) {
      if (isApiError(e)) {
        setLoadError(e.message);
      } else {
        setLoadError("Failed to load categories.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const visibleIds = useMemo(
    () => getVisibleCategoryIds(categories, search),
    [categories, search],
  );

  const tableRows = useMemo(
    () => buildCategoryTableRows(categories, visibleIds),
    [categories, visibleIds],
  );

  const parentCount = countDistinctParents(tableRows);

  function openAdd() {
    setModalMode("add");
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(c: AdminCategory) {
    setModalMode("edit");
    setEditing(c);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  async function handleDelete(c: AdminCategory) {
    const ok = window.confirm(
      `Delete “${c.nameEn}”?\n You can only delete a category if it has no sub-categories and no products use it. Move or reassign products in Inventory first, and remove child categories before deleting a parent.`,
    );
    if (!ok) return;
    try {
      await deleteAdminCategory(c.id);
      await refresh();
    } catch (e) {
      if (isApiError(e)) {
        window.alert(
          e.status === 409
            ? `${e.message}\n\nTip: Products still point at this category id in the database, or it still has sub-categories.`
            : e.message,
        );
      } else {
        window.alert("Delete failed.");
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Categories
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Manage the categories &amp; sub-categories of products.
          </p>
          <p className="mt-2 text-sm text-secondary">
            {!loading && !loadError ? (
              <>
                {tableRows.length} / {categories.length} rows · {parentCount}{" "}
                {parentCount === 1 ? "parent" : "parents"}
              </>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          + Add category
        </button>
      </div>

      {loadError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {loadError}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-secondary">Loading categories…</p>
      ) : (
        <CategoryGroupedTable
          rows={tableRows}
          allCategories={categories}
          searchValue={search}
          onSearchChange={setSearch}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <CategoryFormModal
        open={modalOpen}
        mode={modalMode}
        editing={editing}
        categories={categories}
        onClose={closeModal}
        onSaved={() => void refresh()}
      />
    </div>
  );
}
