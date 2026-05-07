import { adminApi } from "../adminClient";
import { apiClient } from "../client";
import type { AdminCategory, CategoryTreeNode } from "../types";

/** Coerce API values so counts display correctly (handles missing or stringified numbers). */
function toNonNegativeInt(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return fallback;
}

function tryNormalizeAdminCategory(row: unknown): AdminCategory | null {
  if (row === null || typeof row !== "object") {
    return null;
  }
  const r = row as Record<string, unknown>;
  const id = Number(r.id);
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }
  const parentRaw = r.parentId;
  const parentId =
    parentRaw === null || parentRaw === undefined
      ? null
      : Number(parentRaw);
  if (parentId !== null && (!Number.isFinite(parentId) || parentId <= 0)) {
    return null;
  }

  return {
    id,
    parentId,
    nameEn: String(r.nameEn ?? ""),
    nameAr: String(r.nameAr ?? ""),
    slug: String(r.slug ?? ""),
    productCount: toNonNegativeInt(r.productCount),
  };
}

export async function fetchCategoryTree(): Promise<CategoryTreeNode[]> {
  const { data } = await apiClient.get<{ categories: CategoryTreeNode[] }>(
    "/api/categories",
  );
  return data.categories;
}

export type CreateAdminCategoryBody = {
  nameEn: string;
  nameAr: string;
  parentId?: number | null;
  slug?: string;
};

export type UpdateAdminCategoryBody = {
  nameEn?: string;
  nameAr?: string;
  parentId?: number | null;
  slug?: string;
};

/** Backend Prisma row (no productCount on single-resource responses). */
export type AdminCategoryPayload = Omit<AdminCategory, "productCount">;

export async function fetchAdminCategories(): Promise<AdminCategory[]> {
  const { data } = await adminApi.get<{ categories: unknown }>(
    "/api/admin/categories",
  );
  const list = data?.categories;
  if (!Array.isArray(list)) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[fetchAdminCategories] expected categories array");
    }
    return [];
  }
  const normalized = list
    .map(tryNormalizeAdminCategory)
    .filter((c): c is AdminCategory => c !== null);
  if (
    process.env.NODE_ENV === "development" &&
    normalized.length !== list.length
  ) {
    console.warn(
      "[fetchAdminCategories] dropped",
      list.length - normalized.length,
      "invalid row(s)",
    );
  }
  return normalized;
}

export async function createAdminCategory(
  body: CreateAdminCategoryBody,
): Promise<AdminCategoryPayload> {
  const { data } = await adminApi.post<{ category: AdminCategoryPayload }>(
    "/api/admin/categories",
    {
      nameEn: body.nameEn,
      nameAr: body.nameAr,
      ...(body.parentId !== undefined ? { parentId: body.parentId } : {}),
      ...(body.slug !== undefined && body.slug !== "" ? { slug: body.slug } : {}),
    },
  );
  return data.category;
}

export async function updateAdminCategory(
  id: number,
  body: UpdateAdminCategoryBody,
): Promise<AdminCategoryPayload> {
  const { data } = await adminApi.put<{ category: AdminCategoryPayload }>(
    `/api/admin/categories/${id}`,
    body,
  );
  return data.category;
}

export async function deleteAdminCategory(id: number): Promise<void> {
  await adminApi.delete(`/api/admin/categories/${id}`);
}
