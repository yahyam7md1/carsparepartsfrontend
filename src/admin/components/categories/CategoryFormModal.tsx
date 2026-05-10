"use client";

import type { AdminCategory } from "@/lib/api/types";
import {
  createAdminCategory,
  updateAdminCategory,
} from "@/lib/api/services/categories";
import { isApiError } from "@/lib/api/errors";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type CategoryFormModalProps = {
  open: boolean;
  mode: "add" | "edit";
  /** When mode=edit, the row being edited */
  editing: AdminCategory | null;
  /** Current flat list — roots used for parent picker + edit context */
  categories: AdminCategory[];
  onClose: () => void;
  onSaved: () => void;
};

type AddMode = "newParent" | "existingParent";

export function CategoryFormModal({
  open,
  mode,
  editing,
  categories,
  onClose,
  onSaved,
}: CategoryFormModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [addMode, setAddMode] = useState<AddMode>("newParent");
  const [existingParentId, setExistingParentId] = useState<string>("");

  const [parentEn, setParentEn] = useState("");
  const [parentAr, setParentAr] = useState("");
  const [subEn, setSubEn] = useState("");
  const [subAr, setSubAr] = useState("");

  const roots = useMemo(
    () =>
      categories
        .filter((c) => c.parentId == null)
        .sort((a, b) =>
          a.nameEn.localeCompare(b.nameEn, undefined, { sensitivity: "base" }),
        ),
    [categories],
  );

  const editParent = useMemo(() => {
    if (!editing?.parentId) return null;
    return categories.find((c) => c.id === editing.parentId) ?? null;
  }, [editing, categories]);

  useEffect(() => {
    if (!open) return;
    setSubmitError(null);
    if (mode === "add") {
      setAddMode("newParent");
      setExistingParentId(roots[0]?.id.toString() ?? "");
      setParentEn("");
      setParentAr("");
      setSubEn("");
      setSubAr("");
      return;
    }
    if (mode !== "edit" || editing == null) return;
    const latest = categories.find((c) => c.id === editing.id) ?? editing;
    setParentEn(latest.nameEn);
    setParentAr(latest.nameAr);
    setSubEn("");
    setSubAr("");
  }, [open, mode, editing?.id, categories, roots]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSaving(true);
    try {
      if (mode === "edit" && editing) {
        await updateAdminCategory(editing.id, {
          nameEn: parentEn.trim(),
          nameAr: parentAr.trim(),
        });
        onSaved();
        onClose();
        return;
      }

      if (addMode === "newParent") {
        const pe = parentEn.trim();
        const pa = parentAr.trim();
        if (!pe || !pa) {
          setSubmitError("Parent English and Arabic names are required.");
          setSaving(false);
          return;
        }
        const se = subEn.trim();
        const sa = subAr.trim();
        if (se || sa) {
          if (!se || !sa) {
            setSubmitError(
              "Provide both sub-category English and Arabic, or leave both sub-fields empty.",
            );
            setSaving(false);
            return;
          }
        }
        if (!se) {
          await createAdminCategory({
            nameEn: pe,
            nameAr: pa,
            parentId: null,
          });
        } else {
          const parent = await createAdminCategory({
            nameEn: pe,
            nameAr: pa,
            parentId: null,
          });
          await createAdminCategory({
            nameEn: se,
            nameAr: sa,
            parentId: parent.id,
          });
        }
      } else {
        const pid = Number(existingParentId);
        if (!Number.isFinite(pid) || pid < 1) {
          setSubmitError("Select a parent category.");
          setSaving(false);
          return;
        }
        const se = subEn.trim();
        const sa = subAr.trim();
        if (!se || !sa) {
          setSubmitError("Sub-category English and Arabic are required.");
          setSaving(false);
          return;
        }
        await createAdminCategory({
          nameEn: se,
          nameAr: sa,
          parentId: pid,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      if (isApiError(err)) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Something went wrong.");
      }
    } finally {
      setSaving(false);
    }
  }

  const title = mode === "add" ? "Add category" : "Edit category";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <h2
            id="category-modal-title"
            className="text-lg font-semibold text-[var(--primary)]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 p-5">
          {mode === "edit" && editing && (
            <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
              {editParent ? (
                <>
                  <div className="font-medium text-slate-900">Parent</div>
                  <div dir="ltr">{editParent.nameEn}</div>
                  <div dir="auto" className="text-slate-600">
                    {editParent.nameAr}
                  </div>
                </>
              ) : (
                <span>Top-level category (no parent)</span>
              )}
            </div>
          )}

          {mode === "add" && (
            <fieldset className="space-y-2">
              <legend className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Parent source
              </legend>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                <input
                  type="radio"
                  name="addMode"
                  checked={addMode === "newParent"}
                  onChange={() => setAddMode("newParent")}
                  className="border-slate-300 text-[var(--primary)]"
                />
                New parent category
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                <input
                  type="radio"
                  name="addMode"
                  checked={addMode === "existingParent"}
                  onChange={() => setAddMode("existingParent")}
                  className="border-slate-300 text-[var(--primary)]"
                />
                Add under existing parent
              </label>
            </fieldset>
          )}

          {mode === "add" && addMode === "existingParent" && (
            <div>
              <label
                htmlFor="existingParent"
                className="text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Parent category
              </label>
              <select
                id="existingParent"
                value={existingParentId}
                onChange={(e) => setExistingParentId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--primary)]"
                required
              >
                {roots.length === 0 ? (
                  <option value="">No parents — create a parent first</option>
                ) : (
                  roots.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nameEn} / {r.nameAr}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {(mode === "edit" || addMode === "newParent") && (
            <>
              <div>
                <label
                  htmlFor="parentEn"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  {mode === "add" ? "Parent category" : "Name (English)"}
                </label>
                <input
                  id="parentEn"
                  value={parentEn}
                  onChange={(e) => setParentEn(e.target.value)}
                  placeholder={
                    mode === "add"
                      ? "e.g. Brakes (existing or new)"
                      : undefined
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--primary)]"
                  required
                  disabled={mode === "add" && addMode === "existingParent"}
                />
              </div>
              <div>
                <label
                  htmlFor="parentAr"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  {mode === "add"
                    ? "Parent category — Arabic name"
                    : "Name (Arabic)"}
                </label>
                <input
                  id="parentAr"
                  value={parentAr}
                  onChange={(e) => setParentAr(e.target.value)}
                  placeholder={mode === "add" ? "مثال: الفرامل" : undefined}
                  dir="rtl"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--primary)]"
                  required
                  disabled={mode === "add" && addMode === "existingParent"}
                />
              </div>
            </>
          )}

          {mode === "add" && addMode === "newParent" && (
            <>
              <div>
                <label
                  htmlFor="subEn"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Sub-category (optional)
                </label>
                <input
                  id="subEn"
                  value={subEn}
                  onChange={(e) => setSubEn(e.target.value)}
                  placeholder="Leave blank for parent-only"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label
                  htmlFor="subAr"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Sub-category — Arabic (optional)
                </label>
                <input
                  id="subAr"
                  value={subAr}
                  onChange={(e) => setSubAr(e.target.value)}
                  placeholder="Optional if no sub-category"
                  dir="rtl"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <p className="text-xs text-slate-600">
                Reuse an existing parent English name from suggestions, or type
                a new one. Sub-category fields can be empty to add a parent group
                only.
              </p>
            </>
          )}

          {mode === "add" && addMode === "existingParent" && (
            <>
              <div>
                <label
                  htmlFor="subEnEx"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Sub-category (English)
                </label>
                <input
                  id="subEnEx"
                  value={subEn}
                  onChange={(e) => setSubEn(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--primary)]"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="subArEx"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Sub-category — Arabic
                </label>
                <input
                  id="subArEx"
                  value={subAr}
                  onChange={(e) => setSubAr(e.target.value)}
                  dir="rtl"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--primary)]"
                  required
                />
              </div>
            </>
          )}

          {submitError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {submitError}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                saving || (addMode === "existingParent" && roots.length === 0)
              }
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : mode === "add" ? "+ Add category" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
