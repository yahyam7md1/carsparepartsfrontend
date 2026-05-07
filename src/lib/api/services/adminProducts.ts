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

export async function replaceAdminProductFitments(
  productId: string,
  vehicleIds: number[],
): Promise<void> {
  await adminApi.put(`/api/admin/products/${encodeURIComponent(productId)}/fitments`, {
    vehicleIds,
  });
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
