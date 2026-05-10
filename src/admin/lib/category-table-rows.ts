import type { AdminCategory } from "@/lib/api/types";

function nameMatches(c: AdminCategory, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase();
  return (
    c.nameEn.toLowerCase().includes(n) || c.nameAr.toLowerCase().includes(n)
  );
}

/** IDs to show: self-match, ancestors of matches, and full subtree when a root matches search. */
export function getVisibleCategoryIds(
  flat: AdminCategory[],
  query: string,
): Set<number> {
  const q = query.trim();
  const byId = new Map(flat.map((c) => [c.id, c] as const));
  const visible = new Set<number>();

  for (const c of flat) {
    if (!nameMatches(c, q)) continue;
    visible.add(c.id);
    let pid: number | null = c.parentId;
    while (pid != null) {
      visible.add(pid);
      const par = byId.get(pid);
      pid = par?.parentId ?? null;
    }
  }

  for (const c of flat) {
    if (c.parentId != null) continue;
    if (!nameMatches(c, q)) continue;
    for (const ch of flat) {
      if (ch.parentId === c.id) visible.add(ch.id);
    }
  }

  return visible;
}

export type CategoryTableRowModel = {
  parent: AdminCategory;
  child: AdminCategory | null;
  isFirstInGroup: boolean;
};

export function buildCategoryTableRows(
  flat: AdminCategory[],
  visible: Set<number>,
): CategoryTableRowModel[] {
  const roots = flat
    .filter((c) => c.parentId == null)
    .filter(
      (r) =>
        visible.has(r.id) ||
        flat.some((ch) => ch.parentId === r.id && visible.has(ch.id)),
    )
    .sort((a, b) => {
      const cmp = a.nameEn.localeCompare(b.nameEn, undefined, {
        sensitivity: "base",
      });
      return cmp !== 0 ? cmp : a.id - b.id;
    });

  const rows: CategoryTableRowModel[] = [];

  for (const root of roots) {
    const children = flat
      .filter((ch) => ch.parentId === root.id && visible.has(ch.id))
      .sort((a, b) => {
        const cmp = a.nameEn.localeCompare(b.nameEn, undefined, {
          sensitivity: "base",
        });
        return cmp !== 0 ? cmp : a.id - b.id;
      });

    if (children.length > 0) {
      children.forEach((child, idx) => {
        rows.push({
          parent: root,
          child,
          isFirstInGroup: idx === 0,
        });
      });
    } else if (visible.has(root.id)) {
      rows.push({
        parent: root,
        child: null,
        isFirstInGroup: true,
      });
    }
  }

  return rows;
}

export function countDistinctParents(rows: CategoryTableRowModel[]): number {
  return new Set(rows.map((r) => r.parent.id)).size;
}

/** Direct product count on this category only (API shape). */
function directProductCount(c: AdminCategory): number {
  const n = c.productCount;
  if (typeof n !== "number" || !Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

/** Sum of direct counts on `rootId` and all descendants in `flat`. */
export function rollupProductCountIncludingDescendants(
  rootId: number,
  flat: AdminCategory[],
): number {
  const self = flat.find((c) => c.id === rootId);
  const direct = self ? directProductCount(self) : 0;
  const children = flat.filter((c) => c.parentId === rootId);
  return (
    direct +
    children.reduce(
      (sum, ch) => sum + rollupProductCountIncludingDescendants(ch.id, flat),
      0,
    )
  );
}

export type CategoryRowProductBadge = Readonly<{
  /** Number to show prominently in the Products cell */
  displayCount: number;
  kind: "sub" | "parent";
  /** Direct assignments on this row’s category */
  directOnRow: number;
  /** For parents: includes all subcategories */
  totalIncludingDescendants: number;
}>;

export function getProductBadgeForCategoryRow(
  row: CategoryTableRowModel,
  flat: AdminCategory[],
): CategoryRowProductBadge {
  if (row.child) {
    const d = directProductCount(row.child);
    return {
      displayCount: d,
      kind: "sub",
      directOnRow: d,
      totalIncludingDescendants: d,
    };
  }
  const direct = directProductCount(row.parent);
  const total = rollupProductCountIncludingDescendants(row.parent.id, flat);
  return {
    displayCount: total,
    kind: "parent",
    directOnRow: direct,
    totalIncludingDescendants: total,
  };
}
