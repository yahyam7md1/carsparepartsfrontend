import { adminApi } from "../adminClient";
import type { PaginatedProducts, ProductDetail, ProductListRow } from "../types";

/**
 * Admin list should expose `fitmentCount`. Older API builds spread Prisma rows and only
 * provide `_count.fitments`; normalize so badges stay correct.
 */
function normalizeAdminProductListRow(p: ProductListRow): ProductListRow {
  const raw = p as ProductListRow & {
    _count?: { fitments?: number };
    fitment_count?: number;
  };
  const explicit =
    typeof raw.fitmentCount === "number" && !Number.isNaN(raw.fitmentCount)
      ? raw.fitmentCount
      : undefined;
  const nested =
    typeof raw._count?.fitments === "number" ? raw._count.fitments : undefined;
  const snake =
    typeof raw.fitment_count === "number" ? raw.fitment_count : undefined;
  const fitmentCount = explicit ?? nested ?? snake ?? 0;
  return { ...p, fitmentCount };
}

export type AdminProductListParams = {
  page?: number;
  limit?: number;
  categoryId?: number;
  brandName?: string;
  vehicleId?: number;
  chassisCode?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  q?: string;
};

export type CreateAdminProductBody = {
  sku: string;
  oemNumber?: string | null;
  categoryId: number;
  brandName: string;
  nameEn: string;
  nameAr: string;
  descEn?: string | null;
  descAr?: string | null;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  dimensions?: string | null;
  weight?: number | null;
  manufacturedIn?: string | null;
  generation?: string | null;
  condition?: "new" | "used";
};

export type UpdateAdminProductBody = Partial<CreateAdminProductBody>;

export async function fetchAdminProducts(
  params?: AdminProductListParams,
): Promise<PaginatedProducts> {
  const { data } = await adminApi.get<PaginatedProducts>("/api/admin/products", {
    params,
  });
  return {
    ...data,
    products: data.products.map(normalizeAdminProductListRow),
  };
}

export async function fetchProductAdmin(id: string): Promise<ProductDetail> {
  const { data } = await adminApi.get<{ product: ProductDetail }>(
    `/api/admin/products/${encodeURIComponent(id)}`,
  );
  return data.product;
}

export async function createAdminProduct(
  body: CreateAdminProductBody,
): Promise<ProductDetail> {
  const { data } = await adminApi.post<{ product: ProductDetail }>(
    "/api/admin/products",
    body,
  );
  return data.product;
}

export async function updateAdminProduct(
  id: string,
  body: UpdateAdminProductBody,
): Promise<ProductDetail> {
  const { data } = await adminApi.put<{ product: ProductDetail }>(
    `/api/admin/products/${encodeURIComponent(id)}`,
    body,
  );
  return data.product;
}

export async function deleteAdminProduct(id: string): Promise<void> {
  await adminApi.delete(`/api/admin/products/${encodeURIComponent(id)}`);
}

export async function patchAdminProductInventory(
  id: string,
  stockQuantity: number,
): Promise<ProductDetail> {
  const { data } = await adminApi.patch<{ product: ProductDetail }>(
    `/api/admin/products/${encodeURIComponent(id)}/inventory`,
    { stockQuantity } satisfies { stockQuantity: number },
  );
  return data.product;
}

export async function replaceAdminProductFitments(
  productId: string,
  vehicleIds: number[],
): Promise<void> {
  await adminApi.put(`/api/admin/products/${encodeURIComponent(productId)}/fitments`, {
    vehicleIds,
  });
}

export async function uploadAdminProductImage(
  productId: string,
  file: File,
  meta?: { isMain?: boolean; sortOrder?: number },
): Promise<ProductDetail> {
  const form = new FormData();
  form.append("file", file);
  if (meta?.isMain === true) form.append("isMain", "true");
  if (meta?.sortOrder !== undefined) {
    form.append("sortOrder", String(meta.sortOrder));
  }
  /**
   * `adminApi` defaults to `Content-Type: application/json`. With that header,
   * axios turns `FormData` into JSON and no file reaches multer — 400.
   * Omit Content-Type so the browser sets `multipart/form-data` + boundary.
   */
  const { data } = await adminApi.post<{ product: ProductDetail }>(
    `/api/admin/products/${encodeURIComponent(productId)}/images`,
    form,
    { headers: { "Content-Type": false } },
  );
  return data.product;
}

export async function deleteAdminProductImage(
  productId: string,
  imageId: string,
): Promise<void> {
  await adminApi.delete(
    `/api/admin/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`,
  );
}

/** Adds one vehicle to a product’s fitment set without dropping existing links. */
export async function appendVehicleToProductFitments(
  productId: string,
  vehicleId: number,
): Promise<void> {
  const product = await fetchProductAdmin(productId);
  const ids = new Set(product.fitments.map((f) => f.vehicleId));
  if (ids.has(vehicleId)) return;
  ids.add(vehicleId);
  await replaceAdminProductFitments(productId, [...ids]);
}
