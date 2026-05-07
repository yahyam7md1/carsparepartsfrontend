import { apiClient } from "../client";
import type {
  PaginatedProducts,
  ProductDetail,
  ProductFitmentsResponse,
} from "../types";

export type PublicProductListParams = {
  page?: number;
  limit?: number;
  categoryId?: number;
  categorySlug?: string;
  vehicleId?: number;
  oem?: string;
  q?: string;
};

export async function fetchProductsPublic(
  params?: PublicProductListParams,
): Promise<PaginatedProducts> {
  const { data } = await apiClient.get<PaginatedProducts>("/api/products", {
    params,
  });
  return data;
}

export type FeaturedProductsParams = {
  page?: number;
  limit?: number;
};

export async function fetchFeaturedProducts(
  params?: FeaturedProductsParams,
): Promise<PaginatedProducts> {
  const { data } = await apiClient.get<PaginatedProducts>(
    "/api/products/featured",
    { params },
  );
  return data;
}

export async function fetchProductPublic(id: string): Promise<ProductDetail> {
  const { data } = await apiClient.get<{ product: ProductDetail }>(
    `/api/products/${encodeURIComponent(id)}`,
  );
  return data.product;
}

export async function fetchProductFitments(
  productId: string,
): Promise<ProductFitmentsResponse> {
  const { data } = await apiClient.get<ProductFitmentsResponse>(
    `/api/products/${encodeURIComponent(productId)}/fitments`,
  );
  return data;
}
