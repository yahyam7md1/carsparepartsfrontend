import { adminApi } from "../adminClient";
import type { PaginatedProducts, ProductDetail } from "../types";

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
  return data;
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
  const { data } = await adminApi.post<{ product: ProductDetail }>(
    `/api/admin/products/${encodeURIComponent(productId)}/images`,
    form,
  );
  return data.product;
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
