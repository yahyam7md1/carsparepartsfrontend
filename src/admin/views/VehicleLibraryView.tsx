"use client";

import { Plus, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { AdminVehicleListRow } from "@/lib/api/types";
import { deleteAdminVehicle } from "@/lib/api/services/vehicles";
import { isApiError } from "@/lib/api/errors";
import { useAdminVehicles } from "@/hooks/useAdminVehicles";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Button, FieldError, Modal, SearchField } from "@/shared/ui";
import { VehicleCatalogModal } from "@/admin/components/vehicle-library/VehicleCatalogModal";
import { VehicleFormModal } from "@/admin/components/vehicle-library/VehicleFormModal";
import { VehicleLibraryTable } from "@/admin/components/vehicle-library/VehicleLibraryTable";

const PAGE_SIZE = 10;

export function VehicleLibraryView() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const listParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(debouncedSearch.trim() ? { q: debouncedSearch.trim() } : {}),
    }),
    [page, debouncedSearch],
  );

  const { data, loading, error, refetch } = useAdminVehicles({
    params: listParams,
  });

  const vehicles = data?.vehicles ?? [];
  const total = data?.total ?? 0;

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editing, setEditing] = useState<AdminVehicleListRow | null>(null);

  const [catalogVehicle, setCatalogVehicle] = useState<AdminVehicleListRow | null>(
    null,
  );

  const [deleteTarget, setDeleteTarget] = useState<AdminVehicleListRow | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openAdd = useCallback(() => {
    setFormMode("add");
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: AdminVehicleListRow) => {
    setFormMode("edit");
    setEditing(row);
    setFormOpen(true);
  }, []);

  const handleSearchChange = useCallback((v: string) => {
    setSearch(v);
    setPage(1);
  }, []);

  const runDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAdminVehicle(deleteTarget.id);
      setDeleteTarget(null);
      await refetch();
    } catch (e) {
      setDeleteError(
        isApiError(e) ? e.message : e instanceof Error ? e.message : "Delete failed",
      );
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, refetch]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">
            Vehicle Library
          </h1>
          <p className="mt-1 max-w-xl text-sm text-secondary">
            Manage the library of vehicles and their parts catalogs.
          </p>
          <p className="mt-2 text-xs text-secondary">
            {loading ? "Loading…" : `${total} ${total === 1 ? "row" : "rows"}`}
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          className="shrink-0 gap-2 self-start"
          onClick={openAdd}
        >
          <Plus className="size-4" strokeWidth={2} />
          Add vehicle
        </Button>
      </header>

      {error ? <FieldError>{error.message}</FieldError> : null}

      <SearchField
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search brand, series, specifics, years…"
        leftAdornment={<Search className="size-4" strokeWidth={2} />}
        autoComplete="off"
      />

      <VehicleLibraryTable
        vehicles={vehicles}
        loading={loading}
        total={total}
        page={page}
        limit={PAGE_SIZE}
        onPageChange={setPage}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onOpenCatalog={setCatalogVehicle}
      />

      <VehicleFormModal
        mode={formMode}
        vehicle={editing}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={() => void refetch()}
      />

      <VehicleCatalogModal
        open={catalogVehicle !== null}
        vehicle={catalogVehicle}
        onClose={() => setCatalogVehicle(null)}
      />

      <Modal
        open={deleteTarget !== null}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        title="Delete vehicle?"
        footer={
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="primary"
              className="bg-red-700 hover:opacity-95"
              disabled={deleting}
              onClick={() => void runDelete()}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={deleting}
              onClick={() => {
                setDeleteTarget(null);
                setDeleteError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        }
      >
        {deleteTarget ? (
          <div className="space-y-2 text-sm text-secondary">
            <p>
              This will remove{" "}
              <strong className="text-foreground">
                {deleteTarget.brand} {deleteTarget.series}
              </strong>{" "}
              from the library. Fitment links may be removed depending on backend rules.
            </p>
            {deleteError ? <FieldError>{deleteError}</FieldError> : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
