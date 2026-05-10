import type { AppLocale } from "@/i18n/routing";
import type { CategoryTreeNode } from "@/lib/api/types";

function categoryLabel(node: CategoryTreeNode, locale: AppLocale): string {
  return locale === "ar" ? node.nameAr : node.nameEn;
}

function findPathById(
  tree: CategoryTreeNode[],
  targetId: number,
  path: CategoryTreeNode[] = [],
): CategoryTreeNode[] | null {
  for (const node of tree) {
    const nextPath = [...path, node];
    if (node.id === targetId) return nextPath;
    const childPath = findPathById(node.children, targetId, nextPath);
    if (childPath) return childPath;
  }
  return null;
}

export function categoryBreadcrumbFromTree(
  tree: CategoryTreeNode[],
  categoryId: number,
  locale: AppLocale,
  separator = " > ",
): string | null {
  const path = findPathById(tree, categoryId);
  if (!path || path.length === 0) return null;
  return path.map((node) => categoryLabel(node, locale)).join(separator);
}
