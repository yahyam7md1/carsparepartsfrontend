import type { AdminCategoryRow } from "@/lib/api/services/adminCategories";

export function categoryBreadcrumbEn(
  categoryId: number,
  flat: AdminCategoryRow[],
): string {
  const byId = new Map(flat.map((c) => [c.id, c]));
  const parts: string[] = [];
  let cur: AdminCategoryRow | undefined = byId.get(categoryId);
  while (cur) {
    parts.unshift(cur.nameEn);
    cur =
      cur.parentId != null ? byId.get(cur.parentId) : undefined;
  }
  return parts.join(" / ");
}
