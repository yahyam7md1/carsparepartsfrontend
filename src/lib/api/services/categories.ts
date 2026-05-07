import { apiClient } from "../client";
import type { CategoryTreeNode } from "../types";

export async function fetchCategoryTree(): Promise<CategoryTreeNode[]> {
  const { data } = await apiClient.get<{ categories: CategoryTreeNode[] }>(
    "/api/categories",
  );
  return data.categories;
}
