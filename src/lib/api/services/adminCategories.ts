import { adminApi } from "../adminClient";

export type AdminCategoryRow = {
  id: number;
  parentId: number | null;
  nameEn: string;
  nameAr: string;
  slug: string;
};

export async function fetchAdminCategoriesFlat(): Promise<AdminCategoryRow[]> {
  const { data } = await adminApi.get<{ categories: AdminCategoryRow[] }>(
    "/api/admin/categories",
  );
  return data.categories;
}
